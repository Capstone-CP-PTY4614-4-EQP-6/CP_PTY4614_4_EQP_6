import React from "react";
import Cotizaciones from "../components/cotizaciones/EditarCotizacion";
import ListaCotizacion from "../components/cotizaciones/ListarCotizacion";
import RegistrarCotizacion from "../components/cotizaciones/RegistrarCotizacion";
import NavBar from "../components/NavBar";
import BottomBar from "../components/BottomBar";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


function CotizacionesPage() {
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
            <NavBar />
            <ListaCotizacion />
            <BottomBar />
        </div>
    );
}

export default CotizacionesPage;