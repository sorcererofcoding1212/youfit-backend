import { Request, Response } from "express";
import { Exercise } from "../models/exercise.model";
import { Session } from "../models/session.model";
import { Category } from "../models/category.model";
import { createExerciseSchema, createWorkoutSchema } from "../lib/schema";
import { PopulatedWorkout, Workout } from "../models/workout.model";
import {
  calculateProgressiveOverload,
  calculateWorkoutDistribution,
  sortVolumeData,
} from "../lib/utils";

export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const date = req.params.date;

    if (!userId || !date) {
      res.json({ msg: "Invalid request", success: false });
      return;
    }

    const existingSession = await Session.findOne({
      userId,
      date,
    });

    if (existingSession) {
      res.json({
        msg: "Workout already exists for this day",
        success: false,
        session: {
          _id: existingSession._id,
        },
      });
      return;
    }

    const session = await Session.create({
      userId,
      date,
    });

    res.json({
      msg: "Session created",
      success: true,
      session: {
        _id: session._id,
      },
    });
  } catch (error) {
    console.log("CREATE_SESSION_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const date = req.params.date;

    if (!userId || !date) {
      res.json({ msg: "Invalid request", success: false });
      return;
    }

    const session = await Session.findOne({
      date,
      userId,
    });

    if (!session) {
      res.json({
        msg: "Session does not exist",
        success: false,
      });
      return;
    }

    res.json({
      msg: "Session fetched",
      success: true,
      session: {
        _id: session._id,
      },
    });
  } catch (error) {
    console.log("GET_WORKOUT_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const categories = await Category.find().select(["_id", "muscleGroupName"]);

    res.json({
      msg: "Categories fetched",
      success: true,
      categories,
    });
  } catch (error) {
    console.log("GET_CATEGORIES_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const createExercise = async (req: Request, res: Response) => {
  try {
    const { muscleGroupName, name, category, exerciseType, isCustom } =
      req.body;

    const userId = req.userId;

    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const { success } = createExerciseSchema.safeParse({
      muscleGroupName,
      name,
      category,
      exerciseType,
      isCustom,
    });

    if (!success) {
      res.json({
        msg: "Invalid inputs provided",
        success: false,
      });
      return;
    }

    const muscleGroup = await Category.findOne({
      muscleGroupName,
    });

    if (!muscleGroup) {
      res.json({
        msg: "Invalid category selected",
        success: false,
      });
      return;
    }

    await Exercise.create({
      name,
      category,
      exerciseType,
      userId: isCustom ? userId : null,
      muscleGroup: muscleGroup._id,
    });

    res.json({
      msg: "Exercise added",
      success: true,
    });
  } catch (error) {
    console.log("CREATE_EXERCISE_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getExercisesByCategories = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId;

    if (!categoryId || categoryId.length < 1 || categoryId === "undefined") {
      res.json({
        msg: "Category not provided",
        success: false,
      });
      return;
    }

    const exercises = await Exercise.find({
      muscleGroup: categoryId,
    }).select(["name", "_id", "category", "exerciseType"]);

    res.json({
      msg: "Exercises fetched",
      success: true,
      exercises,
    });
  } catch (error) {
    console.log("GET_EXERCISES_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const createWorkout = async (req: Request, res: Response) => {
  try {
    const { exerciseId, sessionId, reps, weight, createdAt } = req.body;

    const userId = req.userId;

    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const { success } = createWorkoutSchema.safeParse({
      exerciseId,
      sessionId,
      reps,
      weight,
      createdAt,
    });

    if (!success) {
      res.json({
        msg: "Invalid inputs provided",
        success: false,
      });
      return;
    }

    const set = { reps, weight };

    const workout = await Workout.findOne({
      exerciseId,
      sessionId,
      userId,
    });

    if (!workout) {
      const workout = await Workout.create({
        sessionId,
        exerciseId,
        sets: [set],
        userId,
        createdAt,
      });

      res.json({
        msg: "Set added",
        success: true,
        data: workout,
      });
      return;
    }

    workout.sets.push(set);
    await workout.save();

    res.json({
      msg: "Set added",
      success: true,
      data: workout,
    });
  } catch (error) {
    console.log("CREATE_WORKOUT_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const editSet = async (req: Request, res: Response) => {
  try {
    const { workoutId, setId, reps, weight } = req.body;

    const workout = await Workout.findById(workoutId);

    if (!workout) {
      res.json({
        msg: "Record does not exist",
        success: false,
      });
      return;
    }

    const set = workout.sets.id(setId);

    if (!set) {
      res.json({
        msg: "Record does not exist",
        success: false,
      });
      return;
    }

    set.reps = reps;
    set.weight = weight;

    await workout.save();

    res.json({
      msg: "Set updated",
      success: true,
    });
  } catch (error) {
    console.log("SET_EDIT_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getSessionWorkouts = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId;

    const userId = req.userId;

    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const workouts = await Workout.find({
      sessionId,
      userId,
    })
      .populate("exerciseId", ["name", "_id", "category", "exerciseType"])
      .select(["exerciseId", "_id", "sets", "createdAt"]);

    res.json({
      msg: "Workouts fetched",
      success: true,
      workouts: workouts,
    });
  } catch (error) {
    console.log("SESSION_WORKOUTS_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const deleteSet = async (req: Request, res: Response) => {
  try {
    const { setId, workoutId } = req.body;

    const workout = await Workout.findByIdAndUpdate(
      workoutId,
      {
        $pull: { sets: { _id: setId } },
      },
      { new: true }
    );

    if (workout?.sets.length === 0) {
      await Workout.deleteOne({
        _id: workoutId,
      });
    }

    res.json({
      msg: "Set deleted",
      success: true,
    });
  } catch (error) {
    console.log("DELETE_SET_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getFilteredExercises = async (req: Request, res: Response) => {
  try {
    const { filter } = req.query;

    if (!filter) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    if (typeof filter !== "string") {
      res.json({
        msg: "Invalid search query",
        success: false,
      });
      return;
    }

    const regex = new RegExp(filter.replace(/^"(.*)"$/, "$1").trim(), "i");

    const filteredExercises = await Exercise.find({
      name: regex,
    });

    res.json({
      msg: "Exercises found",
      success: true,
      exercises: filteredExercises,
    });
  } catch (error) {
    console.log("SEARCH_EXERCISE_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getDailySetVolume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({
        msg: "Invalid request",
        success: false,
      });
    }

    const duration = (req.query.duration as string) || "3m";

    const volumeData = await Workout.find({ userId });

    const sortedVolumeData = sortVolumeData(volumeData, duration);

    res.json({
      data: sortedVolumeData,
      success: true,
    });
  } catch (error) {
    console.log("VOLUME_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getExerciseDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const exerciseId = req.query.exercise as string;

    if (!exerciseId || exerciseId.length < 1) {
      res.json({
        msg: "No exercise selected",
        success: false,
      });
      return;
    }

    const duration = (req.query.duration as string) || "3m";

    const exerciseDetails = await Workout.find({
      userId,
      exerciseId,
    });

    const progressionDetails = calculateProgressiveOverload(
      exerciseDetails,
      duration
    );

    res.json({
      data: progressionDetails,
      success: true,
    });
  } catch (error) {
    console.log("EXERCISE_DETAILS_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};

export const getWorkoutDistribution = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.json({
        msg: "Invalid request",
        success: false,
      });
      return;
    }

    const duration = (req.query.duration as string) || "3m";

    const exerciseDetails = await Workout.find({ userId })
      .populate({
        path: "exerciseId",
        select: ["name", "_id", "muscleGroup"],
        populate: {
          path: "muscleGroup",
          select: ["_id", "muscleGroupName"],
        },
      })
      .lean<PopulatedWorkout[]>();

    const distributionDetails = calculateWorkoutDistribution(
      exerciseDetails,
      duration
    );

    res.json({
      data: distributionDetails,
      success: true,
    });
  } catch (error) {
    console.log("WORKOUT_DISTRIBUTION_ERROR", error);
    res.json({
      msg: "Internal server error",
      success: false,
    });
  }
};
