import { auth } from '../../config/auth.js';
import { User } from '../user/user.model.js';
import { MailService } from '../../utils/mail.service.js';

export class AuthService {
  static async signup(userData: any, password?: string) {
    const result = await auth.signup(userData, password);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(result.user._id, {
      otp,
      otpExpires,
      isVerified: false
    });

    try {
      await MailService.sendVerificationOtp(result.user.email, otp);
    } catch (error) {
       console.error('Failed to send OTP email:', error);
       // We don't fail registration if email fails, but maybe we should?
       // For now, let's keep it robust.
    }

    return result;
  }

  static async verifyOtp(email: string, otp: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('Email already verified');
    if (!user.otp || !user.otpExpires) throw new Error('No verification code found');
    if (user.otp !== otp) throw new Error('Invalid verification code');
    if (new Date() > user.otpExpires) throw new Error('Verification code has expired');

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return true;
  }

  static async login(email: string, password?: string, clientIp?: string) {
    const result = await auth.loginWithPassword(email, password || '', clientIp);
    
    if (!result.user.isVerified) {
      throw new Error('Please verify your email address before logging in.');
    }
    
    return result;
  }

  static async refresh(refreshToken: string) {
    const { accessToken } = await auth.refresh(refreshToken);
    const payload = await auth.verifyToken(refreshToken, 'refresh');
    return { user_id: (payload as any)?.sub, accessToken };
  }

  static async logout(refreshToken: string) {
    return true;
  }

  static async changePassword(userId: string, newPassword?: string) {
    return await auth.changePassword(userId, newPassword || '');
  }
}
