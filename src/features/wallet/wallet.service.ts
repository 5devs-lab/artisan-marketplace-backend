import { Wallet, Transaction, IWallet, ITransaction, TransactionType } from './wallet.models';
import { Types } from 'mongoose';
import crypto from 'crypto';
import paystack from 'paystack';
import config from '../../config/env.js';
import { SMSService } from '../sms/sms.service';

// Initialize Paystack client
const paystackClient = paystack(config.PAYSTACK_SECRET_KEY || '');

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
    const wallet = await Wallet.findByIdAndUpdate(
      transaction.walletId,
      { $inc: { balance: amount / 100 } }, // Paystack amount is in kobo
      { new: true }
    );

    // Send SMS notification for successful deposit
    if (wallet && customer?.phone) {
      try {
        await SMSService.sendWalletFundingNotification(
          customer.phone,
          amount / 100,
          reference,
          wallet.balance
        );
      } catch (smsError) {
        console.error('Failed to send SMS notification:', smsError);
        // Don't fail the transaction if SMS fails
      }
    }
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

  // Lock funds in escrow using MongoDB Transactions
  static async lockEscrowFunds(
    walletId: Types.ObjectId,
    amount: number,
    jobId: Types.ObjectId,
    phoneNumber?: string,
    jobTitle?: string
  ): Promise<ITransaction> {
    const session = await Wallet.startSession();
    
    try {
      // Start transaction
      session.startTransaction();

      // Get wallet with session for transaction
      const wallet = await Wallet.findById(walletId).session(session);
      if (!wallet) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Wallet not found');
      }

      // Check balance with transaction lock
      if (wallet.balance < amount) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Insufficient balance');
      }

      // Create escrow lock transaction within transaction
      const transaction = new Transaction({
        walletId,
        amount,
        type: TransactionType.ESCROW_LOCK,
        status: 'PENDING',
        referenceId: jobId,
        metadata: {
          description: `Funds locked for job ${jobId}`,
          feeApplied: 0
        }
      });

      await transaction.save({ session });

      // Update wallet balances atomically
      await Wallet.findByIdAndUpdate(
        walletId,
        {
          $inc: {
            balance: -amount,
            escrowBalance: amount
          }
        },
        { session, new: true }
      );

      // Mark transaction as successful
      transaction.status = 'SUCCESS';
      await transaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Send SMS notification for escrow lock
      if (phoneNumber && jobTitle) {
        try {
          await SMSService.sendEscrowLockNotification(phoneNumber, amount, jobTitle);
        } catch (smsError) {
          console.error('Failed to send SMS notification:', smsError);
          // Don't fail the transaction if SMS fails
        }
      }

      return transaction;
    } catch (error: any) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Escrow lock transaction error:', error);
      throw new Error(error.message || 'Failed to lock escrow funds');
    }
  }

  // Release escrow funds (payout + commission) using MongoDB Transactions
  static async releaseEscrowFunds(
    walletId: Types.ObjectId,
    jobId: Types.ObjectId,
    artisanAmount: number,
    commissionAmount: number,
    phoneNumber?: string,
    jobTitle?: string
  ): Promise<{ payoutTransaction: ITransaction; commissionTransaction: ITransaction }> {
    const session = await Wallet.startSession();
    
    try {
      // Start transaction
      session.startTransaction();

      // Get wallet with session for transaction
      const wallet = await Wallet.findById(walletId).session(session);
      if (!wallet) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Wallet not found');
      }

      // Check escrow balance with transaction lock
      const totalAmount = artisanAmount + commissionAmount;
      if (wallet.escrowBalance < totalAmount) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Insufficient escrow balance');
      }

      // Create payout transaction (95% to artisan) within transaction
      const payoutTransaction = new Transaction({
        walletId,
        amount: artisanAmount,
        type: TransactionType.PAYOUT,
        status: 'PENDING',
        referenceId: jobId,
        metadata: {
          description: `Payout for job completion - 95%`,
          feeApplied: 0
        }
      });

      await payoutTransaction.save({ session });

      // Create commission transaction (5% to platform) within transaction
      const commissionTransaction = new Transaction({
        walletId,
        amount: commissionAmount,
        type: TransactionType.COMMISSION,
        status: 'PENDING',
        referenceId: jobId,
        metadata: {
          description: `Platform commission - 5%`,
          feeApplied: commissionAmount
        }
      });

      await commissionTransaction.save({ session });

      // Update wallet balances atomically
      await Wallet.findByIdAndUpdate(
        walletId,
        {
          $inc: {
            escrowBalance: -totalAmount
          }
        },
        { session, new: true }
      );

      // Mark transactions as successful
      payoutTransaction.status = 'SUCCESS';
      commissionTransaction.status = 'SUCCESS';
      await payoutTransaction.save({ session });
      await commissionTransaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Send SMS notification for escrow release
      if (phoneNumber && jobTitle) {
        try {
          await SMSService.sendEscrowReleaseNotification(phoneNumber, totalAmount, jobTitle);
        } catch (smsError) {
          console.error('Failed to send SMS notification:', smsError);
          // Don't fail the transaction if SMS fails
        }
      }

      return { payoutTransaction, commissionTransaction };
    } catch (error: any) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Escrow release transaction error:', error);
      throw new Error(error.message || 'Failed to release escrow funds');
    }
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

  // Initialize Paystack payment using SDK
  static async initializePaystackPayment(
    amount: number,
    email: string,
    reference: string,
    callbackUrl?: string
  ): Promise<any> {
    try {
      const paymentData = {
        amount: amount * 100, // Convert to kobo
        email,
        reference,
        name: 'Wallet Deposit', // Required by Paystack SDK
        callback_url: callbackUrl || `${config.CLIENT_URL}/wallet/deposit/success`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Reference',
              variable_name: 'reference',
              value: reference
            }
          ]
        }
      };

      const response = await paystackClient.transaction.initialize(paymentData);
      
      if (response.status) {
        return response.data;
      } else {
        throw new Error(response.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Paystack initialization error:', error);
      throw new Error(error.message || 'Failed to initialize payment');
    }
  }

  // Verify payment status using SDK
  static async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await paystackClient.transaction.verify(reference);
      
      if (response.status) {
        return response.data;
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Paystack verification error:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
  }

  // Get transaction status
  static async getTransactionStatus(transactionId: Types.ObjectId): Promise<ITransaction | null> {
    try {
      const transaction = await Transaction.findById(transactionId);
      return transaction;
    } catch (error: any) {
      console.error('Transaction status check error:', error);
      throw new Error('Failed to get transaction status');
    }
  }

  // Generate unique reference
  static generateReference(userId: Types.ObjectId): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const userIdSuffix = userId.toString().slice(-6);
    return `DEP_${timestamp}_${random}_${userIdSuffix}`;
  }
}
