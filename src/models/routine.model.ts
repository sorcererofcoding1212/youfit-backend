import { InferSchemaType, model, Schema, Types } from "mongoose";

const RoutineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    exercises: [
      {
        exerciseId: {
          type: Types.ObjectId,
          ref: "Exercise",
          required: true,
        },

        order: {
          type: Number,
          required: true,
        },

        sets: {
          type: Number,
          required: true,
        },
      },
    ],

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

type IRoutine = InferSchemaType<typeof RoutineSchema>;

export const Routine = model<IRoutine>("Routine", RoutineSchema);
