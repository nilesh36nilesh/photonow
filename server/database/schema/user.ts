import { model, Model, Schema } from "mongoose";

const UserSchema = new Schema({
  id: String,
  username: String,
  password: String,
  accessToken: String,
  refreshToken: String,
  provider: String,
  businessName: String,
  address: String,
  lat: Number,
  lng: Number,
  email: String,
  firstName: String,
  lastName: String,
  displayName: String,
  selectedPhoto: String
});

const UserModel: Model<User> = model<User>("User", UserSchema);

export { UserModel };
