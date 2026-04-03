import { User, IUser } from './user.model.js';

export class UserService {
  static async updateProfile(userId: string, updateData: Partial<IUser>) {
    // Only allow updating these specific fields
    const allowedUpdates = ['firstName', 'lastName', 'gender', 'phone', 'nin', 'stateOfOrigin', 'nationality', 'address'];
    
    const filteredUpdate: any = {};
    for (const key of allowedUpdates) {
      if (updateData[key as keyof IUser] !== undefined) {
        filteredUpdate[key] = updateData[key as keyof IUser];
      }
    }

    if (Object.keys(filteredUpdate).length === 0) {
      throw new Error('No valid update fields provided');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
