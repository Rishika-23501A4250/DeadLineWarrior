import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask // 1. Make sure this service is imported
} from "../services/taskService";
import TaskCard from "../components/TaskCard";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // 2. State to keep track of the task being edited
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

  // 3. This runs when you click "Edit" on a card
  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    
    // Formats the date so the input field can read it safely
    if (task.deadline) {
      setDeadline(new Date(task.deadline).toISOString().split('T')[0]);
    }
  };

  // 4. Handles saving either a new task OR an edited task
  const saveTask = async () => {
    if (!title || !deadline) {
      alert("Title and Deadline are required");
      return;
    }

    try {
      if (editingTaskId) {
        // If editing, call the update API
        await updateTask(editingTaskId, { title, description, deadline });
        setEditingTaskId(null); 
      } else {
        // If not editing, call the create API
        await createTask({ title, description, deadline });
      }

      // Clear the form fields
      setTitle("");
      setDescription("");
      setDeadline("");
      loadTasks();
    } catch (error) {
      console.log(error);
      alert("Failed to save task");
    }
  };

  return (
    <div>
      <h2>{editingTaskId ? "Edit Task" : "Task Manager"}</h2>

      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br /><br />

      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br /><br />

      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <br /><br />

      <button onClick={saveTask}>
        {editingTaskId ? "Update Task" : "Add Task"}
      </button>

      {editingTaskId && (
        <button 
          onClick={() => {
            setEditingTaskId(null);
            setTitle("");
            setDescription("");
            setDeadline("");
          }} 
          style={{ marginLeft: "10px" }}
        >
          Cancel
        </button>
      )}

      <hr />

      <h3>Your Tasks</h3>

      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            refresh={loadTasks}
            onEdit={handleEditClick} // 5. CRITICAL: Passing the function down
          />
        ))
      )}
    </div>
  );
}

export default Tasks;