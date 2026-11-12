import { useNavigate } from "react-router-dom";

export const BackButton = ({ to }) => {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            className="back-btn"
            onClick={() => (to ? navigate(to) : navigate(-1))}
        >
            ← Back
        </button>
    );
};