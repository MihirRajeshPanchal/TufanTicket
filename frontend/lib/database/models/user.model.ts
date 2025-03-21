import { Document, Schema, model, models } from "mongoose";

export interface IUserDocument extends Document {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photo: string;
}

const UserSchema = new Schema({
  clerkId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  photo: { type: String, required: true }
});

const User = models?.User || model<IUserDocument>('User', UserSchema);
export default User;