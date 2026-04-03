const express = require("express");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");
const { enqueueTask } = require("../worker/processor");
const { apiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// All task routes require authentication
router.use(protect);
router.use(apiLimiter);

// @route   GET /api/tasks
// @desc    Get all tasks for logged-in user
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, inputText, operation } = req.body;

    if (!title || !inputText || !operation) {
      return res.status(400).json({ message: "Title, input text and operation are required" });
    }

    const validOps = ["uppercase", "lowercase", "reverse", "wordcount"];
    if (!validOps.includes(operation)) {
      return res.status(400).json({ message: `Invalid operation. Choose from: ${validOps.join(", ")}` });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      inputText,
      operation,
      status: "pending",
      logs: [{ message: "Task created successfully", level: "info" }],
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

// @route   POST /api/tasks/:id/run
// @desc    Run/execute a task
router.post("/:id/run", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "running") {
      return res.status(400).json({ message: "Task is already running" });
    }

    // Reset task for re-run if previously completed
    task.status = "pending";
    task.result = null;
    task.startedAt = null;
    task.completedAt = null;
    task.logs = [{ message: "Task queued for processing", level: "info" }];
    await task.save();

    // Enqueue task for background processing
    enqueueTask(task._id.toString());

    res.json({ message: "Task queued successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Failed to run task" });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// @route   GET /api/tasks/:id/logs
// @desc    Get logs for a task
router.get("/:id/logs", async (req, res) => {
  try {
    const task = await Task.findOne(
      { _id: req.params.id, user: req.user._id },
      "logs status result"
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ logs: task.logs, status: task.status, result: task.result });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;
