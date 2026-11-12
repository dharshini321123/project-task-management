
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully");

        // Start server only after database connection
        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Task Schema
const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Pending", "Ongoing", "Completed"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

// Task Model
const Task = mongoose.model("Task", taskSchema);

// Home Route
app.get("/", (req, res) => {
    res.send("Project Task Management API is running successfully!");
});

// Get All Tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({
            message: "Could not fetch tasks."
        });
    }
});

// Add New Task
app.post("/tasks", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required."
            });
        }

        const task = await Task.create({
            title: title.trim()
        });

        res.status(201).json(task);
    } catch (err) {
        console.error("Create error:", err);
        res.status(500).json({
            message: "Could not create task."
        });
    }
});

// Update Task Status
app.patch("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        if (!["Pending", "Ongoing", "Completed"].includes(status)) {
            return res.status(400).json({
                message: "Invalid task status."
            });
        }

        const task = await Task.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.status(200).json(task);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({
            message: "Could not update task."
        });
    }
});

// Delete Task
app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.status(200).json({
            message: "Task deleted successfully."
        });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({
            message: "Could not delete task."
        });
    }
});
