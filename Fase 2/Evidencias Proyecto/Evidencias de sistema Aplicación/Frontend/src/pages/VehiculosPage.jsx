import React from "react";
import EditarVehiculos from "../components/vehiculos/EditarVehiculos";
import ListarVehiculos from "../components/vehiculos/ListarVehiculos";
import RegistrarVehiculos from "../components/vehiculos/RegistrarVehiculos";
import { Typography } from "@mui/material";
import BottomBar from "../components/BottomBar";
import Navbar from "../components/NavBar";

function VehiculosPage() {
    return (
        <div>
            <Navbar />
            <Typography variant="h1">Vehiculos</Typography>
            <BottomBar />
            <ListarVehiculos />
            <EditarVehiculos />
            <RegistrarVehiculos />
        </div>
    );
}

export default VehiculosPage;