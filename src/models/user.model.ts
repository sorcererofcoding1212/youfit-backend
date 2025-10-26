import { InferSchemaType, model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

type IUser = InferSchemaType<typeof UserSchema>;

export const User = model<IUser>("User", UserSchema);
