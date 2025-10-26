import { Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IWorkout, PopulatedWorkout } from "../models/workout.model";

interface VolumeProps {
  [createdAt: string]: number;
}

interface OverloadProps {
  [createdAt: string]: SetLoadProps;
}

interface SetLoadProps {
  reps: number | undefined | null;
  weight: number | undefined | null;
  load: number;
}

export const generateToken = (phoneNumber: string, userId: string) => {
  const token = jwt.sign(
    { phoneNumber, id: userId },
    process.env.JWT_SECRET || "mysecretkey"
  );

  return token;
};

export const setAuthCookie = (res: Response, cookieValue: string) => {
  return res.cookie("jwt_key", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
};

export const decodeToken = (token: string) => {
  const decodedToken = jwt.verify(
    token,
    process.env.JWT_SECRET || "mysecretkey"
  ) as JwtPayload;

  return decodedToken;
};

export const clearCookie = (res: Response, cookieName: string) => {
  return res.clearCookie(cookieName);
};

export const sortVolumeData = (volumeData: IWorkout[], duration: string) => {
  const startDate = setDuration(duration);
  const sortedVolumeData: VolumeProps = {};

  for (const vol of volumeData) {
    const createdAt = new Date(vol.createdAt);
    if (createdAt < startDate) continue;

    const volDate = createdAt.toLocaleDateString("en-CA");

    sortedVolumeData[volDate] =
      (sortedVolumeData[volDate] || 0) + vol.sets.length;
  }

  return Object.entries(sortedVolumeData)
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateProgressiveOverload = (
  exerciseDetails: IWorkout[],
  duration: string
) => {
  const startDate = setDuration(duration);

  const progressionDetails: OverloadProps = {};

  for (const ex of exerciseDetails) {
    const createdAt = new Date(ex.createdAt);
    if (createdAt < startDate) continue;

    const exDate = createdAt.toLocaleDateString("en-CA");

    const totalLoad = ex.sets.map((set) => {
      if (!set.reps || !set.weight) return 0;
      return set.reps * set.weight;
    });
    const highestLoad = Math.max(...totalLoad);
    const highestSet = ex.sets.find(
      (set) => (set.reps || 0) * (set.weight || 0) === highestLoad
    );

    progressionDetails[exDate] = {
      reps: highestSet?.reps,
      weight: highestSet?.weight,
      load: highestLoad,
    };
  }

  return Object.entries(progressionDetails)
    .map(([date, data]) => ({
      date,
      load: data.load,
      weight: data.weight,
      reps: data.reps,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateWorkoutDistribution = (
  exerciseDetails: PopulatedWorkout[],
  duration: string
) => {
  const startDate = setDuration(duration);
  const distributionDetails: Record<string, number> = {};

  for (const ex of exerciseDetails) {
    const createdAt = new Date(ex.createdAt);
    if (createdAt < startDate) continue;

    const muscleGroupName = ex.exerciseId.muscleGroup.muscleGroupName;

    distributionDetails[muscleGroupName] =
      (distributionDetails[muscleGroupName] || 0) + ex.sets.length;
  }

  return Object.entries(distributionDetails).map(([muscle, volume]) => ({
    muscle,
    volume,
  }));
};

export const setDuration = (duration: string) => {
  const currentDate = new Date();
  let startDate: Date;

  if (duration === "1m") {
    startDate = new Date(currentDate);
    startDate.setMonth(currentDate.getMonth() - 1);
  } else if (duration === "3m") {
    startDate = new Date(currentDate);
    startDate.setMonth(currentDate.getMonth() - 3);
  } else {
    startDate = new Date(0);
  }

  return startDate;
};
