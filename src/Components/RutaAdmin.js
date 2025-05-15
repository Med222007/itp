import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from 'react';

const RutaAdmin = () => {
  const [access, setAccess] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setAccess('no_token');
      return;
    }

    const verifyAccess = () => {
      try {
        const decoded = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);
        
        if (decoded.exp < now) {
          localStorage.removeItem('token');
          setAccess('expired');
        } else {
          setAccess(decoded.ID_Rol === 1 ? 'granted' : 'denied');
        }
      } catch (error) {
        localStorage.removeItem('token');
        setAccess('invalid');
      }
    };

    verifyAccess();
  }, [token]);

  if (access === null) return null;

  switch(access) {
    case 'granted': return <Outlet />;
    case 'denied': return <Navigate to="/home?error=unauthorized" />;
    case 'expired': return <Navigate to="/?reason=session_expired" />;
    default: return <Navigate to="/" />;
  }
};

export default RutaAdmin;


