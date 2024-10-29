import React from "react";
import EditarPagos from "../components/pagos/EditarPagos";
import ListarPagos from "../components/pagos/ListarPagos";
import RegistrarPagos from "../components/pagos/RegistrarPagos";
import { Typography } from "@mui/material";
import BottomBar from "../components/BottomBar";
import Navbar from "../components/NavBar";


function PagosPage() {
    return (
        <div>
            <Navbar />
            <BottomBar />
            <Typography variant="h1">Pagos</Typography>
            <EditarPagos />
            <ListarPagos />
            <RegistrarPagos />
        </div>
    );
}

export default PagosPage;