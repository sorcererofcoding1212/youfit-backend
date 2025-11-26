import { Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IWorkout, PopulatedWorkout, Workout } from "../models/workout.model";

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

interface Set {
  reps: number;
  weight: number;
  createdAt?: Date;
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
  try {
    const startDate = setDuration(duration);
    const sortedVolumeData: VolumeProps = {};

    for (const vol of volumeData) {
      const createdAt = new Date(vol.createdAt);
      if (createdAt < startDate) continue;

      const volDate = createdAt.toLocaleDateString("en-CA");

      const filteredSets = vol.sets.filter((s) => s.reps && s.reps > 0);

      if (filteredSets.length < 1) continue;

      sortedVolumeData[volDate] =
        (sortedVolumeData[volDate] || 0) + filteredSets.length;
    }

    return Object.entries(sortedVolumeData)
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.log("VOLUME_FUNCTION_ERROR", error);
    return [];
  }
};

export const calculateProgressiveOverload = (
  exerciseDetails: IWorkout[],
  duration: string
) => {
  try {
    const startDate = setDuration(duration);

    const progressionDetails: OverloadProps = {};

    for (const ex of exerciseDetails) {
      const createdAt = new Date(ex.createdAt);
      if (createdAt < startDate) continue;

      const exDate = createdAt.toLocaleDateString("en-CA");

      const totalLoad = ex.sets.map((set) => {
        if (!set.reps || !set.weight) return 0;
        return calculateOneRepMax(set.reps, set.weight);
      });
      const highestLoad = Math.max(...totalLoad);
      const highestSet = ex.sets.find(
        (set) =>
          calculateOneRepMax(set.reps || 0, set.weight || 0) === highestLoad
      );

      if (!highestSet || !highestSet.reps || !highestSet.weight) continue;

      if (highestSet.reps < 1) continue;

      progressionDetails[exDate] = {
        reps: highestSet.reps,
        weight: highestSet.weight,
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
  } catch (error) {
    console.log("STRENGTH_FUNCTION_ERROR", error);
    return [];
  }
};

export const calculateWorkoutDistribution = (
  exerciseDetails: PopulatedWorkout[],
  duration: string
) => {
  try {
    const startDate = setDuration(duration);
    const distributionDetails: Record<string, number> = {};

    for (const ex of exerciseDetails) {
      const createdAt = new Date(ex.createdAt);
      if (createdAt < startDate) continue;

      const muscleGroupName = ex.exerciseId.muscleGroup.muscleGroupName;

      const filteredSets = ex.sets.filter((s) => s.reps && s.reps > 0);

      if (filteredSets.length < 1) continue;

      distributionDetails[muscleGroupName] =
        (distributionDetails[muscleGroupName] || 0) + filteredSets.length;
    }

    return Object.entries(distributionDetails).map(([muscle, volume]) => ({
      muscle,
      volume,
    }));
  } catch (error) {
    console.log("DISTRIBUTION_FUNCTION_ERROR", error);
    return [];
  }
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

export const getRecordSet = async (userId: string, exerciseId: string) => {
  const response = await Workout.find({
    userId,
    exerciseId,
  }).populate("exerciseId", "name");

  const calculateHighestSet = (sets: Set[]) => {
    const setArray = sets.map((s) => calculateOneRepMax(s.reps, s.weight));
    const highestSetData = Math.max(...setArray);
    const highestSet = sets.find(
      (s) => calculateOneRepMax(s.reps, s.weight) === highestSetData
    );

    if (!highestSet) {
      return {
        recordSet: sets[0],
        estimatedOneRepMax: sets[0]["weight"],
      };
    }
    return {
      recordSet: highestSet,
      estimatedOneRepMax: highestSetData,
    };
  };

  const setData = response.map((s) => {
    const sets = s.sets as Set[];
    const { recordSet, estimatedOneRepMax } = calculateHighestSet(sets);
    const createdAt = new Date(s.createdAt);
    return {
      reps: recordSet.reps,
      weight: recordSet.weight,
      estimatedOneRepMax,
      createdAt,
    };
  });

  const recordSetDetails = calculateHighestSet(setData);

  return recordSetDetails;
};

export const calculateOneRepMax = (reps: number, weight: number) => {
  return weight * (1 + reps / 30);
};
