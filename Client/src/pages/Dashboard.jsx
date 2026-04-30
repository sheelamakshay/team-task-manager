import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../admin.css";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const questions = [
  {
    question: "Which keyword is used to declare a constant in JavaScript?",
    options: ["var", "let", "const", "static"],
    answer: "const"
  },
  {
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Applied Program Input",
      "Application Process Internet",
      "Advanced Programming Index"
    ],
    answer: "Application Programming Interface"
  },
  {
    question: "Which method is used to send data to a backend API?",
    options: ["GET", "POST", "READ", "FETCHONLY"],
    answer: "POST"
  },
  {
    question: "Which database type is MongoDB?",
    options: ["SQL", "NoSQL", "Spreadsheet", "File-only DB"],
    answer: "NoSQL"
  },
  {
    question: "Which React hook is used for state?",
    options: ["useState", "useRoute", "useData", "useNode"],
    answer: "useState"
  }
];

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [openExplanation, setOpenExplanation] = useState(null);

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [answers, setAnswers] = useState({});

  const name = sessionStorage.getItem("userName");
  const role = sessionStorage.getItem("role");
  const email = sessionStorage.getItem("email");
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tasks`,
        { headers }
      );

      const assignedTasks = res.data.filter((task) => {
        const assignedId =
          typeof task.assignedTo === "object"
            ? task.assignedTo?._id
            : task.assignedTo;

        return assignedId === userId;
      });

      setTasks(assignedTasks);
    } catch (err) {
      console.log(err);
      alert("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!activeTaskId) return;

    if (timeLeft <= 0) {
      endAssessment(activeTaskId);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTaskId, timeLeft]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`,
        { status },
        { headers }
      );

      fetchTasks();
    } catch (err) {
      console.log(err);
      alert("Failed to update task");
    }
  };

  const startAssessment = async (taskId) => {
    alert(
      "This is designed only for testing currently.\n\nA 5-minute programming assessment will start now. After ending the task, progress will update as completed to show the example workflow."
    );

    setActiveTaskId(taskId);
    setTimeLeft(300);
    setAnswers({});
    await updateTaskStatus(taskId, "in-progress");
  };

  const endAssessment = async (taskId) => {
    alert("Assessment ended. Task marked as completed for testing workflow.");
    setActiveTaskId(null);
    setTimeLeft(300);
    setAnswers({});
    await updateTaskStatus(taskId, "done");
  };

  const handleAnswer = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value
    }));
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "Not available";

    return new Date(dateValue).toLocaleString();
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const progressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;

  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const pieData = [
    { name: "Todo", value: todoTasks },
    { name: "In Progress", value: progressTasks },
    { name: "Completed", value: completedTasks }
  ];

  const barData = [
    {
      name: "My Tasks",
      todo: todoTasks,
      inProgress: progressTasks,
      completed: completedTasks
    }
  ];

  const PIE_COLORS = ["#ff4d6d", "#ffb703", "#06d6a0"];

  return (
    <>
      <Navbar />

      <div className="admin_dashboard">
        <div className="admin_topbar">
          <div>
            <h2>User Dashboard</h2>
            <p>
              Welcome, <b>{name}</b>
            </p>
          </div>

          <div className="profile_area">
            <button
              className="profile_button"
              onClick={() => setShowProfile(!showProfile)}
            >
              👤
            </button>

            {showProfile && (
              <div className="profile_card">
                <h3>{name}</h3>
                <p><b>Email:</b> {email}</p>
                <p><b>User ID:</b> {userId}</p>
                <p><b>Role:</b> {role}</p>
              </div>
            )}
          </div>
        </div>

        <div className="stats_grid">
          <div className="stat_card stat_blue">
            <h3>Total</h3>
            <p>{totalTasks}</p>
          </div>

          <div className="stat_card stat_green">
            <h3>Completed</h3>
            <p>{completedTasks}</p>
          </div>

          <div className="stat_card stat_yellow">
            <h3>In Progress</h3>
            <p>{progressTasks}</p>
          </div>

          <div className="stat_card stat_red">
            <h3>Pending</h3>
            <p>{todoTasks}</p>
          </div>
        </div>

        <div className="charts_grid">
          <div className="chart_card">
            <h3>Task Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart_card">
            <h3>Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#06d6a0" />
                <Bar dataKey="inProgress" fill="#ffb703" />
                <Bar dataKey="todo" fill="#ff4d6d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="performance_section">
          <h3>Overall Progress</h3>

          <div className="progress_card">
            <div className="progress_header">
              <span>{name}</span>
              <span>{progressPercent}%</span>
            </div>

            <div className="progress_bar_bg">
              <div
                className="progress_bar_fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="tasks_section">
          <h3>My Tasks</h3>

          {tasks.length === 0 ? (
            <p className="empty_text">No tasks assigned yet</p>
          ) : (
            tasks.map((task, index) => (
              <div
                className={`user_task_container user_task_color_${index % 4}`}
                key={task._id}
              >
                <div className="user_task_header">
                  <div>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                  </div>

                  <span className={`task_status_badge ${task.status}`}>
                    {task.status}
                  </span>
                </div>

                <div className="user_project_details">
                  <h5>Project Details</h5>

                  <div className="user_project_grid">
                    <p><b>Project:</b> {task.projectId?.name || "Unknown"}</p>
                    <p><b>Reporting TL:</b> {task.projectId?.teamLead?.name || "Not assigned"}</p>
                    <p><b>Assigned By:</b> {task.projectId?.createdBy?.name || "Admin"}</p>
                    <p><b>Assigned Time:</b> {formatDateTime(task.createdAt)}</p>
                  </div>

                  <p>
                    <b>Project Description:</b>{" "}
                    {task.projectId?.description || "No description"}
                  </p>
                </div>

                <div className="user_task_actions">
                  {task.status === "todo" && (
                    <button
                      className="start_btn"
                      onClick={() => startAssessment(task._id)}
                    >
                      Start Assessment
                    </button>
                  )}

                  {task.status === "in-progress" && activeTaskId !== task._id && (
                    <button
                      className="complete_btn"
                      onClick={() => endAssessment(task._id)}
                    >
                      End Task
                    </button>
                  )}

                  <button
                    className="explain_btn"
                    onClick={() =>
                      setOpenExplanation(
                        openExplanation === task._id ? null : task._id
                      )
                    }
                  >
                    Guide
                  </button>
                </div>

                {activeTaskId === task._id && (
                  <div className="assessment_box">
                    <div className="assessment_header">
                      <h4>5-Minute Programming Assessment</h4>
                      <span>{formatTime(timeLeft)}</span>
                    </div>

                    <p className="assessment_note">
                      This assessment is currently used as an example workflow tracker.
                    </p>

                    {questions.map((q, index) => (
                      <div className="question_card" key={index}>
                        <p><b>{index + 1}. {q.question}</b></p>

                        {q.options.map((option) => (
                          <label key={option}>
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={answers[index] === option}
                              onChange={() => handleAnswer(index, option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    ))}

                    <button
                      className="complete_btn"
                      onClick={() => endAssessment(task._id)}
                    >
                      End Task
                    </button>
                  </div>
                )}

                {openExplanation === task._id && (
                  <div className="explanation_box">
                    <h4>Task Guide</h4>
                    <p>
                      Read the task details, understand the project description,
                      check your reporting TL, start the assessment, answer the
                      sample programming questions, and end the task to complete
                      the example workflow.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;