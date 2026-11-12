
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_URL = "http://localhost:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setError("");
    } catch (err) {
      setError("Could not fetch tasks. Check the backend server.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add a new task
  const createTask = async () => {
    if (!title.trim()) {
      setError("Please enter a task title.");
      setSuccess("");
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        title: title.trim(),
      });

      setTasks((previous) => [response.data, ...previous]);
      setTitle("");
      setError("");
      setSuccess("Task added successfully!");
    } catch (err) {
      setError("Could not add task.");
      setSuccess("");
    }
  };

  // Update task status
  const updateTaskStatus = async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, {
        status,
      });

      setTasks((previous) =>
        previous.map((task) =>
          task._id === id ? response.data : task
        )
      );

      setError("");
      setSuccess("Task status updated successfully!");
    } catch (err) {
      setError("Could not update task status.");
      setSuccess("");
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);

      setTasks((previous) =>
        previous.filter((task) => task._id !== id)
      );

      setError("");
      setSuccess("Task deleted successfully!");
    } catch (err) {
      setError("Could not delete task.");
      setSuccess("");
    }
  };

  // Display task dashboard
  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Project Task Management</h1>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <input
              className="form-control"
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createTask();
              }}
            />
            <button className="btn btn-primary" onClick={createTask}>
              Add Task
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        {["Pending", "Ongoing", "Completed"].map((status) => {
          const filteredTasks = tasks.filter(
            (task) => task.status === status
          );

          return (
            <div className="col-md-4 mb-3" key={status}>
              <div className="card task-column h-100">
                <div className={`card-header header-${status.toLowerCase()}`}>
                  <h5 className="mb-0">{status} Tasks</h5>
                  <span className="badge bg-light text-dark">
                    {filteredTasks.length}
                  </span>
                </div>

                <div className="card-body">
                  {filteredTasks.length === 0 && (
                    <p className="text-muted">No tasks in this category.</p>
                  )}

                  {filteredTasks.map((task) => (
                    <div className="task-item mb-3" key={task._id}>
                      <h6>{task.title}</h6>
                      <p className="text-muted mb-2">
                        Status: {task.status}
                      </p>

                      <div className="d-flex flex-wrap gap-2">
                        {task.status !== "Pending" && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() =>
                              updateTaskStatus(task._id, "Pending")
                            }
                          >
                            Pending
                          </button>
                        )}

                        {task.status !== "Ongoing" && (
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() =>
                              updateTaskStatus(task._id, "Ongoing")
                            }
                          >
                            Ongoing
                          </button>
                        )}

                        {task.status !== "Completed" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              updateTaskStatus(task._id, "Completed")
                            }
                          >
                            Complete
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteTask(task._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
