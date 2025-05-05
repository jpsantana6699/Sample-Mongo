import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongooseLogHooks } from '../hooks/mongooseLogHooks';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      match: [/^[a-zA-Zà-úÀ-Ú]+( [a-zA-Zà-úÀ-Ú]+)*$/, 'Invalid name format']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre(/^find/, function(this: any, next) {
  if (!this.getQuery().includeSoftDeleted) {
    this.where({ deletedAt: null });
  }
  delete this.getQuery().includeSoftDeleted;
  next();
});

// Registrar hooks de log para o modelo User
MongooseLogHooks.registerLogHooks(UserSchema, 'users');

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;