import React, { useEffect, useState, useCallback } from 'react';
import salir from "../assets/images/salir.png";
import { useNavigate, useLocation } from "react-router-dom";
import avatar from "../assets/images/avatar.png";
import axios from 'axios';
import subir from "../assets/images/subir.png"
import eliminar from "../assets/images/eliminar.png"
import { jwtDecode } from "jwt-decode";

export function Perfil() {
    const history = useNavigate();
    const location = useLocation();
    const [usuario, setUsuario] = useState({});
    const [imagenPerfil, setImagenPerfil] = useState(avatar);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [archivoSubido, setArchivoSubido] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [permisoDenegado, setPermisoDenegado] = useState(false);

    // Obtener el token desde location.state o localStorage
    const token = location.state?.token || localStorage.getItem("token");

    // Decodificar el token para extraer el usuarioId
    let id = null;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            id = decoded.id; // Asegúrate de que el backend incluya este campo en el token

        } catch (error) {
            console.error("Error al decodificar el token:", error);
        }
    } 

    

    // Función para obtener los datos del usuario
    const obtenerDatosUsuario = useCallback(async () => {
        try {
            const response = await axios.get(`https://localhost:3001/api/usuario/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsuario(response.data.data);
          
            
            if (response.data.data.urlImage) {
               
                setImagenPerfil(response.data.data.urlImage);
                
            }
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
        }
    }, [id,token]);

    // Función para eliminar la imagen de perfil
    const handleEliminarImagen = async () => {
        try {
            const response = await axios.delete(`https://localhost:3001/api/usuarios/${id}/foto-perfil`,
                { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setImagenPerfil(avatar);
                setUsuario({ ...usuario, urlImage: null });
                obtenerDatosUsuario();
                alert("Imagen de perfil eliminada correctamente.");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Error eliminando la imagen de perfil:", error);
            alert("Error al eliminar la imagen de perfil.");
        }
    };

    // Función para subir una imagen de perfil
    const handleSubirImagen = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('imagen', file);

            const response = await axios.post(`https://localhost:3001/api/usuarios/${id}/foto-perfil`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setImagenPerfil(response.data.urlImagen);
                setUsuario({ ...usuario, urlImage: response.data.urlImagen });
                obtenerDatosUsuario();
                alert("Imagen de perfil actualizada correctamente.");
            } else {
                alert(response.data.message || "Error desconocido al subir la imagen.");
            }
        } catch (error) {
            console.error("Error subiendo la imagen:", error);
            if (error.response) {
                alert(error.response.data.message || "Error desconocido al subir la imagen.");
            } else {
                alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
            }
        }
    };

    // Función para subir el PDF
    const handleSubirPDF = async (event) => {

        if (permisoDenegado) {
            alert("No tienes permiso para modificar este documento");
            return;
        }
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            // Agregar todos los datos del usuario al FormData
            formData.append('userData', JSON.stringify({
                id: usuario.id,
                identificacion: usuario.identificacion,
                nombre: usuario.nombre,
                apellido: usuario.apellido
            }));
            const response = await axios.post(`https://localhost:3001/api/usuarios/${id}/subir-pdf`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                alert("PDF subido correctamente.");
                // Resetear estados y volver a cargar después de un pequeño retraso
                setPdfUrl(null);
                setArchivoSubido(false);
                setPdfError(null);

                // Pequeño retraso para asegurar que el servidor haya procesado el archivo
                setTimeout(async () => {
                    await obtenerPDF(usuario);
                }, 500);
            } else {
                alert(response.data.message || "Error desconocido al subir el PDF.");
            }
        } catch (error) {
            console.error("Error subiendo el PDF:", error);
            alert("Error al subir el PDF. Por favor, inténtalo de nuevo.");
        }
    };

    // Función para eliminar el PDF
    const handleEliminarPDF = async () => {
        if (permisoDenegado) {
            alert("No tienes permiso para modificar este documento");
            return;
        }
        try {
            const response = await axios.delete(`https://localhost:3001/api/usuarios/${id}/eliminar-pdf`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert("PDF eliminado correctamente.");
                setArchivoSubido(false); // Actualizar el estado para indicar que no hay un archivo subido
                setPdfUrl(null); // Limpiar la URL del PDF
            } else {
                alert(response.data.message || "Error desconocido al eliminar el PDF.");
            }
        } catch (error) {
            console.error("Error eliminando el PDF:", error);
            alert("Error al eliminar el PDF. Por favor, inténtalo de nuevo.");
        }
    };

    // Función para obtener PDF (modificada para recibir datos explícitos)
    const obtenerPDF = useCallback(async (userData) => {
        try {
            const params = {
                userId: userData.id,
                identificacion: userData.identificacion,
                nombre: userData.nombre,
                apellido: userData.apellido
            };


            const response = await axios.get(`https://localhost:3001/api/usuarios/${id}/ver-pdf`, {
                responseType: 'blob',
                params: params,
                headers: {
                    'Cache-Control': 'no-cache',
                    Authorization: `Bearer ${token}`
                }
            });

            // Procesar respuesta
            if (response.headers['content-type'].includes('application/json')) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const jsonResponse = JSON.parse(reader.result);
                        if (jsonResponse.message.includes("No tienes permiso")) {
                            setPermisoDenegado(true);
                            setPdfError("No tienes permiso para ver este documento");
                        }
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                        setPdfError("Error procesando respuesta del servidor");
                    }
                };
                reader.readAsText(response.data);
            } else if (response.headers['content-type'].includes('application/pdf')) {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                setPdfUrl(pdfUrl);
                setArchivoSubido(true);
                setPermisoDenegado(false);
                setPdfError(null);
            }

        } catch (error) {
            console.error("Error obteniendo PDF:", error);
            if (error.response?.data?.message?.includes("No tienes permiso")) {
                setPermisoDenegado(true);
                setPdfError("No tienes permiso para acceder a este documento");
            } else {
                setPdfError("Error al cargar el documento");
            }
            setPdfUrl(null);
        }
    }, [id,token]); // Solo depende de id ahora

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // 1. Primero obtener datos del usuario
                const userResponse = await axios.get(`https://localhost:3001/api/usuario/${id}?${Date.now()}`,
                    { headers: { Authorization: `Bearer ${token}` } });
                const userData = userResponse.data.data;
                setUsuario(userData);

                const imageUrl = userData.urlImage && userData.urlImage !== "(NULL)" ? userData.urlImage : null;
                if (imageUrl && imageUrl.includes('googleusercontent.com')) {
                    // Para URLs de Google, no agregues parámetros
                    setImagenPerfil(imageUrl);
                } else if (imageUrl) {
                    // Para otras URLs, agrega parámetro de caché
                    setImagenPerfil(`${imageUrl}?t=${Date.now()}`);
                } else {
                    setImagenPerfil(avatar);
                }

                // 2. Luego obtener el PDF con los datos del usuario
                await obtenerPDF(userData);

            } catch (error) {
                console.error("Error cargando datos:", error);
                setImagenPerfil(avatar);
            }
        };

        cargarDatos();
    }, [id, obtenerPDF,token]);

    return (
        <div className="h-screen w-full flex justify-center items-center">
            <div className="bg-white shadow-2xl rounded-lg w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 p-6 max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between mb-6">
                    <img
                        src={salir}
                        alt="Imagen de salir"
                        className="w-8 h-8 hover:scale-110 transition-transform duration-300 cursor-pointer"
                        onClick={() => history("/home")}
                    />
                    <h1 className="text-3xl font-bold text-black-600">Mi Perfil</h1>
                </div>


                <div className="flex flex-col items-center space-y-4">
                    {/* Sección de la foto de perfil */}
                    <div className="relative">
                        <img
                            src={imagenPerfil}
                            alt="Imagen de perfil"
                            className="w-40 h-40 rounded-full border-4 border-black-500"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="subir-imagen"
                            onChange={handleSubirImagen}
                        />
                        <label
                            htmlFor="subir-imagen"
                            className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition-colors mr-2 p-2 cursor-pointer"
                        >
                            Cambiar
                        </label>
                        <button
                            className="absolute bottom-0 left-0 bg-red-500 text-white rounded-full hover:bg-red-700 transition-colors ml-2 p-2 cursor-pointer"
                            onClick={handleEliminarImagen}
                        >
                            Eliminar
                        </button>
                    </div>

                    {/* Información del usuario */}
                    <div className="w-full space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                            <div className="mt-1 bg-gray-100 p-2 rounded-md">{usuario.nombre}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellido:</label>
                            <div className="mt-1 bg-gray-100 p-2 rounded-md">{usuario.apellido}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Identificación:</label>
                            <div className="mt-1 bg-gray-100 p-2 rounded-md">{usuario.identificacion}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo:</label>
                            <div className="mt-1 bg-gray-100 p-2 rounded-md">{usuario.correo}</div>
                        </div>
                    </div>

                    {/* Sección para subir y eliminar PDF */}
                    <div className="w-full space-y-4">
                        {pdfError && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                                <p className="font-bold">Acceso denegado</p>
                                <p>{pdfError}</p>
                            </div>
                        )}

                        {!permisoDenegado && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {archivoSubido ? "Eliminar PDF" : "Subir PDF"}
                                    </label>
                                    {archivoSubido ? (
                                        <button
                                            onClick={handleEliminarPDF}
                                            className="mt-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                                        >
                                            <img
                                                src={eliminar}
                                                alt="Ícono de eliminar PDF"
                                                className="h-5 w-5 mr-2"
                                            />
                                            <span>Eliminar PDF</span>
                                        </button>
                                    ) : (
                                        <label htmlFor="subir-pdf" className="cursor-pointer">
                                            <div className="mt-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                <img
                                                    src={subir}
                                                    alt="Ícono de subir PDF"
                                                    className="h-5 w-5 mr-2"
                                                />
                                                <span>Seleccionar archivo</span>
                                            </div>
                                        </label>
                                    )}
                                    {!archivoSubido && (
                                        <input
                                            type="file"
                                            id="subir-pdf"
                                            accept="application/pdf"
                                            onChange={handleSubirPDF}
                                            className="hidden"
                                        />
                                    )}
                                </div>

                                {pdfUrl && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">PDF Subido:</label>
                                        <iframe
                                            src={pdfUrl}
                                            width="100%"
                                            height="500px"
                                            title="PDF Subido"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}