import { Navigate } from "react-router-dom";
export const ProtectedRoute = ({ children ,allowedRoles}) => {
    const token=sessionStorage.getItem("token");
    const role=sessionStorage.getItem("role");
    if(!token){
        return <Navigate to="/" replace />;
    }else{
        if(allowedRoles.includes(role)){
        return children;
        }else{
            return <Navigate to="/unauthorized" replace />;
        }
    }
}