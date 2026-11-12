import { useNavigate } from "react-router-dom";
import "./unauthorized.css";

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauth-page">
      <div className="unauth-card">
        <h1 className="unauth-code">403</h1>
        <h2>Access Denied / Forbidden</h2>
        <p>Bhai, tumhare paas is page ko dekhne ki ijazat nahi hai.</p>
        <button className="unauth-btn" onClick={() => navigate('/')}>
          Go to Login
        </button>
      </div>
    </div>
  );
}