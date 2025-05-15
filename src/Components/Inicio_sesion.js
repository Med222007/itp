import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export function InicioSesion() {
    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");

    const history = useNavigate();
    const location = useLocation();

    // Efecto para mensajes de redirección
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const reason = params.get("reason");
    
        if (reason) {
            const mensajes = {
                session_expired: "Tu sesión ha expirado. Por favor, ingresa nuevamente.",
                unauthorized: "Debes iniciar sesión para acceder a esta página.",
            };
    
            setMensaje(mensajes[reason] || "Ocurrió un error inesperado.");
    
            setTimeout(() => {
                setMensaje("");
                history("/", { replace: true });
            }, 3000);
        }
    }, [location,history]); 
    

    // Manejo del envío del formulario tradicional
    const manejarEnvio = (e) => {
        e.preventDefault();

        if (!usuario || !contrasena) {
            setMensaje("Ingrese todos los datos");
        } else {
            Axios.post("https://localhost:3001/api/login", {
                identificacion: usuario,
                contrasena: contrasena
            })
                .then((response) => {
                    if (response.data.token) {
                        localStorage.setItem("token", response.data.token);

                        setMensaje("Inicio de sesión exitoso");
                        setUsuario("");
                        setContrasena("");

                        setTimeout(() => {
                            history("/home");
                        }, 1000);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    if (error.response) {
                        setMensaje(error.response.data.message);
                    } else {
                        setMensaje("Error de conexión");
                    }

                    setTimeout(() => {
                        setUsuario("");
                        setContrasena("");
                        setMensaje("");
                    }, 5000);
                });
        }
    };

    // Manejo del login con Google
    const manejarLoginGoogle = async (response) => {
        try {
            // Enviar el token de Google al backend
            const res = await Axios.post("https://localhost:3001/api/google", { token: response.credential });

            // Guardar el token en el localStorage
            localStorage.setItem("token", res.data.token);

            setMensaje("Inicio de sesión con Google exitoso");

            // Redirigir al usuario después de 1 segundo
            setTimeout(() => {
                history("/home");
            }, 1000);
        } catch (error) {
            console.error("Error en la autenticación con Google:", error.response?.data || error.message);

            // Verificar si el error es por el dominio incorrecto
            if (error.response?.status === 403) {
                setMensaje(error.response.data.message);
                setTimeout(() => {
                    setMensaje("")
                }, 2000)
            } else {
                setMensaje("No se pudo iniciar sesión con Google. Intente nuevamente.");
            }
        }
    };

    return (
        <div className="bg-white size-adjusted">
            <div className="subfondo"></div>
            <div className="logo_itp "></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mobile-sm:bottom-[5%] mobile-md:bottom-[1%] w-[85%] desktop-md:bottom-[3%]">
                <form onSubmit={manejarEnvio}>
                    <div className="flex flex-col mobile-sm:space-y-2 mobile-sm:w-[80%] mx-auto mobile-md:w-[70%] smart-lg:w-[58%] laptop-md:w-[50%] desktop-md:w-[45%] desktop-lg:w-[43%]">
                        <div className="flex items-center justify-center mobile-sm:space-x-3">
                            <div className="text-right font-semibold font-mono mobile-sm:text-xxs mobile-sm:w-[40%] mobile-md:text-xs laptop-md:text-sm">
                                Número De Documento
                            </div>
                            <input
                                className="rounded-xl focus:outline-none border-gray-300 border-2 placeholder:text-center mobile-sm:placeholder:text-xxxs mobile-sm:p-1 mobile-sm:w-[75%] mobile-md:placeholder:text-xxs laptop-md:placeholder:text-xs px-4"
                                placeholder="Ingrese Su Número De Documento"
                                onChange={(e) => setUsuario(e.target.value)}
                                value={usuario}
                            />
                        </div>
                        <div className="flex items-center justify-center space-x-6 mobile-sm:space-x-3">
                            <div className="text-right font-semibold font-mono mobile-sm:text-xxs mobile-sm:w-[40%] mobile-md:text-xs laptop-md:text-sm">
                                Contraseña
                            </div>
                            <input
                                className="rounded-xl focus:outline-none border-gray-300 border-2 placeholder:text-center mobile-sm:placeholder:text-xxxs mobile-sm:p-1 mobile-sm:w-[75%] mobile-md:placeholder:text-xxs laptop-md:placeholder:text-xs"
                                placeholder="Ingrese Su Contraseña"
                                type="password"
                                onChange={(e) => setContrasena(e.target.value)}
                                value={contrasena}
                            />
                        </div>
                        <div className="text-right text-green-600 mobile-sm:text-xxxs mobile-md:text-xxs laptop-md:text-xs hover:underline">
                            <a href="recuperar contraseña">Olvidé mi contraseña</a>
                        </div>
                        <button className="bg-green-800 rounded-lg text-white font-mono mobile-sm:text-xxs mobile-sm:p-1 mobile-md:text-xs laptop-md:text-sm hover:bg-green-900">
                            Ingresar
                        </button>
                        <p className="text-center text-gray-400 mobile-sm:text-xxxs mobile-md:mx-[5%] mobile-md:text-xxs laptop-md:text-xs">
                            El ingreso solo está permitido para Estudiantes <strong className="text-black">Admitidos y Matriculados</strong>
                        </p>

                        {/* Botón de Google Login */}
                        <div className="flex justify-center mt-4">
                            <GoogleLogin onSuccess={manejarLoginGoogle} onError={() => console.error("Error en el login con Google")} />
                        </div>

                        {mensaje && (
                            <p className={`text-center mt-4 text-sm ${mensaje.includes("exitoso") ? "text-green-600" : "text-red-600"}`}>
                                {mensaje}
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}