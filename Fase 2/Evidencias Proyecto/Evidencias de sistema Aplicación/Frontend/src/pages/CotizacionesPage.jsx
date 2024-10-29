import React from "react";
import Cotizaciones from "../components/cotizaciones/EditarCotizacion";
import ListaCotizacion from "../components/cotizaciones/ListarCotizacion";
import RegistrarCotizacion from "../components/cotizaciones/RegistrarCotizacion";

function CotizacionesPage() {
    return (
        <div>
            <RegistrarCotizacion />
            <ListaCotizacion />
            <Cotizaciones />
        </div>
    );
}

export default CotizacionesPage;