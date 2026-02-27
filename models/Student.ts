import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  faculty: string;
  programme: string;
  level: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    faculty: {
      type: String,
      required: true,
      enum: [
        "Faculty of Computing Engineering and Mathematical Sciences: (CEMS)",
        "Faculty of Economics and Business Administration: (EBA)",
        "Faculty of Education: (ED)",
        "Faculty of Nursing and Midwifery: (SONAM)",
        "Faculty of Religious Studies: (RS)",
      ],
    },
    programme: {
      type: String,
      required: true,
      enum: [
        "Computer Science",
        "Information Technology",
        "Business Administration",
        "Economics",
        "Nursing",
        "Education",
        "Psychology",
        "Sociology",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
      ],
    },
    level: {
      type: String,
      required: true,
      enum: ["Level 100", "Level 200", "Level 300", "Level 400"],
    },
  },
  {
    timestamps: true,
  },
);

// Prevent model from being recreated
const Student =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
