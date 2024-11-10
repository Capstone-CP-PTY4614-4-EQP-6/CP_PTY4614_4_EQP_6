import React from 'react';
import EditarCitas from '../components/citas/EditarCitas';
import ListarCitas from '../components/citas/ListarCitas';
import RegistrarCitas from '../components/citas/RegistrarCitas';
import NavBar from '../components/NavBar';
import BottomBar from '../components/BottomBar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const CitasPage = () => {
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
            <ListarCitas />
            <BottomBar />
        </div>
        
    )
}

export default CitasPage