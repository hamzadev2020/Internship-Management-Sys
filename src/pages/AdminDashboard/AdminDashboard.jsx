import api from "../../api/axios";

import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./admin.css";

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [reviewStatus, setReviewStatus] = useState("Approved");
    const [feedback, setFeedback] = useState("");
    const [grade, setGrade] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    const getTasks = async () => {
        try {
            const res = await api.get(
                "/api/tasks/getassignTask"
                
            );

            setTasks(res.data.tasks || []);
        } catch (error) {
            console.error(error);
            setMessage("Error fetching tasks");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!feedback.trim()) {
            setMessage("Please enter feedback");
            return;
        }

        if (reviewStatus === "Approved" && grade === "") {
            setMessage("Grade is required for approval");
            return;
        }

        try {
            setReviewLoading(true);
            setMessage("");

            const res = await api.post(
                "/api/admin/review/reviewTask",
                {
                    taskId: selectedTask._id,
                    reviewStatus,
                    feedback,
                    grade: reviewStatus === "Approved" ? Number(grade) : null
                },
               
            );

            setMessage(res.data.message);

            setSelectedTask(null);
            setReviewStatus("Approved");
            setFeedback("");
            setGrade("");

            await getTasks();

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Task review failed"
            );
        } finally {
            setReviewLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            getTasks();
        }
    }, []);



    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        navigate("/");
    };

    if (!token) {
        return <Navigate to="/" />;
    }

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === "Pending").length;
    const progressTasks = tasks.filter(t => t.status === "In Progress").length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;

    return (
        <div className="admin-container">

            <aside className="admin-sidebar">
                <h2>TaskFlow</h2>
                <p>ADMIN PANEL</p>

                <div className="sidebar-link active">
                    Dashboard
                </div>

                    <div className="sidebar-link">
                        <button onClick={()=>navigate("/taskmanager")}>
                        Task Management
                        </button>
                    </div>
                    <div className="sidebar-link">
                        <button onClick={()=>navigate("/allintern")}>
                        All Intern
                        </button>
                    </div>

                <div className="sidebar-bottom">
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            <main className="admin-main">

                <header className="admin-header">
                    <div>
                        <h1>Dashboard Overview</h1>
                        <p>Manage and monitor all intern tasks.</p>
                    </div>

                    <div className="admin-profile">
                        <span>Admin</span>
                        <div className="profile-avatar">A</div>
                    </div>
                </header>

                {message && <p className="error-message">{message}</p>}

                <section className="stats-grid">

                    <div className="stat-card">
                        <span>Total Tasks</span>
                        <h2>{totalTasks}

                        </h2>
                        <p>All assigned tasks</p>
                    </div>

                    <div className="stat-card pending-card">
                        <span>Pending</span>
                        <h2>{pendingTasks}</h2>
                        <p>Waiting to start</p>
                    </div>

                    <div className="stat-card progress-card">
                        <span>In Progress</span>
                        <h2>{progressTasks}</h2>
                        <p>Currently working</p>
                    </div>

                    <div className="stat-card completed-card">
                        <span>Completed</span>
                        <h2>{completedTasks}</h2>
                        <p>Tasks completed</p>
                    </div>

                </section>

                <section className="task-section">

                    <div className="section-heading">
                        <div>
                            <h2>All Tasks</h2>
                            <p>Overview of all assigned intern tasks</p>
                        </div>

                        <span className="task-count">
                            {totalTasks} Tasks
                        </span>
                    </div>

                    <div className="table-wrapper">
                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Intern</th>
                                    <th>Email</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
                                    <th>Review</th>
                                    <th>Grade</th>
                                    <th>Feedback</th>
                                    <th>SubmissionUrl</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="empty-table">
                                            No tasks available
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map(t => (
                                        <tr key={t._id}>
                                            <td className="task-name">{t.task}</td>
                                            <td>{t.assignedIntern?.name || "N/A"}</td>
                                            <td>{t.assignedIntern?.email || "N/A"}</td>
                                            <td>
                                                {new Date(t.deadline).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${t.status === "Completed" ? "completed" : t.status === "In Progress" ? "progress" : "pending"}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`review-badge ${t.reviewStatus === "Approved" ? "approved" : t.reviewStatus === "Needs Revision" ? "revision" : "review-pending"}`}>
                                                    {t.reviewStatus}
                                                </span>
                                            </td>
                                            <td>{t.grade ?? "-"}</td>
                                            <td>{t.feedback || "No feedback"}</td>
                                            <td>
                                                <td>
    {t.submissionUrl ? (
        <a
            href={t.submissionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="review-btn"
        >
            Open Project
        </a>
    ) : (
        <span>-</span>
    )}
</td>
                                            

                                          
                                            </td>

                                            <td>
                                                {t.status === "Completed" &&
                                                    t.reviewStatus === "Pending Review" ? (
                                                    <button
                                                        className="review-btn"
                                                        onClick={() => {
                                                            setSelectedTask(t);
                                                            setReviewStatus("Approved");
                                                            setFeedback("");
                                                            setGrade("");
                                                            setMessage("");
                                                        }}
                                                    >
                                                        Review
                                                    </button>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                        </tr>

                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>

                </section>

                {selectedTask && (
                    <div className="modal-overlay">

                        <div className="review-modal">

                            <div className="modal-header">
                                <div>
                                    <h2>Review Task</h2>
                                    <p>Review intern's submitted work</p>
                                </div>

                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="review-task-info">
                                <h3>{selectedTask.task}</h3>
                                <p>{selectedTask.description}</p>
                                <span>
                                    Intern: {selectedTask.assignedIntern?.name}
                                </span>
                            </div>

                            <form onSubmit={handleReviewSubmit}>

                                <label>Review Decision</label>

                                <select
                                    value={reviewStatus}
                                    onChange={(e) => {
                                        setReviewStatus(e.target.value);
                                        setGrade("");
                                    }}
                                >
                                    <option value="Approved">Approved</option>
                                    <option value="Needs Revision">Needs Revision</option>
                                </select>

                                {reviewStatus === "Approved" && (
                                    <>
                                        <label>Grade (0–100)</label>

                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                            placeholder="Enter grade"
                                            required
                                        />
                                    </>
                                )}

                                <label>Feedback</label>

                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Write feedback for intern..."
                                    rows="4"
                                    required
                                />

                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setSelectedTask(null)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="submit-review-btn"
                                        disabled={reviewLoading}
                                    >
                                        {reviewLoading ? "Submitting..." : "Submit Review"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};
