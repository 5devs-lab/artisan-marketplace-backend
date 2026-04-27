import config from '../../config/env.js';

export enum SMSType {
  JOB_ALERT = 'JOB_ALERT',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  ESCROW_LOCK = 'ESCROW_LOCK',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  WALLET_FUNDING = 'WALLET_FUNDING'
}

export interface SMSData {
  phoneNumber: string;
  type: SMSType;
  data: {
    amount?: number;
    jobTitle?: string;
    reference?: string;
    balance?: number;
    artisanName?: string;
  };
}

export class SMSService {
  // Send SMS using Termii HTTP API
  static async sendSMS(phoneNumber: string, message: string): Promise<any> {
    try {
      if (!config.TERMII_API_KEY) {
        console.warn('Termii API key not configured. SMS sending skipped.');
        return { status: 'skipped', message: 'SMS service not configured' };
      }

      const response = await fetch('https://api.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          from: config.TERMII_SENDER_ID || 'Artisan',
          sms: message,
          type: 'plain',
          channel: 'dnd',
          api_key: config.TERMII_API_KEY
        })
      });

      const data = await response.json();
      console.log('SMS sent successfully:', data);
      return data;
    } catch (error: any) {
      console.error('SMS sending error:', error);
      throw new Error(error.message || 'Failed to send SMS');
    }
  }

  // Generate SMS message based on type
  static generateMessage(type: SMSType, data: any): string {
    switch (type) {
      case SMSType.JOB_ALERT:
        return `New Job Alert: ${data.jobTitle || 'A new job'} is available on Artisan Marketplace. Check your dashboard for details.`;

      case SMSType.PAYMENT_RECEIPT:
        return `Payment Receipt: ₦${data.amount} received successfully. Ref: ${data.reference || 'N/A'}. Balance: ₦${data.balance || 0}. Thank you for using Artisan Marketplace.`;

      case SMSType.ESCROW_LOCK:
        return `Escrow Lock: ₦${data.amount} has been locked for job "${data.jobTitle || 'your job'}". Funds are secure until job completion.`;

      case SMSType.ESCROW_RELEASE:
        return `Escrow Release: ₦${data.amount} has been released for job "${data.jobTitle || 'your job'}". Payment processed successfully.`;

      case SMSType.WALLET_FUNDING:
        return `Wallet Funded: Your wallet has been credited with ₦${data.amount}. New balance: ₦${data.balance}. Ref: ${data.reference || 'N/A'}.`;

      default:
        return 'Notification from Artisan Marketplace.';
    }
  }

  // Send SMS based on type and data
  static async sendNotification(smsData: SMSData): Promise<any> {
    const { phoneNumber, type, data } = smsData;
    const message = this.generateMessage(type, data);
    return await this.sendSMS(phoneNumber, message);
  }

  // Send job alert SMS
  static async sendJobAlert(phoneNumber: string, jobTitle: string): Promise<any> {
    return await this.sendNotification({
      phoneNumber,
      type: SMSType.JOB_ALERT,
      data: { jobTitle }
    });
  }

  // Send payment receipt SMS
  static async sendPaymentReceipt(
    phoneNumber: string,
    amount: number,
    reference: string,
    balance: number
  ): Promise<any> {
    return await this.sendNotification({
      phoneNumber,
      type: SMSType.PAYMENT_RECEIPT,
      data: { amount, reference, balance }
    });
  }

  // Send escrow lock SMS
  static async sendEscrowLockNotification(
    phoneNumber: string,
    amount: number,
    jobTitle: string
  ): Promise<any> {
    return await this.sendNotification({
      phoneNumber,
      type: SMSType.ESCROW_LOCK,
      data: { amount, jobTitle }
    });
  }

  // Send escrow release SMS
  static async sendEscrowReleaseNotification(
    phoneNumber: string,
    amount: number,
    jobTitle: string
  ): Promise<any> {
    return await this.sendNotification({
      phoneNumber,
      type: SMSType.ESCROW_RELEASE,
      data: { amount, jobTitle }
    });
  }

  // Send wallet funding SMS
  static async sendWalletFundingNotification(
    phoneNumber: string,
    amount: number,
    reference: string,
    balance: number
  ): Promise<any> {
    return await this.sendNotification({
      phoneNumber,
      type: SMSType.WALLET_FUNDING,
      data: { amount, reference, balance }
    });
  }
}
