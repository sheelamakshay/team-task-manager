import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../admin.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTeamLead, setProjectTeamLead] = useState("");
  const [projectMembers, setProjectMembers] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [teamProject, setTeamProject] = useState("");
  const [teamLeadUpdate, setTeamLeadUpdate] = useState("");
  const [teamMembersUpdate, setTeamMembersUpdate] = useState([]);

  const [editUserId, setEditUserId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("member");
  const [editPassword, setEditPassword] = useState("");

  const name = sessionStorage.getItem("userName");
  const role = sessionStorage.getItem("role");
  const email = sessionStorage.getItem("email");
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchAllData = async () => {
    try {
      const taskRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, { headers });
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, { headers });
      const projectRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, { headers });
      const performanceRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/performance`, { headers });

      setTasks(taskRes.data);
      setUsers(userRes.data);
      setProjects(projectRes.data);
      setPerformance(performanceRes.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load admin dashboard data");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const membersOnly = users.filter((user) => user.role === "member");
  const allTeamLeadOptions = users;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const progressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;

  const pieData = [
    { name: "Todo", value: todoTasks },
    { name: "In Progress", value: progressTasks },
    { name: "Completed", value: completedTasks }
  ];

  const PIE_COLORS = ["#ff4d6d", "#ffb703", "#06d6a0"];

  const selectedProjectData = projects.find((project) => project._id === selectedProject);
  const selectedProjectMemberIds = selectedProjectData?.members?.map((m) => m._id) || [];

  const assignableMembers = membersOnly.filter((user) =>
    selectedProjectMemberIds.includes(user._id)
  );

  const handleMultiSelect = (e, setter) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setter(values);
  };

  const getProjectTasks = (projectId) => {
    return tasks.filter((task) => {
      const taskProjectId =
        typeof task.projectId === "object" ? task.projectId?._id : task.projectId;
      return taskProjectId === projectId;
    });
  };

  const getUserTasksForProject = (memberId, projectId) => {
    return tasks.filter((task) => {
      const assignedId =
        typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;

      const taskProjectId =
        typeof task.projectId === "object" ? task.projectId?._id : task.projectId;

      return assignedId === memberId && taskProjectId === projectId;
    });
  };

  const getProjectStats = (projectId) => {
    const projectTasks = getProjectTasks(projectId);

    const total = projectTasks.length;
    const completed = projectTasks.filter((task) => task.status === "done").length;
    const inProgress = projectTasks.filter((task) => task.status === "in-progress").length;
    const todo = projectTasks.filter((task) => task.status === "todo").length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, inProgress, todo, progress };
  };

  const getMemberProjectProgress = (memberId, projectId) => {
    const userTasks = getUserTasksForProject(memberId, projectId);

    const total = userTasks.length;
    const completed = userTasks.filter((task) => task.status === "done").length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, progress };
  };

  const getUserProjectCount = (id) => {
    return projects.filter((project) =>
      project.members?.some((member) => member._id === id)
    ).length;
  };

  const getUserTaskCount = (id) => {
    return tasks.filter((task) => {
      const assignedId =
        typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;
      return assignedId === id;
    }).length;
  };

  const createProject = async () => {
    if (!projectName || !projectDescription || !projectTeamLead) {
      alert("Enter project name, description and select reporting TL");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects`,
        {
          name: projectName,
          description: projectDescription,
          teamLead: projectTeamLead,
          members: projectMembers
        },
        { headers }
      );

      alert("Project created successfully");

      setProjectName("");
      setProjectDescription("");
      setProjectTeamLead("");
      setProjectMembers([]);
      setSelectedProject(res.data._id);

      fetchAllData();
    } catch (err) {
      console.log(err);
      alert("Project creation failed");
    }
  };

  const createTask = async () => {
    if (!selectedProject || !taskTitle || !taskDescription || !selectedUser || !dueDate) {
      alert("Select project, member, date and enter task details");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks`,
        {
          title: taskTitle,
          description: taskDescription,
          projectId: selectedProject,
          assignedTo: selectedUser,
          dueDate
        },
        { headers }
      );

      alert("Task assigned successfully");

      setTaskTitle("");
      setTaskDescription("");
      setSelectedUser("");
      setDueDate("");

      fetchAllData();
    } catch (err) {
      console.log(err);
      alert("Task creation failed");
    }
  };

  const loadProjectForTeamEdit = (projectId) => {
    const project = projects.find((p) => p._id === projectId);

    setTeamProject(projectId);
    setTeamLeadUpdate(project?.teamLead?._id || "");
    setTeamMembersUpdate(project?.members?.map((member) => member._id) || []);
  };

  const updateProjectTeam = async () => {
    if (!teamProject || !teamLeadUpdate) {
      alert("Select project and reporting TL");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/projects/${teamProject}/team`,
        {
          teamLead: teamLeadUpdate,
          members: teamMembersUpdate
        },
        { headers }
      );

      alert("Team updated successfully");
      fetchAllData();
    } catch (err) {
      console.log(err);
      alert("Team update failed");
    }
  };

  const deleteUser = async (user) => {
    if (user.role === "admin") {
      alert("Admins cannot delete another admin.");
      return;
    }

    if (!window.confirm(`Delete ${user.name}?`)) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`, {
        headers
      });

      alert("User deleted");
      fetchAllData();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const loadUserForEdit = (user) => {
    setEditUserId(user._id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
  };

  const updateUser = async () => {
    if (!editUserId) {
      alert("Select user first");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${editUserId}`,
        {
          name: editName,
          email: editEmail,
          role: editRole,
          password: editPassword
        },
        { headers }
      );

      alert("User updated successfully");

      setEditUserId("");
      setEditName("");
      setEditEmail("");
      setEditRole("member");
      setEditPassword("");

      fetchAllData();
    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="admin_dashboard">
        <div className="admin_topbar">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Welcome Admin, {name}</p>
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
            <h3>Total Tasks</h3>
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
            <h3>Todo</h3>
            <p>{todoTasks}</p>
          </div>
        </div>

        <div className="charts_grid">
          <div className="chart_card">
            <h3>Task Status Overview</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={105} label>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart_card">
            <h3>User Performance</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#06d6a0" name="Completed" />
                <Bar dataKey="inProgress" fill="#ffb703" name="In Progress" />
                <Bar dataKey="todo" fill="#ff4d6d" name="Todo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="performance_section">
          <h3>User Progress</h3>

          {performance.length === 0 ? (
            <p className="empty_text">No performance data available</p>
          ) : (
            performance.map((user) => (
              <div className="progress_card" key={user.userId}>
                <div className="progress_header">
                  <span>{user.name}</span>
                  <span>{user.progress}%</span>
                </div>

                <div className="progress_bar_bg">
                  <div
                    className="progress_bar_fill"
                    style={{ width: `${user.progress}%` }}
                  ></div>
                </div>

                <p>
                  Total: {user.total} | Completed: {user.completed} | In Progress:{" "}
                  {user.inProgress} | Todo: {user.todo} | Projects:{" "}
                  {getUserProjectCount(user.userId)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="admin_controls">
          <h3>Admin Controls</h3>

          <div className="control_grid">
            <div className="control_card create_project_card">
              <h4>Step 1: Create Project</h4>

              <input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <textarea
                placeholder="Project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />

              <select
                value={projectTeamLead}
                onChange={(e) => setProjectTeamLead(e.target.value)}
              >
                <option value="">Select Reporting TL</option>
                {allTeamLeadOptions.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>

              <select
                multiple
                value={projectMembers}
                onChange={(e) => handleMultiSelect(e, setProjectMembers)}
              >
                {membersOnly.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>

              <small>Hold Ctrl to select multiple team members</small>

              <button onClick={createProject}>Create Project</button>
            </div>

            <div className="control_card">
              <h4>Step 2: Select Active Project</h4>

              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setSelectedUser("");
                }}
              >
                <option value="">Select Active Project</option>
                {projects.map((project) => {
                  const stats = getProjectStats(project._id);

                  return (
                    <option key={project._id} value={project._id}>
                      {project.name} | TL: {project.teamLead?.name || "No TL"} | Tasks: {stats.total}
                    </option>
                  );
                })}
              </select>

              {selectedProjectData && (
                <div className="selected_project_box">
                  <h5>Active Project</h5>
                  <p><b>{selectedProjectData.name}</b></p>
                  <p>{selectedProjectData.description}</p>
                  <p><b>Reporting TL:</b> {selectedProjectData.teamLead?.name || "Not assigned"}</p>
                  <p>
                    <b>Team:</b>{" "}
                    {selectedProjectData.members?.length > 0
                      ? selectedProjectData.members.map((m) => m.name).join(", ")
                      : "No team assigned"}
                  </p>
                </div>
              )}

              <h4>Step 3: Create / Assign Task</h4>

              <input
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />

              <textarea
                placeholder="Task description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />

              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={!selectedProject}
              >
                <option value="">
                  {selectedProject ? "Select Project Member" : "Select project first"}
                </option>
                {assignableMembers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} | Projects: {getUserProjectCount(user._id)} | Tasks: {getUserTaskCount(user._id)}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <button onClick={createTask}>Assign Task</button>
            </div>

            <div className="control_card">
              <h4>Manage Teams</h4>

              <select
                value={teamProject}
                onChange={(e) => loadProjectForTeamEdit(e.target.value)}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <select
                value={teamLeadUpdate}
                onChange={(e) => setTeamLeadUpdate(e.target.value)}
              >
                <option value="">Select Reporting TL</option>
                {allTeamLeadOptions.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>

              <select
                multiple
                value={teamMembersUpdate}
                onChange={(e) => handleMultiSelect(e, setTeamMembersUpdate)}
              >
                {membersOnly.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - Projects: {getUserProjectCount(user._id)} - Tasks: {getUserTaskCount(user._id)}
                  </option>
                ))}
              </select>

              <small>Hold Ctrl to remove/add team members</small>

              <button onClick={updateProjectTeam}>Update Team</button>
            </div>

            <div className="control_card">
              <h4>Update User Credentials</h4>

              <select
                value={editUserId}
                onChange={(e) => {
                  const user = users.find((u) => u._id === e.target.value);
                  if (user) loadUserForEdit(user);
                }}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>

              <input
                placeholder="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <input
                placeholder="Email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />

              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="password"
                placeholder="New password optional"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />

              <button onClick={updateUser}>Update User</button>
            </div>
          </div>

          <div className="project_management_container">
            <div className="project_management_header">
              <div>
                <h3>Project & Team Management</h3>
                <p>Scrollable view of all active projects, reporting TLs, members, tasks, and progress.</p>
              </div>
              <span>{projects.length} Projects</span>
            </div>

            <div className="project_management_scroll">
              {projects.length === 0 ? (
                <p className="empty_text">No projects created yet</p>
              ) : (
                projects.map((project, index) => {
                  const stats = getProjectStats(project._id);

                  return (
                    <div
                      className={`project_management_card project_color_${index % 4}`}
                      key={project._id}
                    >
                      <div className="project_card_left">
                        <div className="project_card_title_row">
                          <h4>{project.name}</h4>
                          <span>{stats.progress}%</span>
                        </div>

                        <p>{project.description}</p>
                        <p><b>Reporting TL:</b> {project.teamLead?.name || "Not assigned"}</p>
                        <p>
                          <b>Team Members:</b>{" "}
                          {project.members?.length > 0
                            ? project.members.map((m) => m.name).join(", ")
                            : "No members assigned"}
                        </p>

                        <div className="project_counts">
                          <span>Total: {stats.total}</span>
                          <span>Todo: {stats.todo}</span>
                          <span>In Progress: {stats.inProgress}</span>
                          <span>Done: {stats.completed}</span>
                        </div>

                        <div className="progress_bar_bg">
                          <div
                            className="progress_bar_fill"
                            style={{ width: `${stats.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="project_card_right">
                        <h5>Member Progress</h5>

                        {project.members?.length === 0 ? (
                          <p>No team members</p>
                        ) : (
                          project.members.map((member) => {
                            const memberStats = getMemberProjectProgress(member._id, project._id);

                            return (
                              <div className="member_progress_row" key={member._id}>
                                <div className="member_progress_top">
                                  <span>{member.name}</span>
                                  <span>{memberStats.progress}%</span>
                                </div>

                                <div className="member_progress_bar_bg">
                                  <div
                                    className="member_progress_bar_fill"
                                    style={{ width: `${memberStats.progress}%` }}
                                  ></div>
                                </div>

                                <small>
                                  {memberStats.completed}/{memberStats.total} tasks completed
                                </small>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="users_section">
          <h3>All Users</h3>

          <div className="users_table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Assigned Projects</th>
                  <th>Assigned Tasks</th>
                  <th>User ID</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role_badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.approvalStatus}</td>
                    <td>{getUserProjectCount(user._id)}</td>
                    <td>{getUserTaskCount(user._id)}</td>
                    <td className="user_id_cell">{user._id}</td>
                    <td>
                      {user.role === "member" ? (
                        <button
                          className="delete_btn"
                          onClick={() => deleteUser(user)}
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="admin_lock">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tasks_section">
          <h3>All Tasks</h3>

          {tasks.length === 0 ? (
            <p className="empty_text">No tasks found</p>
          ) : (
            tasks.map((task) => (
              <div className="task_row" key={task._id}>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p><b>Status:</b> {task.status}</p>
                <p><b>Assigned To:</b> {task.assignedTo?.name || "Unknown"}</p>
                <p><b>Project:</b> {task.projectId?.name || "Unknown"}</p>
                <p><b>Project Description:</b> {task.projectId?.description || "No description"}</p>
                <p><b>Reporting TL:</b> {task.projectId?.teamLead?.name || "Not assigned"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;