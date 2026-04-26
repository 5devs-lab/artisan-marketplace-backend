import { Router } from 'express';
import { WalletController } from './wallet.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

// All wallet routes require authentication except webhook
router.use(protect);

// Get user wallet
router.get('/', WalletController.getWallet);

// Get transaction history
router.get('/transactions', WalletController.getTransactionHistory);

// Initialize deposit (Paystack)
router.post('/deposit/initialize', WalletController.initializeDeposit);

// Verify payment status
router.get('/deposit/verify/:reference', WalletController.verifyPayment);

// Get transaction status
router.get('/transaction/:transactionId', WalletController.getTransactionStatus);

// Paystack webhook (no auth required)
router.post('/webhook/paystack', WalletController.handlePaystackWebhook);

// Lock funds in escrow
router.post('/escrow/lock', WalletController.lockEscrowFunds);

// Release escrow funds
router.post('/escrow/release', WalletController.releaseEscrowFunds);

export default router;
