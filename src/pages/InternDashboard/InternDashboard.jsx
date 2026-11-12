import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './intern.css';
import api from "../../api/axios";

// Accepts only a GitHub repo link: https://github.com/<owner>/<repo>
// (format check only: it can't know if the repo exists or is public)
const isValidGithubUrl = (value) => {
    try {
        const url = new URL(String(value || "").trim());
        const validProtocol = url.protocol === "https:" || url.protocol === "http:";
        const validHost = url.hostname === "github.com" || url.hostname === "www.github.com";
        const segments = url.pathname.split("/").filter(Boolean);
        return validProtocol && validHost && segments.length >= 2;
    } catch {
        return false;
    }
};


export const InternDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [tasksUrl, setTasksUrl] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [urlErrorId, setUrlErrorId] = useState(null); // task whose link was rejected
    const navigate = useNavigate();

    const token = sessionStorage.getItem("token");

    const handleInput = (e, taskId) => {
        const { name, value } = e.target;

        setUrlErrorId(null);

        setTasks((prevtask) =>

            prevtask.map((task) => (task._id || task.id) === taskId ? { ...task, [name]: value } : task)


        )



    }




    // Redirect immediately if not authenticated
    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [token, navigate]);

    const fetchTasks = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await api.get("/api/tasks/assignTaskIntern");


            setTasks(res.data.tasks || []);
            if (res.data.message) setMessage(res.data.message);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setMessage("Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (id, status, submissionUrl) => {
        const cleanUrl = typeof submissionUrl === "string" ? submissionUrl.trim() : submissionUrl;

        // A task can only be completed with a valid GitHub link
        if (status === "Completed" && !isValidGithubUrl(cleanUrl)) {
            setUrlErrorId(id);
            setMessage("");
            return;
        }
        setUrlErrorId(null);

        try {
            const res = await api.put(
                `/api/tasks/updateTaskIntern/${id}`,
                { status, submissionUrl: cleanUrl }
            );
            setMessage(res.data.message);
            await fetchTasks();
        } catch (error) {
            console.error("Error updating task:", error);
            setMessage("Failed to update task.");
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Helper helper to color code statuses
    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-completed';
            case 'In Progress': return 'status-progress';
            default: return 'status-pending';
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header Navbar */}
            <header className="dashboard-header">
                <div>
                    <h1>Intern Dashboard</h1>
                    <p className="welcome-text">Welcome back! Manage and track your assignments below.</p>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Log Out
                </button>
            </header>

            {/* Notification Message */}
            {message && <div className="alert-message">{message}</div>}

            {/* Main Content Area */}
            <main className="dashboard-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Tasks Assigned</h3>
                        <p>You don't have any tasks right now. Check back later!</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Description</th>
                                    <th>Submission URL</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
                                    <th>Review</th>
                                    <th>Grade</th>
                                    <th>Feedback</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task._id || task.id}>
                                        <td className="font-bold">{task.task}</td>
                                        <td className="text-muted">{task.description}</td>

                                        <td className="text-muted">
                                            <input
                                                type="url"
                                                name="submissionUrl"
                                                placeholder="https://github.com/username/repo"
                                                value={task.submissionUrl || ""}
                                                disabled={task.status === "Completed"}
                                                className={urlErrorId === (task._id || task.id) ? "input-error" : ""}
                                                aria-invalid={urlErrorId === (task._id || task.id)}
                                                onChange={(e) => handleInput(e, task._id || task.id)}
                                            />
                                            {urlErrorId === (task._id || task.id) && (
                                                <small className="field-error">
                                                    Enter a valid GitHub repository link to complete this task.
                                                </small>
                                            )}
                                        </td>


                                        <td>{new Date(task.deadline).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`review-badge ${task.reviewStatus?.toLowerCase()}`}>
                                                {task.reviewStatus || "Pending Review"}
                                            </span>
                                        </td>
                                        <td className="font-bold text-center">{task.grade ?? "-"}</td>
                                        <td className="text-italic feedback-cell">{task.feedback || "No feedback yet"}</td>
                                        <td>
                                            <select
                                                className="status-select"
                                                value={task.status}
                                                disabled={task.status === "Completed"}
                                                onChange={(e) => updateTaskStatus(task._id, e.target.value, task.submissionUrl)}
                                            >
                                                {task.status === "Pending" && (
                                                    <>
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                    </>
                                                )}
                                                {task.status === "In Progress" && (
                                                    <>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </>
                                                )}
                                                {task.status === "Completed" && (
                                                    <option value="Completed">Completed</option>
                                                )}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};