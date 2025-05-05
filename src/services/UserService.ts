import UserModel, { IUser } from '../models/UserModel';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';

class UserService {
  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await UserModel.create(userData);
      return user;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestError('Email already exists');
      }
      throw error;
    }
  }

  async getAll(
    page: number = 1,
    pageSize: number = 10,
    filters: any = {},
    onlyInactive: boolean = false
  ): Promise<IUser[]> {
    const skip = (page - 1) * pageSize;
    
    let query = { ...filters };
    
    if (onlyInactive) {
      return UserModel.find({ deletedAt: { $ne: null } })
        .skip(skip)
        .limit(pageSize)
        .select('-password')
        .sort({ createdAt: -1 });
    }

    return await UserModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .select('-password')
      .sort({ createdAt: -1 });
  }

  async getById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select('-password');
  }

  async updateById(id: string, data: Partial<IUser>): Promise<void> {
    const user = await UserModel.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.password) {
      delete data.password;
    }

    await UserModel.updateOne({ _id: id }, data);
  }

  async deleteById(id: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    
    if (!user) {
      return false;
    }

    user.deletedAt = new Date();
    await user.save();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const user = await UserModel.findOne({ _id: id, deletedAt: { $ne: null } }, { includeSoftDeleted: true });
    
    if (!user) {
      return false;
    }

    user.deletedAt = undefined;
    await user.save();
    return true;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserModel.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await user.comparePassword(currentPassword);

    if (!isValid) {
      throw new BadRequestError('Invalid current password', 401);
    }

    user.password = newPassword;
    await user.save();
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await UserModel.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.password = newPassword;
    await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }
}

export default new UserService();