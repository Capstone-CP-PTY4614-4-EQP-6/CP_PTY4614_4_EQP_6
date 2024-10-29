import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, List, ListItem, ListItemText, Alert } from '@mui/material';
import axios from 'axios';

const MiCuentaPage = () => {
    const [dueño, setDueño] = useState(null);
    const [vehiculos, setVehiculos] = useState([]);
    const [reparaciones, setReparaciones] = useState([]);
    const [citas, setCitas] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Función para obtener los datos del backend
        const fetchDatosCuenta = async () => {
            try {
                const response = await axios.get('/api/mi-cuenta/'); // Ajusta el endpoint según tu API
                setDueño(response.data.dueño);
                setVehiculos(response.data.vehiculos);
                setReparaciones(response.data.reparaciones);
                setCitas(response.data.citas);
                setPagos(response.data.pagos);
            } catch (error) {
                setErrorMessage('Error al cargar la información de la cuenta.');
            }
        };

        fetchDatosCuenta();
    }, []);

    return (
        <Container component="main" maxWidth="md">
            <Box sx={{ marginTop: 8 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Mi Cuenta
                </Typography>

                {/* Información del Dueño */}
                <Typography variant="h5" gutterBottom>Información del Dueño</Typography>
                {dueño ? (
                    <Box sx={{ mb: 3 }}>
                        <Typography><strong>Nombre:</strong> {dueño.nombre} {dueño.apellido}</Typography>
                        <Typography><strong>RUT:</strong> {dueño.rut}</Typography>
                        <Typography><strong>Email:</strong> {dueño.email}</Typography>
                        <Button variant="contained" color="warning" href="/editar-perfil">
                            Editar Perfil
                        </Button>
                    </Box>
                ) : (
                    <Alert severity="info">No hay información del dueño disponible.</Alert>
                )}

                {/* Vehículos */}
                <Typography variant="h5" gutterBottom>Vehículos</Typography>
                {vehiculos.length > 0 ? (
                    <List>
                        {vehiculos.map((vehiculo, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.año})`} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Alert severity="info">No tienes vehículos registrados.</Alert>
                )}

                {/* Reparaciones */}
                <Typography variant="h5" gutterBottom>Reparaciones</Typography>
                {reparaciones.length > 0 ? (
                    <List>
                        {reparaciones.map((reparacion, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${reparacion.desc_problema} - Costo: ${reparacion.costo_final}`} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Alert severity="info">No tienes reparaciones registradas.</Alert>
                )}

                {/* Citas */}
                <Typography variant="h5" gutterBottom>Citas</Typography>
                {citas.length > 0 ? (
                    <List>
                        {citas.map((cita, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${cita.fecha_y_hora} - ${cita.motivo}`} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Alert severity="info">No tienes citas registradas.</Alert>
                )}

                {/* Pagos */}
                <Typography variant="h5" gutterBottom>Pagos</Typography>
                {pagos.length > 0 ? (
                    <List>
                        {pagos.map((pago, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`Monto: ${pago.monto} - Método: ${pago.metodo_pago}`} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Alert severity="info">No tienes pagos registrados.</Alert>
                )}

                {/* Mostrar mensaje de error en caso de fallos */}
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </Box>
        </Container>
    );
};

export default MiCuentaPage;