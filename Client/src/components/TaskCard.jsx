import React from "react";
import axios from "axios";

function TaskCard({ task, refresh }) {
  const updateStatus = async (status) => {
    try {
      const token = sessionStorage.getItem("token"); // ✅ FIXED

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      refresh();
    } catch (err) {
      console.log(err);
      alert("Failed to update task");
    }
  };

  return (
    <div className="task_row">
      <h4>{task.title}</h4>

      <p>{task.description}</p>

      <p>
        <b>Status:</b>{" "}
        <span
          className={`role_badge ${
            task.status === "done"
              ? "member"
              : task.status === "in-progress"
              ? "admin"
              : ""
          }`}
        >
          {task.status}
        </span>
      </p>

      {task.assignedTo && (
        <p>
          <b>Assigned To:</b> {task.assignedTo?.name || "Unknown"}
        </p>
      )}

      {task.projectId && (
        <p>
          <b>Project:</b> {task.projectId?.name || "Unknown"}
        </p>
      )}

      {task.dueDate && (
        <p>
          <b>Due Date:</b>{" "}
          {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      {/* ACTION BUTTONS */}
      <div className="user_task_actions">
        <button
          className="start_btn"
          onClick={() => updateStatus("todo")}
        >
          Todo
        </button>

        <button
          className="explain_btn"
          onClick={() => updateStatus("in-progress")}
        >
          In Progress
        </button>

        <button
          className="complete_btn"
          onClick={() => updateStatus("done")}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default TaskCard;