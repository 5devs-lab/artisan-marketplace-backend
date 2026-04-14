import { Response, NextFunction } from 'express';
import { WalletService } from './wallet.service';
import { Types } from 'mongoose';
import config from '../../config/env.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class WalletController {
  // Get user wallet
  static async getWallet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user._id; // User ID from auth middleware
      const wallet = await WalletService.getUserWallet(userId);

      if (!wallet) {
        // Create wallet if it doesn't exist
        const newWallet = await WalletService.createWallet(userId);
        res.status(201).json({
          success: true,
          data: newWallet
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction history
  static async getTransactionHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user._id;
      const wallet = await WalletService.getUserWallet(userId);

      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await WalletService.getTransactionHistory(wallet._id, page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Initialize deposit (create transaction for Paystack)
  static async initializeDeposit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user._id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
        return;
      }

      const wallet = await WalletService.getUserWallet(userId);
      if (!wallet) {
        const newWallet = await WalletService.createWallet(userId);
      }

      // Generate reference for Paystack
      const reference = `DEP_${Date.now()}_${userId.toString().slice(-6)}`;
      
      // Create pending transaction
      const transaction = await WalletService.createTransaction(
        wallet?._id || new Types.ObjectId(),
        amount,
        'DEPOSIT' as any,
        new Types.ObjectId(), // Will be updated with actual Paystack reference
        `Wallet deposit of ₦${amount}`
      );

      // Initialize Paystack payment
      const paystackResponse = await initializePaystackPayment(amount, reference, req.user.email);

      // Update transaction with Paystack reference
      await (transaction as any).save();

      res.status(200).json({
        success: true,
        data: {
          authorization_url: (paystackResponse as any).data.authorization_url,
          reference: (paystackResponse as any).data.reference,
          access_code: (paystackResponse as any).data.access_code
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Paystack webhook handler
  static async handlePaystackWebhook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      const isValid = WalletService.verifyPaystackWebhook(
        payload,
        signature || '',
        config.PAYSTACK_SECRET_KEY || ''
      );

      if (!isValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
        return;
      }

      // Process the webhook event
      await WalletService.processPaystackWebhook(req.body);

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }

  // Lock funds in escrow (for job creation)
  static async lockEscrowFunds(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user._id;
      const { amount, jobId } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
        return;
      }

      const wallet = await WalletService.getUserWallet(userId);
      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
        return;
      }

      const transaction = await WalletService.lockEscrowFunds(
        wallet._id,
        amount,
        new Types.ObjectId(jobId)
      );

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  // Release escrow funds (for job completion)
  static async releaseEscrowFunds(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId, artisanAmount, commissionAmount, walletId } = req.body;

      if (!jobId || !artisanAmount || commissionAmount === undefined || !walletId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
        return;
      }

      const result = await WalletService.releaseEscrowFunds(
        new Types.ObjectId(walletId),
        new Types.ObjectId(jobId),
        artisanAmount,
        commissionAmount
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

// Helper function to initialize Paystack payment
async function initializePaystackPayment(amount: number, reference: string, email: string) {
  const https = require('https');
  const url = 'https://api.paystack.co/transaction/initialize';

  const params = JSON.stringify({
    amount: amount * 100, // Convert to kobo
    email,
    reference,
    callback_url: `${config.CLIENT_URL}/wallet/deposit/success`
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': params.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (error: any) => {
      reject(error);
    });

    req.write(params);
    req.end();
  });
}
