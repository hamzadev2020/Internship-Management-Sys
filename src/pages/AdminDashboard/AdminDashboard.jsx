import api from "../../api/axios";

import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./admin.css";

/* ---------- Small inline icons (no extra library needed) ---------- */

const Icon = ({ children, size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const icons = {
    brand: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </>
    ),
    dashboard: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
    ),
    tasks: (
        <>
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="m9 14 2 2 4-4" />
        </>
    ),
    users: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
    ),
    logout: (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
        </>
    ),
    layers: (
        <>
            <path d="M12 3 2 8l10 5 10-5-10-5Z" />
            <path d="m2 13 10 5 10-5" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    check: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </>
    ),
    external: (
        <>
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" />
};

/* ---------- Helpers (display only) ---------- */

// Only http(s) links become clickable, so a "javascript:" link can never run
const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const isOverdue = (deadline, status) => {
    if (!deadline || status === "Completed") return false;
    const due = new Date(deadline);
    if (isNaN(due)) return false;
    due.setHours(23, 59, 59, 999);
    return due < new Date();
};

const initial = (name) => (name || "?").trim().charAt(0).toUpperCase() || "?";


export const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");
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
            setMessageType("error");
            setMessage("Error fetching tasks");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!feedback.trim()) {
            setMessageType("error");
            setMessage("Please enter feedback");
            return;
        }

        if (reviewStatus === "Approved" && grade === "") {
            setMessageType("error");
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

            setMessageType("success");
            setMessage(res.data.message);

            setSelectedTask(null);
            setReviewStatus("Approved");
            setFeedback("");
            setGrade("");

            await getTasks();

        } catch (error) {
            setMessageType("error");
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
    const awaitingReview = tasks.filter(
        t => t.status === "Completed" && t.reviewStatus === "Pending Review"
    ).length;

    const pct = (n) => (totalTasks ? Math.round((n / totalTasks) * 100) : 0);

    return (
        <div className="admin-container">

            <aside className="admin-sidebar">

                <div className="brand">
                    <div className="brand-mark">
                        <Icon size={20}>{icons.brand}</Icon>
                    </div>
                    <div className="brand-text">
                        <h2>TaskFlow</h2>
                        <p>Admin Panel</p>
                    </div>
                </div>

                <span className="nav-label">Menu</span>

                <nav className="sidebar-nav">
                    <div className="nav-item active" aria-current="page" title="Dashboard">
                        <Icon>{icons.dashboard}</Icon>
                        <span className="nav-text">Dashboard</span>
                    </div>

                    <Link
                        className="nav-item"
                        to="/taskmanager"
                        title="Task Management"
                        aria-label="Task Management"
                    >
                        <Icon>{icons.tasks}</Icon>
                        <span className="nav-text">Task Management</span>
                    </Link>

                    <Link
                        className="nav-item"
                        to="/allintern"
                        title="All Interns"
                        aria-label="All Interns"
                    >
                        <Icon>{icons.users}</Icon>
                        <span className="nav-text">All Interns</span>
                    </Link>
                </nav>

                <div className="sidebar-bottom">
                    <button onClick={handleLogout} title="Logout" aria-label="Logout">
                        <Icon>{icons.logout}</Icon>
                        <span className="nav-text">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">

                <header className="admin-header">
                    <div>
                        <h1>Dashboard Overview</h1>
                        <p>Manage and monitor all intern tasks.</p>
                    </div>

                    <div className="header-actions">
                        <Link className="primary-btn" to="/taskmanager">
                            <Icon size={16}>{icons.plus}</Icon>
                            Assign Task
                        </Link>

                        <div className="admin-profile">
                            <span>Admin</span>
                            <div className="profile-avatar">A</div>
                        </div>
                    </div>
                </header>

                {message && (
                    <div className={`alert ${messageType}`} role="status">
                        {message}
                    </div>
                )}

                <section className="stats-grid">

                    <div className="stat-card">
                        <div className="stat-top">
                            <span className="stat-label">Total Tasks</span>
                            <div className="stat-icon indigo"><Icon>{icons.layers}</Icon></div>
                        </div>
                        <h2>{totalTasks}</h2>
                        <p>All assigned tasks</p>
                    </div>

                    <div className="stat-card pending-card">
                        <div className="stat-top">
                            <span className="stat-label">Pending</span>
                            <div className="stat-icon amber"><Icon>{icons.clock}</Icon></div>
                        </div>
                        <h2>{pendingTasks}</h2>
                        <p>Waiting to start · {pct(pendingTasks)}% of total</p>
                    </div>

                    <div className="stat-card progress-card">
                        <div className="stat-top">
                            <span className="stat-label">In Progress</span>
                            <div className="stat-icon blue"><Icon>{icons.activity}</Icon></div>
                        </div>
                        <h2>{progressTasks}</h2>
                        <p>Currently working · {pct(progressTasks)}% of total</p>
                    </div>

                    <div className="stat-card completed-card">
                        <div className="stat-top">
                            <span className="stat-label">Completed</span>
                            <div className="stat-icon green"><Icon>{icons.check}</Icon></div>
                        </div>
                        <h2>{completedTasks}</h2>
                        <p>Tasks completed · {pct(completedTasks)}% of total</p>
                    </div>

                </section>

                <section className="task-section">

                    <div className="section-heading">
                        <div>
                            <h2>All Tasks</h2>
                            <p>Overview of all assigned intern tasks</p>
                        </div>

                        <div className="heading-pills">
                            {awaitingReview > 0 && (
                                <span className="task-count warn">
                                    {awaitingReview} awaiting review
                                </span>
                            )}
                            <span className="task-count">
                                {totalTasks} Tasks
                            </span>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Intern</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
                                    <th>Review</th>
                                    <th>Grade</th>
                                    <th>Feedback</th>
                                    <th>Submission</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="empty-table">
                                            No tasks available
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map(t => (
                                        <tr key={t._id}>
                                            <td className="task-name">{t.task}</td>

                                            <td>
                                                <div className="intern-cell">
                                                    <div className="intern-avatar">
                                                        {initial(t.assignedIntern?.name)}
                                                    </div>
                                                    <div className="intern-meta">
                                                        <strong>{t.assignedIntern?.name || "N/A"}</strong>
                                                        <small>{t.assignedIntern?.email || "N/A"}</small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="deadline-cell">
                                                <div>{new Date(t.deadline).toLocaleDateString()}</div>
                                                {isOverdue(t.deadline, t.status) && (
                                                    <span className="overdue-tag">Overdue</span>
                                                )}
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

                                            <td>
                                                {t.grade == null ? "-" : (
                                                    <span className="grade">
                                                        {t.grade}<small>/100</small>
                                                    </span>
                                                )}
                                            </td>

                                            <td className="feedback-cell">
                                                {t.feedback ? (
                                                    <span title={t.feedback}>{t.feedback}</span>
                                                ) : (
                                                    <span className="muted">No feedback</span>
                                                )}
                                            </td>

                                            <td>
                                                {isHttpUrl(t.submissionUrl) ? (
                                                    <a
                                                        href={t.submissionUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="link-btn"
                                                    >
                                                        Open Project
                                                        <Icon size={14}>{icons.external}</Icon>
                                                    </a>
                                                ) : t.submissionUrl ? (
                                                    <span className="muted">Invalid link</span>
                                                ) : (
                                                    <span>-</span>
                                                )}
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

                        <div
                            className="review-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="review-title"
                        >

                            <div className="modal-header">
                                <div>
                                    <h2 id="review-title">Review Task</h2>
                                    <p>Review intern's submitted work</p>
                                </div>

                                <button
                                    type="button"
                                    className="close-btn"
                                    aria-label="Close"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ×
                                </button>
                            </div>

                            {message && (
                                <div className={`alert ${messageType}`} role="status">
                                    {message}
                                </div>
                            )}

                            <div className="review-task-info">
                                <h3>{selectedTask.task}</h3>
                                <p>{selectedTask.description}</p>
                                <div className="review-meta">
                                    <span>
                                        Intern: {selectedTask.assignedIntern?.name}
                                    </span>
                                    {isHttpUrl(selectedTask.submissionUrl) && (
                                        <a
                                            href={selectedTask.submissionUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-btn"
                                        >
                                            Open Project
                                            <Icon size={14}>{icons.external}</Icon>
                                        </a>
                                    )}
                                </div>
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