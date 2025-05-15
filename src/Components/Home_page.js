//Se importan los componentes y herramientas que se usaran en este modulo
import avatar from "../assets/images/avatar.png"
import flecha from "../assets/images/flecha.png"
import salir from "../assets/images/salir.png"
import descargar from "../assets/images/descargar_Database.png"
import seleccionar_todo from "../assets/images/seleccioanar_todo.png"
import notificacionesIcon from "../assets/images/notificacionesIcon.png"
import reportesIcon from "../assets/images/reportesIcon.png"
import perfilIcon from "../assets/images/perfilIcon.png"
import { useNavigate } from "react-router-dom";
import { Calendario } from "./Calendar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCallback } from 'react';
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom"



export function HomePage() {
    const [userRole, setUserRole] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [diasCompletamenteReservados, setDiasCompletamenteReservados] = useState([]);
    const [menuVisible, setmenuVisible] = useState(false); // Estado para el menú desplegable
    const [nombre, setNombre] = useState(null);
    const [apellido, setApellido] = useState(null);
    const [ID_Rol, setID_Rol] = useState(null);
    const [id, setId] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);

    //realizamos los correspondientes manejos de estados 
    const history = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        if (error === 'unauthorized') {
            Swal.fire({
                icon: "error",
                title: "Acceso denegado",
                text: "No tienes permisos para ingresar a esta página.",
            }).then(() => {
                history("/home", { replace: true });
            });
        }
    }, [location, history]);

    //funcion para obtener los datos del usuario que inicio sesion
    useEffect(() => {
        try {
            const token = localStorage.getItem("token"); // Obtener el token
            if (!token) {
                console.warn("No se encontró un token en localStorage.");
                history("/"); // Redirigir al login si no hay token
                return;
            }

            const decoded = jwtDecode(token); // Decodificar el token


            setNombre(decoded.nombre);
            setApellido(decoded.apellido);
            setID_Rol(decoded.ID_Rol);
            setId(decoded.id);
        } catch (error) {
            console.error("Error al decodificar el token", error);
            history("/"); // Si hay un error con el token, redirigir al login
        }
    }, [history]); // Ejecuta solo cuando `history` cambie

    // Obtener los datos del usuario cuando `id` tenga un valor válido
    useEffect(() => {
        if (!id) return; // Evitar ejecutar la solicitud si `id` es null o undefined

        const obtenerDatosUsuario = async () => {
            try {
                const token = localStorage.getItem("token"); // Obtener el token
                const response = await axios.get(`https://localhost:3001/api/usuario/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Incluir el token en la petición
                    }
                });
               
                const imageUrl = response.data.data.urlImage && response.data.data.urlImage !== "(NULL)" ? response.data.data.urlImage : null;
                setAvatarUrl(imageUrl);

            } catch (error) {
                console.error("Error al obtener los datos del usuario:", error);
            }
        };

        obtenerDatosUsuario();
    }, [id]); // Se ejecuta cuando `id` cambia




    //descargar base de datos
    const DownloadDatabase = async () => {
        try {
            const token = localStorage.getItem("token"); // Obtener el token



            const response = await axios.get('https://localhost:3001/api/export-database', {
                responseType: 'blob', // Importante para manejar archivos binarios
                headers: {
                    Authorization: `Bearer ${token}` // Incluir el token en la petición
                }
            });

            // Crear un blob a partir de la respuesta
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `database_export_${Date.now()}.sql`; // Nombre del archivo
            document.body.appendChild(a);
            a.click();
            a.remove(); // Limpiar el DOM
            window.URL.revokeObjectURL(url); // Liberar la URL del blob

        } catch (error) {
            console.error("Error al descargar la base de datos:", error.response?.data || error);

        }
    };



    //funcion para poder reservar todas las horas del dia
    // Función para reservar todas las horas del día
    const reservarTodoElDia = async (fecha, persona_id, rol) => {
        try {
            const token = localStorage.getItem("token"); // Obtener el token


            const response = await axios.post(
                "https://localhost:3001/api/reservar-todo-el-dia",
                { fecha, persona_id, rol }, // Datos de la petición
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Incluir el token en la petición
                    }
                }
            );

            fetchReservasPorFecha(fecha); // Recarga las reservas
            obtenerDiasReservados(); // Actualiza los días completamente reservados
            return response.data;
        } catch (error) {
            console.error("Error en la reserva:", error.response?.data || error.message);
            throw error;
        }
    };




    const mostrarMenu = () => {
        setmenuVisible(!menuVisible);
    };

    // Función para obtener los días reservados
    const obtenerDiasReservados = async () => {
        try {
            const token = localStorage.getItem("token"); // Obtener el token
            const response = await axios.get('https://localhost:3001/api/dias-completamente-reservados', {
                headers: {
                    Authorization: `Bearer ${token}` // Incluir el token en la petición
                }
            });
            setDiasCompletamenteReservados(response.data);
        } catch (error) {
            console.error('Error al obtener los días reservados:', error);
        }
    };


    useEffect(() => {
        obtenerDiasReservados();
    }, []);


    // Función para obtener el rol del usuario
    const fetchUserRole = useCallback(async () => {
        try {
            const token = localStorage.getItem("token"); // Obtener el token
            const response = await axios.get(`https://localhost:3001/api/rol/${ID_Rol}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluir el token en la petición
                }
            });
            setUserRole(response.data.rol);
        } catch (error) {
            console.error("Error al obtener el rol del usuario:", error);
        }
    }, [ID_Rol]);


    useEffect(() => {
        if (ID_Rol) {
            fetchUserRole();
        }
    }, [ID_Rol, fetchUserRole]);



    // Función para cargar reservas para una fecha específica
    const fetchReservasPorFecha = async (fecha) => {
        try {
            const token = localStorage.getItem("token"); // Obtener el token
            const response = await axios.get(`https://localhost:3001/api/reservas/${fecha}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluir el token en la petición
                }
            });
            const reservasFiltradas = response.data.filter(reserva => reserva.Estado !== 'cancelado');//filtramos las reservas para que solo se muestren las reservadas
            setReservas(reservasFiltradas); // Almacena las reservas en el estado


        } catch (error) {
            if (error.response) {
                console.error('Error al obtener las reservas:', error.response.data.message);
            } else if (error.request) {
                console.error('No se recibió respuesta:', error.request);
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    // Inicializa selectedDay con la fecha actual y carga las reservas del día
    useEffect(() => {
        const hoy = new Date();
        const fechaActual = hoy.toISOString().split('T')[0]; // Obtiene la fecha en formato YYYY-MM-DD
        setSelectedDay(fechaActual); // Establece la fecha actual como seleccionada
        fetchReservasPorFecha(fechaActual); // Carga las reservas para la fecha actual

        if (ID_Rol) {
            fetchUserRole();
        }
    }, [ID_Rol, fetchUserRole]);



    // Función que maneja el clic en un día del calendario
    const handleDayClick = (arg) => {
        setSelectedDay(arg.dateStr); // Guardar el día seleccionado
        fetchReservasPorFecha(arg.dateStr); // Carga las reservas para la fecha seleccionada
    };

    // Función para crear una reserva
    const crearReserva = async (hora) => {
        if (!selectedDay) {
            alert("Por favor, selecciona un día antes de reservar.");
            return;
        }

        const fechaCompleta = `${selectedDay} ${hora}:00`; // Combina fecha y hora
        try {
            const token = localStorage.getItem("token"); // Obtener el token
            const response = await axios.post("https://localhost:3001/api/reservas", {
                Fecha_hora: fechaCompleta,
                Persona_id: id,
                rol: userRole
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluir el token en la petición
                }
            });
            Swal.fire({
                position: "center",
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 1500
            });
            fetchReservasPorFecha(selectedDay); // Recarga las reservas
            obtenerDiasReservados(); // Actualiza los días completamente reservados
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                // Mostrar el mensaje de error enviado desde el backend
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.response.data.error,
                });
            } else {
                // Si no hay un mensaje de error específico, muestra un mensaje genérico
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Ha ocurrido un error inesperado.",
                });
            }
        }
    };
    // Función para cancelar una reserva
    const cancelarReserva = async (id) => {
        try {
            const token = localStorage.getItem("token"); // Obtener el token

            if (!token) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Token no disponible, no se puede cancelar la reserva.",
                });
                return;
            }

            const response = await axios.delete(`https://localhost:3001/api/reservas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluir el token en la petición
                },
                data: { rol: userRole } // Incluir el rol en la petición
            });

            Swal.fire({
                title: "Cancelada",
                text: response.data.message,
                icon: "success"
            });

            // Recargar las reservas y actualizar días reservados
            fetchReservasPorFecha(selectedDay);
            obtenerDiasReservados();

        } catch (error) {
            console.error(" Error al cancelar reserva:", error.response?.data || error);

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response?.data?.message || "Ocurrió un error al cancelar la reserva.",
            });
        }
    };


    const renderHorasDelDia = () => {
        const horas = [];
        const fechaSeleccionada = new Date(selectedDay);
        const dia = fechaSeleccionada.toISOString().split('T')[0];

        for (let i = 6; i <= 22; i++) {
            const hora = `${i.toString().padStart(2, '0')}:00`;
            const fechaCompleta = `${dia} ${hora}:00`;

            const reservada = reservas.find((reserva) => {
                const fechaReserva = reserva.Fecha_hora;
                return fechaReserva === fechaCompleta;
            });

            horas.push(
                <div
                    key={i}
                    className={`p-[1%] m-[2%] bg-slate-200 rounded-xl flex items-center cursor-pointer 
                        ${reservada ? 'bg-red-200' : 'hover:bg-green-100'}`}
                    onClick={() => {
                        if (!reservada) {
                            crearReserva(hora);
                        } else {

                            return
                        }
                    }}
                >
                    <div>
                        <div className="bg-white rounded-xl font-mono font-extrabold p-1">{hora}</div></div>

                    {reservada ? (
                        <div className="text-red-400 font-bold ml-[5%]">
                            Reservada por: {reservada.NOMBRE} {reservada.APELLIDO}
                        </div>
                    ) : (
                        <div className="text-green-400 font-bold ml-auto mr-[1%]">
                            Disponible para reservar
                        </div>
                    )}

                    {userRole === "Administrador" && reservada && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (reservada.Persona_id) {
                                    Swal.fire({
                                        title: "Quieres cancelar la reserva?",
                                        text: "Las demas personas podran reservarla!",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#3085d6",
                                        cancelButtonColor: "#d33",
                                        confirmButtonText: "Si,Cancelar!"
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            cancelarReserva(reservada.ID_Reserva);
                                        }
                                    });
                                } else {
                                    console.error("Error: Persona_id no disponible en la reserva.");
                                }
                            }}
                            className="bg-red-400 text-white p-2 rounded-xl ml-auto mr-[1%]"
                        >
                            Cancelar Reserva
                        </button>
                    )}

                    {userRole !== "Administrador" && reservada && reservada.Persona_id === id && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (reservada.Persona_id) {
                                    Swal.fire({
                                        title: "Quieres cancelar la reserva?",
                                        text: "Las demas personas podran reservarla!",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#3085d6",
                                        cancelButtonColor: "#d33",
                                        confirmButtonText: "Si,Cancelar!"
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            cancelarReserva(reservada.ID_Reserva);
                                        }
                                    });
                                } else {
                                    console.error("Error: Persona_id no disponible en la reserva.");
                                }
                            }}
                            className="bg-red-400 text-white p-2 rounded-xl ml-auto mr-[1%]"
                        >
                            Cancelar mi Reserva
                        </button>
                    )}
                </div>
            );
        }
        return horas;
    };

    return <>
        <div className="w-full h-[10%] flex bg-gray-500 bg-opacity-25 backdrop-blur-lg">
            <div className="flex items-center space-x-2 ml-[2%]">
                <img
                    src={flecha}
                    alt="flecha"
                    className={`h-[30%] cursor-pointer laptop-md:h-[45%] smart-lg:h-[43%] transition-transform duration-300 ${menuVisible ? "rotate-90" : "rotate-0"
                        }`}
                    onClick={mostrarMenu}
                />
                <h1 className="font-mono text-xs font-extrabold smart-lg:text-xl laptop-md:text-[3,5vh]">
                    Gestion De Horarios De Uso Cancha Sintetica
                </h1>
            </div>
            {/* Menú desplegable */}
            {menuVisible && (
                <div className="flex flex-col absolute top-[100%] w-[18%] min-w-[200px] bg-white shadow-2xl rounded-tr-3xl rounded-br-3xl z-50 overflow-hidden animate-slide-in">
                    <div
                        className="p-4 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-3 cursor-pointer"
                        onClick={() => history("/Notificaciones", { state: { token: localStorage.getItem("token") } })}
                    >
                        <img src={notificacionesIcon} alt="Notificaciones" className="w-5 h-5" />
                        <h1 className="font-mono font-medium">Notificaciones</h1>
                    </div>
                    <div
                        className="p-4 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-3 cursor-pointer"
                        onClick={() => history("/Perfil", { state: { token: localStorage.getItem("token") } })}
                    >
                        <img src={perfilIcon} alt="Mi Perfil" className="w-5 h-5" />
                        <h1 className="font-mono font-medium">Mi Perfil</h1>
                    </div>
                    {userRole === "Administrador" && (
                        <div
                            className="p-4 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-3 cursor-pointer"
                            onClick={() => history("/Reportes", { state: { token: localStorage.getItem("token") } })}
                        >
                            <img src={reportesIcon} alt="Reportes" className="w-5 h-5" />
                            <h1 className="font-mono font-medium">Reportes</h1>
                        </div>
                    )}
                    <div
                        className="p-4 mt-auto hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-3 cursor-pointer"
                        onClick={() => {
                            localStorage.removeItem("token");
                            history("/");
                        }}
                    >
                        <img src={salir} alt="Salir" className="w-5 h-5" />
                        <h1 className="font-mono font-medium">Salir</h1>
                    </div>
                </div>
            )}
            <div className="flex space-x-2 items-center ml-auto mobile-md:mr-[5%] smart-lg:mr-[3%] laptop-md:mr-[4%] desktop-md:space-x-5">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="imagen avatar" className="h-[40%] laptop-md:h-[45%] smart-lg:h-[43%] rounded-full" />
                ) : (
                    <img src={avatar} alt="imagen avatar por defecto" className="h-[40%] laptop-md:h-[45%] smart-lg:h-[43%] rounded-full" />
                )}
                <h1 className="font-mono font-extrabold text-xs smart-lg:text-xl laptop-md:text-[3,5vh]">
                    {nombre} {apellido}
                </h1>
            </div>
        </div>
        <div className="h-[90%] flex items-center justify-end pr-[3%]">
            <div className="bg-white bg-opacity-30 backdrop-blur-lg h-[90%] w-[80%] flex">
                <div className="w-[40%] overflow-auto">
                    {selectedDay && (
                        <div className="mt-[4%]">
                            <div className="flex justify-between items-center">
                                {userRole === "Administrador" && (
                                    <img
                                        src={seleccionar_todo}
                                        alt="Reservar todo el día"
                                        onClick={() => reservarTodoElDia(selectedDay, id, userRole)}
                                        className="cursor-pointer w-10 h-10 hover:scale-125 transition-transform duration-200 ml-5"
                                    />
                                )}
                                <h2 className="font-mono text-2xl font-extrabold flex-grow text-center">{selectedDay}</h2>
                            </div>
                            <div>{renderHorasDelDia(userRole)}</div>
                        </div>
                    )}
                </div>
                <div className="w-[60%] bg-gray-600 bg-opacity-25 flex justify-center">
                    <div className="h-[83%] w-[80%] pt-[5%]">
                        {<Calendario onDayClick={handleDayClick} selectedDay={selectedDay} diasReservados={diasCompletamenteReservados} />}
                        <div className="font-semibold font-mono text-base pt-[3%]">Selecciona el dia que quieres reservar!!</div>
                        {userRole === "Administrador" && (
                            <div className="flex">
                                <h1 className="font-mono font-extrabold">Descargar base de datos</h1>
                                <div className="h-[2%]">
                                    <img
                                        src={descargar}
                                        onClick={DownloadDatabase}
                                        alt="descargar Database"
                                        className="w-8 h-8 ml-4 cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
}