import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  student: Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageSender?: "students" | "admin";
  studentUnreadCount: number;
  adminUnreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
    },
    lastMessageSender: {
      type: String,
      enum: ["students", "admin"],
    },
    studentUnreadCount: {
      type: Number,
      default: 0,
    },
    adminUnreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
