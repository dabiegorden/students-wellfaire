import mongoose, { Schema, Document } from "mongoose";

export interface IAnalytics extends Document {
  date: Date;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  closedComplaints: number;

  // By category
  complaintsByCategory: {
    Academic: number;
    Welfare: number;
    Accommodation: number;
    Finance: number;
    Health: number;
    Other: number;
  };

  // By priority
  complaintsByPriority: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };

  // By faculty
  complaintsByFaculty: {
    [faculty: string]: number;
  };

  averageResolutionTime: number; // in hours
  totalStudents: number;
  activeStudents: number;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: Date,
      default: Date.now,
      unique: true,
    },
    totalComplaints: {
      type: Number,
      default: 0,
    },
    resolvedComplaints: {
      type: Number,
      default: 0,
    },
    pendingComplaints: {
      type: Number,
      default: 0,
    },
    inProgressComplaints: {
      type: Number,
      default: 0,
    },
    closedComplaints: {
      type: Number,
      default: 0,
    },
    complaintsByCategory: {
      type: {
        Academic: { type: Number, default: 0 },
        Welfare: { type: Number, default: 0 },
        Accommodation: { type: Number, default: 0 },
        Finance: { type: Number, default: 0 },
        Health: { type: Number, default: 0 },
        Other: { type: Number, default: 0 },
      },
      default: {},
    },
    complaintsByPriority: {
      type: {
        Low: { type: Number, default: 0 },
        Medium: { type: Number, default: 0 },
        High: { type: Number, default: 0 },
        Critical: { type: Number, default: 0 },
      },
      default: {},
    },
    complaintsByFaculty: {
      type: Schema.Types.Mixed,
      default: {},
    },
    averageResolutionTime: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    activeStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Analytics =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
