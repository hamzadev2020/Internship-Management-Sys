
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Navigate } from "react-router-dom";
import { BackButton } from "./BackButton";
import "./admin.css";

export const AllIntern = () => {

    const [interns, setInterns] = useState([]);
    const [message, setMessage] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [internData, setInternData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const token = sessionStorage.getItem("token");

    // Fetch all interns
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

    // Handle input changes
    const handleInput = (e) => {
        setInternData({
            ...internData,
            [e.target.name]: e.target.value
        });
    };

    // Reset form
    const resetForm = () => {
        setInternData({
            name: "",
            email: "",
            password: ""
        });

        setEditingId(null);
        setShowCreateForm(false);
    };

    // Add or Update Intern
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            if (editingId) {

                const res = await api.put(
                    `/api/interns/updateIntern/${editingId}`,
                    internData
                );

                setMessage(res.data.message || "Intern updated successfully");

            } else {

                const res = await api.post(
                    "/api/interns/addintern",
                    internData
                );

                setMessage(res.data.message || "Intern added successfully");
            }

            await fetchIntern();
            resetForm();

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    // Open edit form
    const handleEdit = (intern) => {
        setInternData({
            name: intern.name,
            email: intern.email,
            password: ""
        });

        setEditingId(intern._id);
        setShowCreateForm(true);
        setMessage("");
    };

    // Delete Intern
    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this intern?"
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);
            setMessage("");

            const res = await api.delete(
                `/api/interns/deleteIntern/${id}`
            );

            setMessage(res.data.message || "Intern deleted successfully");

            await fetchIntern();

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to delete intern"
            );
        } finally {
            setLoading(false);
        }
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

                <BackButton to="/admin" />

                <header className="admin-header page-header">
                    <div>
                        <h1>All Interns</h1>
                        <p>
                            {showCreateForm
                                ? editingId
                                    ? "Update intern details."
                                    : "Create a new intern account."
                                : "View and manage all registered interns."}
                        </p>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={() => {
                            if (showCreateForm) {
                                resetForm();
                            } else {
                                setMessage("");
                                setEditingId(null);
                                setInternData({
                                    name: "",
                                    email: "",
                                    password: ""
                                });
                                setShowCreateForm(true);
                            }
                        }}
                    >
                        {showCreateForm ? "View Interns" : "+ Add New Intern"}
                    </button>
                </header>

                {message && (
                    <p className="info-message">{message}</p>
                )}

                {showCreateForm ? (

                    <section className="form-card">

                        <div className="section-heading">
                            <div>
                                <h2>
                                    {editingId ? "Update Intern" : "Add Intern"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the intern's account details."
                                        : "Create a new intern account."}
                                </p>
                            </div>
                        </div>

                        <form className="styled-form" onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label htmlFor="name">Name</label>

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter name"
                                    value={internData.name}
                                    onChange={handleInput}
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
                                    onChange={handleInput}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    {editingId ? "New Password" : "Password"}
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder={
                                        editingId
                                            ? "Enter new password"
                                            : "Enter password"
                                    }
                                    value={internData.password}
                                    onChange={handleInput}
                                    required
                                />
                            </div>

                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={resetForm}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-review-btn"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Please wait..."
                                        : editingId
                                            ? "Update Intern"
                                            : "Add Intern"}
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {interns.length === 0 ? (

                                        <tr>
                                            <td colSpan="3" className="empty-table">
                                                No interns found
                                            </td>
                                        </tr>

                                    ) : (

                                        interns.map((intern) => (

                                            <tr key={intern._id}>

                                                <td className="task-name">
                                                    {intern.name}
                                                </td>

                                                <td>{intern.email}</td>

                                                <td>
                                                    <div className="form-actions">

                                                        <button
                                                            type="button"
                                                            className="primary-btn"
                                                            onClick={() => handleEdit(intern)}
                                                            disabled={loading}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="cancel-btn"
                                                            onClick={() => handleDelete(intern._id)}
                                                            disabled={loading}
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>
                                                </td>

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
