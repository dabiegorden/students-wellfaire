import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  title: string;
  category:
    | "Academic"
    | "Welfare"
    | "Accommodation"
    | "Finance"
    | "Health"
    | "Other";
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "In Progress" | "Resolved" | "Closed";

  // Admin reply
  adminId?: mongoose.Types.ObjectId;
  adminReply?: string;
  repliedAt?: Date;

  // AI Analysis fields
  aiPriority?: "Low" | "Medium" | "High" | "Critical";
  aiExplanation?: string;
  aiScore?: number; // 0–100
  aiAnalysedAt?: Date;

  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Academic",
        "Welfare",
        "Accommodation",
        "Finance",
        "Health",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    adminReply: {
      type: String,
      trim: true,
    },
    repliedAt: {
      type: Date,
    },

    // AI Analysis
    aiPriority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    aiExplanation: {
      type: String,
      trim: true,
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiAnalysedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Complaint =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;
