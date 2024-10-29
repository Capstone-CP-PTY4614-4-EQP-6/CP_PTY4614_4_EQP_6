import * as React from "react";
import RegistrarCitas from "./RegistrarCitas";
import ListarCitas from "./ListarCitas";
import EditarCitas from "./EditarCitas";

export default function CitasComponent() {
    return (
        <div>
            <RegistrarCitas />
            <ListarCitas />
            <EditarCitas />
        </div>
    );
}   