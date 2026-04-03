import { auth } from '../../config/auth.js';

export class AuthService {
  static async signup(userData: any, password?: string) {
    return await auth.signup(userData, password);
  }

  static async login(email: string, password?: string, clientIp?: string) {
    return await auth.loginWithPassword(email, password || '', clientIp);
  }

  static async refresh(refreshToken: string) {
    const { accessToken } = await auth.refresh(refreshToken);
    const payload = await auth.verifyToken(refreshToken, 'refresh');
    // We return user for convenience in the login result/refresh result
    // The actual profile management happens in UserService
    return { user_id: (payload as any)?.sub, accessToken };
  }

  static async logout(refreshToken: string) {
    // Kroxt handles session management via Hash-Linked Revocation normally.
    return true;
  }

  static async changePassword(userId: string, newPassword?: string) {
    return await auth.changePassword(userId, newPassword || '');
  }
}
