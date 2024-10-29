import React from "react";
import EditarPagos from "../components/pagos/EditarPagos";
import ListarPagos from "../components/pagos/ListarPagos";
import RegistrarPagos from "../components/pagos/RegistrarPagos";
import { Typography } from "@mui/material";
import BottomBar from "../components/BottomBar";
import Navbar from "../components/NavBar";

function ProcesosPage() {
    return (
        <div>
            <Navbar />
            <Typography variant="h1">Procesos</Typography>
            <BottomBar />
            <EditarPagos />
            <ListarPagos/>
            <RegistrarPagos/>
        </div>
    );
}

export default ProcesosPage;