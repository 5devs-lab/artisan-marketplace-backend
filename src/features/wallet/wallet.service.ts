import { Wallet, Transaction, IWallet, ITransaction, TransactionType } from './wallet.models';
import { Types } from 'mongoose';
import crypto from 'crypto';

export class WalletService {
  // Create wallet for new user
  static async createWallet(userId: Types.ObjectId): Promise<IWallet> {
    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
      throw new Error('Wallet already exists for this user');
    }

    const wallet = new Wallet({
      userId,
      balance: 0,
      escrowBalance: 0,
      currency: 'NGN'
    });

    return await wallet.save();
  }

  // Get user wallet
  static async getUserWallet(userId: Types.ObjectId): Promise<IWallet | null> {
    return await Wallet.findOne({ userId });
  }

  // Create transaction
  static async createTransaction(
    walletId: Types.ObjectId,
    amount: number,
    type: TransactionType,
    referenceId: Types.ObjectId,
    description: string,
    feeApplied: number = 0
  ): Promise<ITransaction> {
    const transaction = new Transaction({
      walletId,
      amount,
      type,
      status: 'PENDING',
      referenceId,
      metadata: {
        description,
        feeApplied
      }
    });

    return await transaction.save();
  }

  // Process Paystack webhook for successful payment
  static async processPaystackWebhook(event: any): Promise<void> {
    const { event: eventType, data } = event;

    if (eventType === 'charge.success') {
      await this.handleSuccessfulCharge(data);
    } else if (eventType === 'charge.failed') {
      await this.handleFailedCharge(data);
    } else if (eventType === 'transfer.success') {
      await this.handleSuccessfulTransfer(data);
    } else if (eventType === 'transfer.failed') {
      await this.handleFailedTransfer(data);
    }
  }

  // Handle successful charge (deposit)
  private static async handleSuccessfulCharge(chargeData: any): Promise<void> {
    const { reference, amount, customer } = chargeData;
    
    // Find the pending transaction
    const transaction = await Transaction.findOne({
      referenceId: reference,
      type: TransactionType.DEPOSIT,
      status: 'PENDING'
    });

    if (!transaction) {
      console.log(`No pending transaction found for reference: ${reference}`);
      return;
    }

    // Update transaction status
    transaction.status = 'SUCCESS';
    await (transaction as any).save();

    // Update wallet balance
    await Wallet.findByIdAndUpdate(
      transaction.walletId,
      { $inc: { balance: amount / 100 } }, // Paystack amount is in kobo
      { new: true }
    );
  }

  // Handle failed charge
  private static async handleFailedCharge(chargeData: any): Promise<void> {
    const { reference } = chargeData;
    
    const transaction = await Transaction.findOne({
      referenceId: reference,
      type: TransactionType.DEPOSIT,
      status: 'PENDING'
    });

    if (transaction) {
      transaction.status = 'FAILED';
      await (transaction as any).save();
    }
  }

  // Handle successful transfer (payout)
  private static async handleSuccessfulTransfer(transferData: any): Promise<void> {
    const { reference, amount } = transferData;
    
    const transaction = await Transaction.findOne({
      referenceId: reference,
      type: TransactionType.PAYOUT,
      status: 'PENDING'
    });

    if (transaction) {
      transaction.status = 'SUCCESS';
      await (transaction as any).save();
    }
  }

  // Handle failed transfer
  private static async handleFailedTransfer(transferData: any): Promise<void> {
    const { reference } = transferData;
    
    const transaction = await Transaction.findOne({
      referenceId: reference,
      type: TransactionType.PAYOUT,
      status: 'PENDING'
    });

    if (transaction) {
      transaction.status = 'FAILED';
      await (transaction as any).save();
      
      // Refund the wallet balance if payout failed
      await Wallet.findByIdAndUpdate(
        transaction.walletId,
        { $inc: { balance: transaction.amount } },
        { new: true }
      );
    }
  }

  // Lock funds in escrow
  static async lockEscrowFunds(walletId: Types.ObjectId, amount: number, jobId: Types.ObjectId): Promise<ITransaction> {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create escrow lock transaction
    const transaction = await this.createTransaction(
      walletId,
      amount,
      TransactionType.ESCROW_LOCK,
      jobId,
      `Funds locked for job ${jobId}`
    );

    // Update wallet balances
    wallet.balance -= amount;
    wallet.escrowBalance += amount;
    await wallet.save();

    // Mark transaction as successful
    transaction.status = 'SUCCESS';
    await (transaction as any).save();

    return transaction;
  }

  // Release escrow funds (payout + commission)
  static async releaseEscrowFunds(
    walletId: Types.ObjectId,
    jobId: Types.ObjectId,
    artisanAmount: number,
    commissionAmount: number
  ): Promise<{ payoutTransaction: ITransaction; commissionTransaction: ITransaction }> {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.escrowBalance < (artisanAmount + commissionAmount)) {
      throw new Error('Insufficient escrow balance');
    }

    // Create payout transaction (95% to artisan)
    const payoutTransaction = await this.createTransaction(
      walletId,
      artisanAmount,
      TransactionType.PAYOUT,
      jobId,
      `Payout for job completion - 95%`,
      0
    );

    // Create commission transaction (5% to platform)
    const commissionTransaction = await this.createTransaction(
      walletId,
      commissionAmount,
      TransactionType.COMMISSION,
      jobId,
      `Platform commission - 5%`,
      commissionAmount
    );

    // Update wallet balances
    wallet.escrowBalance -= (artisanAmount + commissionAmount);
    await wallet.save();

    // Mark transactions as successful
    payoutTransaction.status = 'SUCCESS';
    commissionTransaction.status = 'SUCCESS';
    await (payoutTransaction as any).save();
    await (commissionTransaction as any).save();

    return { payoutTransaction, commissionTransaction };
  }

  // Get transaction history
  static async getTransactionHistory(walletId: Types.ObjectId, page: number = 1, limit: number = 20): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find({ walletId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('referenceId', 'title'); // Populate job details if reference is a job

    const total = await Transaction.countDocuments({ walletId });

    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Verify Paystack webhook signature
  static verifyPaystackWebhook(payload: string, signature: string, secret: string): boolean {
    const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
    return hash === signature;
  }
}
