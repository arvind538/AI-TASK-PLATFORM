const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ["info", "error", "success"], default: "info" },
  timestamp: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    inputText: {
      type: String,
      required: [true, "Input text is required"],
    },
    operation: {
      type: String,
      required: true,
      enum: ["uppercase", "lowercase", "reverse", "wordcount"],
    },
    status: {
      type: String,
      enum: ["pending", "running", "success", "failed"],
      default: "pending",
      index: true,
    },
    result: {
      type: String,
      default: null,
    },
    logs: [logSchema],
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index for user + status queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Task", taskSchema);
