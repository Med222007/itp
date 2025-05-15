import salir from "../assets/images/salir.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export function Notificaciones() {
    const [notificaciones, setNotificaciones] = useState([]);
    const history = useNavigate();
    const location = useLocation();
    
    // Obtener el token desde location.state o localStorage
    const token = location.state?.token || localStorage.getItem("token");

    // Decodificar el token para extraer el usuarioId
    let usuarioId = null;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            usuarioId = decoded.id; // Asegúrate de que el backend incluya este campo en el token
        } catch (error) {
            console.error("Error al decodificar el token:", error);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token"); // Obtener el token
        if (!usuarioId) return; // Evita hacer la petición si no hay un usuarioId válido
        // Llamar a la API para obtener las notificaciones usando Axios
        axios.get(`https://localhost:3001/api/notificaciones/${usuarioId}`,{
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setNotificaciones(response.data); // Asigna las notificaciones al estado
            })
            .catch(error => {
                console.error('Error al obtener las notificaciones:', error);
            });
    }, [usuarioId]);

    return (
        <div className="h-screen w-full flex justify-center items-center ">
            <div className="bg-white shadow-2xl rounded-lg w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 p-6">
                <div className="flex items-center justify-between mb-6">
                    <img
                        src={salir}
                        alt="Imagen de salir"
                        className="w-8 h-8 hover:scale-110 transition-transform duration-300 cursor-pointer"
                        onClick={() => history("/home")}
                    />
                    <h1 className="text-3xl font-bold text-blue-600">Notificaciones</h1>
                </div>
                <div className="overflow-auto max-h-[60vh]">
                    <ul className="space-y-4">
                        {notificaciones.length > 0 ? (
                            notificaciones.map(notificacion => (
                                <li
                                    key={notificacion.Id}
                                    className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="text-gray-700">
                                        <p className="text-lg font-semibold">{notificacion.titulo || "Notificación"}</p>
                                        <p className="text-sm text-gray-500">{notificacion.mensaje}</p>
                                        {notificacion.fecha && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notificacion.fecha).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="text-center text-gray-500">No tienes notificaciones.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}