import { InferSchemaType, model, Schema, Types } from "mongoose";

const ExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "other"],
      default: "strength",
    },

    muscleGroup: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },

    exerciseType: {
      type: String,
      enum: ["isolation", "compound"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export type IExercise = InferSchemaType<typeof ExerciseSchema>;

export const Exercise = model<IExercise>("Exercise", ExerciseSchema);
