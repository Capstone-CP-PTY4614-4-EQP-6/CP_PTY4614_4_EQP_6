import React, { useEffect, useState } from "react";
import ListarVehiculos from "../components/vehiculos/ListarVehiculos";
import BottomBar from "../components/BottomBar";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

function VehiculosPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      navigate('/login');  // Redirigir si no hay token
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return null; // Si no está autenticado, no renderiza nada
  }

  return (
    <div>
      <Navbar />
      <ListarVehiculos />
      <BottomBar />
    </div>
  );
}

export default VehiculosPage;
