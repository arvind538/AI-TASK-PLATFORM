const Task = require("../models/Task");

// In-memory queue (for production, use BullMQ with Redis)
const taskQueue = [];
let isProcessing = false;

// ─── Task Operations ───────────────────────────────────────────
const operations = {
  uppercase: (text) => text.toUpperCase(),
  lowercase: (text) => text.toLowerCase(),
  reverse: (text) => text.split("").reverse().join(""),
  wordcount: (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return `Word Count: ${words.length} words | Character Count: ${text.length} chars`;
  },
};

// ─── Add task to queue ─────────────────────────────────────────
const enqueueTask = (taskId) => {
  taskQueue.push(taskId);
  console.log(`📥 Task ${taskId} added to queue. Queue size: ${taskQueue.length}`);
  processNext();
};

// ─── Process next task in queue ────────────────────────────────
const processNext = async () => {
  if (isProcessing || taskQueue.length === 0) return;

  isProcessing = true;
  const taskId = taskQueue.shift();

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      console.log(`⚠️  Task ${taskId} not found in DB, skipping.`);
      isProcessing = false;
      processNext();
      return;
    }

    // Mark as running
    task.status = "running";
    task.startedAt = new Date();
    task.logs.push({
      message: `Task started. Operation: ${task.operation}`,
      level: "info",
    });
    await task.save();
    console.log(`🔄 Processing task ${taskId} - ${task.operation}`);

    // Simulate async processing delay (500ms - 2s)
    const delay = Math.floor(Math.random() * 1500) + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Execute operation
    const operationFn = operations[task.operation];

    if (!operationFn) {
      throw new Error(`Unknown operation: ${task.operation}`);
    }

    const result = operationFn(task.inputText);

    // Mark as success
    task.status = "success";
    task.result = result;
    task.completedAt = new Date();
    task.logs.push({
      message: `Processing completed in ${delay}ms`,
      level: "info",
    });
    task.logs.push({
      message: `Result generated successfully`,
      level: "success",
    });
    await task.save();
    console.log(`✅ Task ${taskId} completed successfully`);
  } catch (error) {
    console.error(`❌ Task ${taskId} failed:`, error.message);
    try {
      await Task.findByIdAndUpdate(taskId, {
        status: "failed",
        completedAt: new Date(),
        $push: {
          logs: {
            message: `Error: ${error.message}`,
            level: "error",
          },
        },
      });
    } catch (updateError) {
      console.error("Failed to update task status:", updateError.message);
    }
  } finally {
    isProcessing = false;
    // Process next item after a short delay
    setTimeout(processNext, 100);
  }
};

module.exports = { enqueueTask };
