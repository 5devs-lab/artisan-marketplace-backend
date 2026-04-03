import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, role, firstName, lastName, gender, phone } = req.body;
      const result = await AuthService.signup(
        { email, role, firstName, lastName, gender, phone },
        password
      );

      res.status(201).json({
        message: 'Registration successful. Please check your email for a verification code.',
        email: result.user.email
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      await AuthService.verifyOtp(email, otp);
      res.status(200).json({ message: 'Email verified successfully. You can now login.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password, req.ip || undefined);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      if (result.user) delete (result.user as any).passwordHash;

      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      if (err.message.includes('IP is temporarily blocked')) {
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes('Too many requests')) {
        return res.status(429).json({ error: err.message });
      }
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token' });
      }

      const result = await AuthService.refresh(refreshToken);

      res.status(200).json({
        user_id: result.user_id,
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      res.status(401).json({ error: 'Session expired' });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logged out' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async changePassword(req: any, res: Response) {
    try {
      const { newPassword } = req.body;
      await AuthService.changePassword(req.user.id, newPassword);
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
