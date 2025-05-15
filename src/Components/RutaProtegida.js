import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

const RutaProtegida = () => {
  const [accessStatus, setAccessStatus] = useState(null); // 'valid', 'expired', 'no_token'
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setAccessStatus("no_token");
      return;
    }

    const checkToken = () => {
      try {
        const decoded = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp < now) {
          localStorage.removeItem("token");
          setAccessStatus("expired");
        } else {
          setAccessStatus("valid");
        }
      } catch (error) {
        localStorage.removeItem("token");
        setAccessStatus("no_token");
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, [token]);

  if (accessStatus === null) return null; // Esperar validación

  // Redirecciones según el estado del token
  if (accessStatus === "expired") return <Navigate to="/?reason=session_expired" />;
  if (accessStatus === "no_token") return <Navigate to="/?reason=unauthorized" />;

  return <Outlet />;
};

export default RutaProtegida;
