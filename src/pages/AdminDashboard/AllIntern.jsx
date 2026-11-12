import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Navigate } from 'react-router-dom';
import { BackButton } from './BackButton';
import "./admin.css";

// CHANGE THIS to your real admin dashboard route
const DASHBOARD_ROUTE = "/admindashboard";

export const AllIntern = () => {

    const [interns, setInterns] = useState([]);
    const [message, setMessage] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [internData, setInternData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const token = sessionStorage.getItem("token");

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

    const addIntern = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const res = await api.post(
                "/api/interns/addintern",
                internData
            );

            setMessage(res.data.message);

            await fetchIntern();

            setInternData({
                name: "",
                email: "",
                password: ""
            });

            setShowCreateForm(false);

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to add intern"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleinput = (e) => {
        setInternData({
            ...internData,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        if (token) {
            fetchIntern();
        }
    }, []);

    if (!token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="admin-container">
            <main className="admin-main">

                <BackButton to={"/admin"} />

                <header className="admin-header page-header">
                    <div>
                        <h1>All Interns</h1>
                        <p>
                            {showCreateForm
                                ? "Create a new intern account."
                                : "View all registered interns."}
                        </p>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? "View Interns" : "+ Add New Intern"}
                    </button>
                </header>

                {message && <p className="info-message">{message}</p>}

                {showCreateForm ? (
                    <section className="form-card">

                        <div className="section-heading">
                            <div>
                                <h2>Add Intern</h2>
                                <p>The intern will log in with these credentials.</p>
                            </div>
                        </div>

                        <form className="styled-form" onSubmit={addIntern}>

                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter name"
                                    value={internData.name}
                                    onChange={handleinput}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter email"
                                    value={internData.email}
                                    onChange={handleinput}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    value={internData.password}
                                    onChange={handleinput}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-review-btn"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add Intern"}
                                </button>
                            </div>

                        </form>
                    </section>
                ) : (
                    <section className="task-section">

                        <div className="section-heading">
                            <div>
                                <h2>Intern List</h2>
                                <p>All interns registered in the system</p>
                            </div>

                            <span className="task-count">
                                {interns.length} Interns
                            </span>
                        </div>

                        <div className="table-wrapper">
                            <table className="admin-table compact">

                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {interns.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="empty-table">
                                                No interns found
                                            </td>
                                        </tr>
                                    ) : (
                                        interns.map((intern) => (
                                            <tr key={intern._id}>
                                                <td className="task-name">{intern.name}</td>
                                                <td>{intern.email}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>

                            </table>
                        </div>

                    </section>
                )}

            </main>
        </div>
    );
};