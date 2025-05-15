//se importan todos los componentes al archivo principal asi como herramientas para el funcionamiento del modulo principal
import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InicioSesion } from './Components/Inicio_sesion';
import { HomePage } from './Components/Home_page';
import { PageFound } from './Components/Page_found';
import { Notificaciones } from './Components/Notificaciones';
import { Perfil } from './Components/Perfil';
import { Reportes } from './Components/Reportes';
import RutaProtegida from './Components/RutaProtegida';
import RutaAdmin from './Components/RutaAdmin';
import { GoogleOAuthProvider } from "@react-oauth/google"; // Importar GoogleOAuthProvider

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Leer variable de entorno


//realizamos la conexion con el html de nuestra pagina web para empezar a renderizar todo alli

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={CLIENT_ID}> 
    <div className="fondo">
      <Router>
        <Routes>
          <Route path="/" element={<InicioSesion />} />
          <Route path="*" element={<PageFound />} />

          {/* Rutas protegidas por token */}
          <Route element={<RutaProtegida />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/Notificaciones" element={<Notificaciones />} />
            <Route path="/Perfil" element={<Perfil />} />
          </Route>

          {/* Ruta protegida para administradores (iddrol === 1) */}
          <Route element={<RutaAdmin />}>
            <Route path="/Reportes" element={<Reportes />} />
          </Route>
        </Routes>
      </Router>
    </div>
  </GoogleOAuthProvider>
);

