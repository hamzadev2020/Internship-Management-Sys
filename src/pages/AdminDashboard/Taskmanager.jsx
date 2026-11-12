import React, { useEffect, useState } from 'react'
import api from '../../api/axios';
import { BackButton } from './BackButton';
import "./admin.css";

// CHANGE THIS to your real admin dashboard route
const DASHBOARD_ROUTE = "/admindashboard";

export const AdminTaskmanager = () => {

    const [interns, setInterns] = useState([]);

    const [taskData, setTaskData] = useState({
        task: "",
        description: "",
        assignedIntern: "",
        deadline: ""
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);


    const addTask = async (e) => {
        e.preventDefault();
        try {
            setLoading(true); // was missing: loading was never turned on
            const res = await api.post("/api/tasks/assignTask", taskData);

            setMessage(res.data?.message || "Task assigned successfully!");

            setTaskData({
                task: "",
                description: "",
                assignedIntern: "",
                deadline: ""
            });

            alert(res.data?.message || "Task assigned successfully!")


        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }


    }


    const fetchIntern = async () => {
        try {
            const res = await api.get("/api/interns/fetchinterns");
            setInterns(res.data);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to fetch interns"
            );
        }
    };

    const handleInput = (e) => {
        setTaskData({ ...taskData, [e.target.name]: e.target.value });
    };

    useEffect(() => { fetchIntern() }, [])

    return (
        <div className="admin-container">
            <main className="admin-main">

                <BackButton to={"/admin"} />

                <header className="admin-header page-header">
                    <div>
                        <h1>Task Manager</h1>
                        <p>Create a task and assign it to an intern.</p>
                    </div>
                </header>

                {message && <p className="info-message">{message}</p>}

                <section className="form-card">

                    <div className="section-heading">
                        <div>
                            <h2>Assign Task</h2>
                            <p>Fill in the details below.</p>
                        </div>
                    </div>

                    <form className="styled-form" onSubmit={addTask}>

                        <div className="form-group">
                            <label htmlFor="task">Task</label>
                            <input
                                id="task"
                                type="text"
                                name="task"
                                placeholder="Task title"
                                value={taskData.task}
                                onChange={handleInput}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="What should the intern do?"
                                rows="4"
                                value={taskData.description}
                                onChange={handleInput}
                                required
                            />
                        </div>

                        <div className="form-grid">

                            <div className="form-group">
                                <label htmlFor="assignedIntern">Assign to</label>
                                <select
                                    id="assignedIntern"
                                    name="assignedIntern"
                                    value={taskData.assignedIntern}
                                    onChange={handleInput}
                                    required
                                >
                                    <option value="" disabled>
                                        Select an intern...
                                    </option>
                                    {interns.map((intern) => (
                                        <option key={intern._id || intern.id} value={intern._id || intern.id}>
                                            {intern.name} ({intern.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="deadline">Deadline</label>
                                <input
                                    id="deadline"
                                    type="date"
                                    name="deadline"
                                    value={taskData.deadline}
                                    onChange={handleInput}
                                    required
                                />
                            </div>

                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-review-btn"
                                disabled={loading}
                            >
                                {loading ? "Assigning..." : "Assign Task"}
                            </button>
                        </div>

                    </form>
                </section>

            </main>
        </div>
    )
}