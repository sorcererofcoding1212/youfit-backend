import { InferSchemaType, model, Schema } from "mongoose";

const CategorySchema = new Schema({
  muscleGroupName: {
    type: String,
    required: true,
    unique: true,
  },

  description: {
    type: String,
  },
});

export type ICategory = InferSchemaType<typeof CategorySchema>;

export const Category = model<ICategory>("Category", CategorySchema);
