import React from "react";
import EditarReparacion from "../components/reparaciones/EditarReparaciones";
import ListarReparacion from "../components/reparaciones/ListarReparaciones";
import RegistrarReparacion from "../components/reparaciones/RegistarReparaciones";
import { Typography } from "@mui/material";
import BottomBar from "../components/BottomBar";
import Navbar from "../components/NavBar";

function ReparacionesPage() {
    return (
        <>
            <Navbar />
            <Typography variant="h1">Reparaciones</Typography>
            <BottomBar />
            <ListarReparacion />
            <EditarReparacion />
            <RegistrarReparacion />
        </>
    );
}

export default ReparacionesPage;