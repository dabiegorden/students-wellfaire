import mongoose, { Schema, Document } from "mongoose";
import bcryptjs from "bcryptjs";

export interface IUser extends Document {
  role: "students" | "admin";
  email: string;
  password: string;
  firstName: string;
  lastName: string;

  // Student-specific fields
  studentId?: string;
  faculty?: string;
  programme?: string;
  level?: string;

  // Admin-specific fields
  staffId?: string;
  department?: string;

  createdAt: Date;
  updatedAt: Date;
  emailVerified?: boolean;

  // Method to compare passwords
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["admin", "students"],
      required: true,
      default: "students",
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
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password by default
    },
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

    // Student fields
    studentId: {
      type: String,
      unique: true,
      sparse: true, // Only unique if present
      trim: true,
    },
    faculty: {
      type: String,
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
      enum: ["Level 100", "Level 200", "Level 300", "Level 400"],
    },

    // Admin fields
    staffId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcryptjs.hash(this.password, 10);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

// Prevent model from being recreated
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
