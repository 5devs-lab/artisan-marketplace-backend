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

      // Generate unique reference for Paystack
      const reference = WalletService.generateReference(userId);
      
      // Create pending transaction
      const transaction = await WalletService.createTransaction(
        wallet?._id || new Types.ObjectId(),
        amount,
        'DEPOSIT' as any,
        new Types.ObjectId(), // Will be updated with actual Paystack reference
        `Wallet deposit of ₦${amount}`
      );

      // Initialize Paystack payment using SDK
      const paystackResponse = await WalletService.initializePaystackPayment(
        amount,
        req.user.email,
        reference
      );

      // Update transaction with Paystack reference
      transaction.referenceId = new Types.ObjectId(paystackResponse.reference);
      await (transaction as any).save();

      res.status(200).json({
        success: true,
        data: {
          authorization_url: paystackResponse.authorization_url,
          reference: paystackResponse.reference,
          access_code: paystackResponse.access_code,
          transactionId: transaction._id
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
      const { amount, jobId, phoneNumber, jobTitle } = req.body;

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
        new Types.ObjectId(jobId),
        phoneNumber,
        jobTitle
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
      const { jobId, artisanAmount, commissionAmount, phoneNumber, jobTitle } = req.body;

      if (!jobId || !artisanAmount || commissionAmount === undefined) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
        return;
      }

      // Get user's wallet to prevent unauthorized access
      const userId = req.user._id;
      const wallet = await WalletService.getUserWallet(userId);
      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
        return;
      }

      const result = await WalletService.releaseEscrowFunds(
        wallet._id,
        new Types.ObjectId(jobId),
        artisanAmount,
        commissionAmount,
        phoneNumber,
        jobTitle
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify payment status
  static async verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reference } = req.params;
      const referenceStr = Array.isArray(reference) ? reference[0] : reference;

      if (!referenceStr) {
        res.status(400).json({
          success: false,
          message: 'Reference is required'
        });
        return;
      }

      const paymentData = await WalletService.verifyPayment(referenceStr);

      res.status(200).json({
        success: true,
        data: paymentData
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction status
  static async getTransactionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transactionId } = req.params;
      const transactionIdStr = Array.isArray(transactionId) ? transactionId[0] : transactionId;

      if (!transactionIdStr) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      const transaction = await WalletService.getTransactionStatus(new Types.ObjectId(transactionIdStr));

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }
}
