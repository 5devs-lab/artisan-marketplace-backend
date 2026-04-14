import { Schema, model, Types } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',      // Paystack funding
  ESCROW_LOCK = 'ESCROW_LOCK',
  PAYOUT = 'PAYOUT',        // 95% to Artisan
  COMMISSION = 'COMMISSION', // 5% to Platform
  REFUND = 'REFUND'
}

export interface IWallet {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;          // Spendable money
  escrowBalance: number;    // Funds locked in active jobs
  currency: string;         // Default: 'NGN'
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  _id: Types.ObjectId;
  walletId: Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  referenceId: Types.ObjectId; // JobId or Paystack Ref
  metadata: {
    description: string;
    feeApplied: number;        // The 5% if applicable
  };
  createdAt: Date;
  updatedAt: Date;
}

// Wallet Schema
const walletSchema = new Schema<IWallet>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  escrowBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN',
    uppercase: true
  }
}, {
  timestamps: true
});

// Transaction Schema
const transactionSchema = new Schema<ITransaction>({
  walletId: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  metadata: {
    description: {
      type: String,
      required: true
    },
    feeApplied: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
walletSchema.index({ userId: 1 });
transactionSchema.index({ walletId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });

export const Wallet = model<IWallet>('Wallet', walletSchema);
export const Transaction = model<ITransaction>('Transaction', transactionSchema);
