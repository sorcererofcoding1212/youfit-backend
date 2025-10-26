import { connectDb } from "../lib/db";
import { Category } from "../models/category.model";
import { configDotenv } from "dotenv";
import { Exercise } from "../models/exercise.model";
import { User } from "../models/user.model";

configDotenv();

const categories = [
  { muscleGroupName: "Chest" },
  { muscleGroupName: "Biceps" },
  { muscleGroupName: "Triceps" },
  { muscleGroupName: "Shoulders" },
  { muscleGroupName: "Forearms" },
  { muscleGroupName: "Traps" },
  { muscleGroupName: "Lats" },
  { muscleGroupName: "Abs" },
  { muscleGroupName: "Obliques" },
  { muscleGroupName: "Lower Back" },
  { muscleGroupName: "Quads" },
  { muscleGroupName: "Hamstrings" },
  { muscleGroupName: "Glutes" },
  { muscleGroupName: "Calves" },
];

const exercisesByCategory: Record<
  string,
  { name: string; category: string; exerciseType: "isolation" | "compound" }[]
> = {
  Chest: [
    {
      name: "Barbell Bench Press",
      category: "strength",
      exerciseType: "compound",
    },
    {
      name: "Incline Dumbbell Press",
      category: "strength",
      exerciseType: "compound",
    },
    {
      name: "Decline Barbell Press",
      category: "strength",
      exerciseType: "compound",
    },
    {
      name: "Cable Crossover",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Pec Deck Machine",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Push-Up", category: "strength", exerciseType: "compound" },
    { name: "Dumbbell Fly", category: "strength", exerciseType: "isolation" },
    { name: "Chest Dips", category: "strength", exerciseType: "compound" },
    {
      name: "Incline Cable Fly",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Smith Machine Bench Press",
      category: "strength",
      exerciseType: "compound",
    },
  ],
  Biceps: [
    { name: "Barbell Curl", category: "strength", exerciseType: "isolation" },
    {
      name: "Alternating Dumbbell Curl",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Preacher Curl", category: "strength", exerciseType: "isolation" },
    {
      name: "Incline Dumbbell Curl",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Cable Curl", category: "strength", exerciseType: "isolation" },
    {
      name: "Concentration Curl",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Hammer Curl", category: "strength", exerciseType: "isolation" },
    { name: "Machine Curl", category: "strength", exerciseType: "isolation" },
    { name: "Zottman Curl", category: "strength", exerciseType: "isolation" },
  ],
  Triceps: [
    {
      name: "Tricep Pushdown",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Overhead Tricep Extension",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Close-Grip Bench Press",
      category: "strength",
      exerciseType: "compound",
    },
    { name: "Dips", category: "strength", exerciseType: "compound" },
    { name: "Rope Pushdown", category: "strength", exerciseType: "isolation" },
    { name: "Skull Crushers", category: "strength", exerciseType: "isolation" },
    { name: "Diamond Push-Up", category: "strength", exerciseType: "compound" },
    { name: "Cable Kickback", category: "strength", exerciseType: "isolation" },
  ],
  Shoulders: [
    { name: "Overhead Press", category: "strength", exerciseType: "compound" },
    { name: "Arnold Press", category: "strength", exerciseType: "compound" },
    { name: "Lateral Raise", category: "strength", exerciseType: "isolation" },
    { name: "Front Raise", category: "strength", exerciseType: "isolation" },
    { name: "Rear Delt Fly", category: "strength", exerciseType: "isolation" },
    { name: "Upright Row", category: "strength", exerciseType: "compound" },
    {
      name: "Seated Dumbbell Press",
      category: "strength",
      exerciseType: "compound",
    },
    {
      name: "Cable Face Pull",
      category: "strength",
      exerciseType: "isolation",
    },
  ],
  Forearms: [
    { name: "Wrist Curl", category: "strength", exerciseType: "isolation" },
    {
      name: "Reverse Wrist Curl",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Farmer's Carry", category: "strength", exerciseType: "compound" },
    { name: "Reverse Curl", category: "strength", exerciseType: "isolation" },
    { name: "Grip Squeeze", category: "strength", exerciseType: "isolation" },
    { name: "Towel Pull-Up", category: "strength", exerciseType: "compound" },
  ],
  Traps: [
    { name: "Barbell Shrug", category: "strength", exerciseType: "isolation" },
    { name: "Dumbbell Shrug", category: "strength", exerciseType: "isolation" },
    { name: "Upright Row", category: "strength", exerciseType: "compound" },
    { name: "Rack Pull", category: "strength", exerciseType: "compound" },
    {
      name: "Behind-the-Back Shrug",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Farmer’s Carry", category: "strength", exerciseType: "compound" },
  ],
  Lats: [
    { name: "Pull-Up", category: "strength", exerciseType: "compound" },
    { name: "Chin-Up", category: "strength", exerciseType: "compound" },
    { name: "Lat Pulldown", category: "strength", exerciseType: "compound" },
    {
      name: "Seated Cable Row",
      category: "strength",
      exerciseType: "compound",
    },
    { name: "T-Bar Row", category: "strength", exerciseType: "compound" },
    { name: "Bent Over Row", category: "strength", exerciseType: "compound" },
    {
      name: "Straight-Arm Pulldown",
      category: "strength",
      exerciseType: "isolation",
    },
  ],
  Abs: [
    { name: "Crunches", category: "strength", exerciseType: "isolation" },
    { name: "Leg Raise", category: "strength", exerciseType: "isolation" },
    { name: "Plank", category: "strength", exerciseType: "compound" },
    {
      name: "Hanging Knee Raise",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Ab Rollout", category: "strength", exerciseType: "compound" },
    { name: "Cable Crunch", category: "strength", exerciseType: "isolation" },
    { name: "V-Up", category: "strength", exerciseType: "isolation" },
  ],
  Obliques: [
    { name: "Russian Twist", category: "strength", exerciseType: "isolation" },
    { name: "Side Plank", category: "strength", exerciseType: "compound" },
    {
      name: "Cable Woodchopper",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Dumbbell Side Bend",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Hanging Oblique Raise",
      category: "strength",
      exerciseType: "isolation",
    },
  ],
  "Lower Back": [
    { name: "Back Extension", category: "strength", exerciseType: "compound" },
    { name: "Good Morning", category: "strength", exerciseType: "compound" },
    { name: "Superman", category: "strength", exerciseType: "isolation" },
    { name: "Rack Pull", category: "strength", exerciseType: "compound" },
    {
      name: "Reverse Hyperextension",
      category: "strength",
      exerciseType: "isolation",
    },
  ],
  Quads: [
    { name: "Back Squat", category: "strength", exerciseType: "compound" },
    { name: "Front Squat", category: "strength", exerciseType: "compound" },
    { name: "Leg Press", category: "strength", exerciseType: "compound" },
    { name: "Leg Extension", category: "strength", exerciseType: "isolation" },
    {
      name: "Bulgarian Split Squat",
      category: "strength",
      exerciseType: "compound",
    },
    { name: "Walking Lunge", category: "strength", exerciseType: "compound" },
  ],
  Hamstrings: [
    {
      name: "Romanian Deadlift",
      category: "strength",
      exerciseType: "compound",
    },
    { name: "Lying Leg Curl", category: "strength", exerciseType: "isolation" },
    {
      name: "Seated Leg Curl",
      category: "strength",
      exerciseType: "isolation",
    },
    { name: "Glute-Ham Raise", category: "strength", exerciseType: "compound" },
    {
      name: "Cable Pull-Through",
      category: "strength",
      exerciseType: "compound",
    },
  ],
  Glutes: [
    { name: "Hip Thrust", category: "strength", exerciseType: "compound" },
    { name: "Glute Bridge", category: "strength", exerciseType: "compound" },
    { name: "Cable Kickback", category: "strength", exerciseType: "isolation" },
    { name: "Sumo Deadlift", category: "strength", exerciseType: "compound" },
    { name: "Step-Up", category: "strength", exerciseType: "compound" },
  ],
  Calves: [
    {
      name: "Standing Calf Raise",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Seated Calf Raise",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Donkey Calf Raise",
      category: "strength",
      exerciseType: "isolation",
    },
    {
      name: "Leg Press Calf Extension",
      category: "strength",
      exerciseType: "isolation",
    },
  ],
};

const seedData = async () => {
  try {
    await connectDb();

    await Category.deleteMany({});
    await Exercise.deleteMany({});

    await Category.insertMany(categories);
    console.log("Categories seeded");

    const allCategories = await Category.find({});
    const exercisesToInsert: any[] = [];

    for (const cat of allCategories) {
      const exercises = exercisesByCategory[cat.muscleGroupName];
      if (exercises && exercises.length > 0) {
        exercises.forEach((ex) => {
          exercisesToInsert.push({
            ...ex,
            muscleGroup: cat._id,
          });
        });
      }
    }

    await Exercise.insertMany(exercisesToInsert);
    console.log(
      `${exercisesToInsert.length} total exercises seeded successfully`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
