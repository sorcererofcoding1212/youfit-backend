import { Router } from "express";
import { validateSession } from "../middlewares/user.middleware";
import {
  createExercise,
  createRoutine,
  createSession,
  createWorkout,
  createWorkoutFromRoutine,
  deleteRoutine,
  deleteSet,
  editSet,
  getCategories,
  getDailySetVolume,
  getExerciseDetails,
  getExerciseRecordSet,
  getExercisesByCategories,
  getFilteredExercises,
  getSession,
  getSessionWorkouts,
  getUserRoutines,
  getWorkoutDistribution,
} from "../controllers/app.controller";

const route = Router();

route.post("/exercise", validateSession, createExercise);
route.post("/session/:date", validateSession, createSession);
route.get("/session/:date", validateSession, getSession);
route.get("/categories", validateSession, getCategories);
route.post("/workout", validateSession, createWorkout);
route.get("/volume", validateSession, getDailySetVolume);
route.get("/exercises/search", validateSession, getFilteredExercises);
route.get("/exercises/:categoryId", validateSession, getExercisesByCategories);
route.get("/exercise/details", validateSession, getExerciseDetails);
route.get("/workout/distribution", validateSession, getWorkoutDistribution);
route.get("/workouts/:sessionId", validateSession, getSessionWorkouts);
route.put("/set/edit", validateSession, editSet);
route.delete("/set/delete", validateSession, deleteSet);
route.get("/record/:exerciseId", validateSession, getExerciseRecordSet);
route.post("/routine", validateSession, createRoutine);
route.post("/routine/:routineId/:sessionId", validateSession, createWorkoutFromRoutine);
route.get("/routines", validateSession, getUserRoutines);
route.delete("/routine/:routineId", validateSession, deleteRoutine);

export default route;
