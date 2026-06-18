import React, { useState, useEffect } from "react";
import "../styles/MainHome.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import Chatbot from "../pages/Chatbot";
import TaskCard from "../components/TaskCard";



import {
  getTasks,
  createTask,
  updateTask
} from "../services/taskService";

function MainHome({ setSearch }) {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [bot, setBot] = useState(false);

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    deadline: ""
  });

  // Inside your function MainHome({ setSearch }) {, add this state:
const [editingTaskId, setEditingTaskId] = useState(null);

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (e) => {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value
    });
  };
  const handleEditClick = (task) => {
  setEditingTaskId(task._id);
  setTaskData({
    title: task.title,
    description: task.description || "",
    deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ""
  });
  setShowForm(true); // Opens your existing modal
};

const closeForm = () => {
  setShowForm(false);
  setEditingTaskId(null);
  setTaskData({ title: "", description: "", deadline: "" });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editingTaskId) {
      // If we are editing, call update API
      await updateTask(editingTaskId, {
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline
      });
    } else {
      // Otherwise, create a new task
      await createTask({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline
      });
    }

    await loadTasks();
    closeForm(); // Resets fields and closes modal
  } catch (error) {
    console.log(error);
  }
};

// Helper function to get color styling based on deadline severity
  const getDeadlineSeverityStyle = (deadlineStr) => {
    if (!deadlineStr) return { borderLeft: "5px solid #bdc3c7", backgroundColor: "#f8f9fa" };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date time
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0); // Normalize deadline date time
    
    const timeDiff = deadline.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      // Overdue/Missed -> Soft Red Tint with Red Border
      return { borderLeft: "6px solid #e74c3c", backgroundColor: "#fff5f5" }; 
    } else if (daysLeft <= 2) {
      // Urgent (0-2 days left) -> Soft Yellow Tint with Yellow Border
      return { borderLeft: "6px solid #f1c40f", backgroundColor: "#fefde8" }; 
    } else {
      // Safe -> Soft Green Tint with Green Border
      return { borderLeft: "6px solid #2ecc71", backgroundColor: "#f4fbf7" }; 
    }
  };

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-box">
          <img src={logo} alt="logo" />
        </div>

        <nav className="mainnav">
          <Link to="/mainhome">🏠 Home</Link>
          <Link to="/history">📜 Task History</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/about">ℹ️ About</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="content">

        <div className="topbar">
          <input
            className="search-bar"
            placeholder="🔍 Search tasks..."
            onChange={(e) =>
              setSearch && setSearch(e.target.value)
            }
          />
        </div>

        {/* Task List */}
        <div className="task-grid">

          {tasks.length === 0 ? (
            <div className="empty-state">
              <h2>No Tasks Found</h2>
              <p>Create your first task using +</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                refresh={loadTasks}
                onEdit={handleEditClick}
                style={getDeadlineSeverityStyle(task.deadline)}
              />
            ))
          )}

        </div>
      </main>

      {/* Chat Button */}
      <button
        className="chat-btn"
        onClick={() => setBot(true)}
      >
        💬
      </button>

      {/* Add Task Button */}
      <button
        className="add-btn"
        onClick={() => setShowForm(true)}
      >
        +
      </button>

      {/* Modal Form */}
      {/* Modal Form */}
{showForm && (
  <div className="modal">
    <form className="task-form" onSubmit={handleSubmit}>
      
      {/* CHANGE THIS HEADER LINE */}
      <h2>{editingTaskId ? "Edit Task" : "Create Task"}</h2>

      <input
        name="title"
        placeholder="Task Title"
        value={taskData.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Task Description"
        value={taskData.description}
        onChange={handleChange}
      />

      <input
        type="date"
        name="deadline"
        value={taskData.deadline}
        onChange={handleChange}
        required
      />

      {/* CHANGE THIS SAVE BUTTON LINE */}
      <button className="save-btn" type="submit">
        {editingTaskId ? "Update Task" : "Save Task"}
      </button>

      {/* CHANGE THIS CANCEL BUTTON LINE */}
      <button
        type="button"
        className="cancel-btn"
        onClick={closeForm} // <--- CHANGE THIS CLICK HANDLER
      >
        Cancel
      </button>
    </form>
  </div>
)}

      {/* Chatbot */}
      {bot && <Chatbot setBot={setBot} />}

    </div>
  );
}

export default MainHome;