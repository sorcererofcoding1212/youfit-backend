import { InferSchemaType, model, Schema, Types } from "mongoose";
import { IExercise } from "./exercise.model";
import { ICategory } from "./category.model";

// session => workouts => exericises => sets

const WorkoutSchema = new Schema({
  sessionId: {
    type: Types.ObjectId,
    ref: "Session",
    required: true,
  },

  exerciseId: {
    type: Types.ObjectId,
    ref: "Exercise",
    required: true,
  },

  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },

  sets: [
    {
      reps: Number,
      weight: Number,
    },
  ],

  createdAt: {
    type: Date,
    required: true,
  },
});

export type IWorkout = InferSchemaType<typeof WorkoutSchema>;

export type PopulatedWorkout = Omit<IWorkout, "exerciseId"> & {
  exerciseId: Omit<IExercise, "muscleGroup"> & {
    muscleGroup: ICategory;
  } & { _id: Types.ObjectId };
};

export const Workout = model<IWorkout>("Workout", WorkoutSchema);
