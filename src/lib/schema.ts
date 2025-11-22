import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string(),
  password: z.string().min(8, { error: "Minimum 8 characters are required" }),
  phoneNumber: z.string(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  password: z.string().min(8, { error: "Minimum 8 characters are required" }),
  phoneNumber: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const createExerciseSchema = z.object({
  name: z.string(),
  category: z
    .enum(["strength", "cardio", "flexibility", "other"])
    .default("strength"),
  exerciseType: z.enum(["isolation", "compound"]),
  muscleGroupName: z.string(),
});

export type CreateExerciseSchema = z.infer<typeof createExerciseSchema>;

export const createWorkoutSchema = z.object({
  sessionId: z.string(),
  exerciseId: z.string(),
  reps: z.number(),
  weight: z.number(),
  createdAt: z.any(),
});

export type CreateWorkoutSchema = z.infer<typeof createWorkoutSchema>;

export const createRoutineSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string(),
        order: z.number(),
        sets: z.number(),
      })
    )
    .min(1),
});
