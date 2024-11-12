import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import ListarProceso from "../components/procesos/ListarProceso";
import BottomBar from "../components/BottomBar";

function ProcesosPage() {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    useEffect(() => {
        // Verificar si el usuario está autenticado
        if (!isAuthenticated) {
            // Redirigir a la página de inicio de sesión
            navigate('/login'); // Cambia esto a la ruta deseada
        }
    }, [isAuthenticated, navigate]); // Dependencias para el efecto

    // Si el usuario no está autenticado, no renderizamos nada
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            <Navbar />
            <ListarProceso />
            <BottomBar />
        </div>
    );
}

export default ProcesosPage;
