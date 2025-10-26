import { InferSchemaType, model, Schema, Types } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

type ISession = InferSchemaType<typeof SessionSchema>;

export const Session = model<ISession>("Session", SessionSchema);
