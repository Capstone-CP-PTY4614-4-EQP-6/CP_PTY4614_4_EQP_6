import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, List, ListItem, ListItemText, Alert } from '@mui/material';
import NavBar from '../components/NavBar';
import BottomBar from '../components/BottomBar';
import axios from 'axios';

const MiCuentaPage = () => {
    const [dueño, setDueño] = useState(null);
    const [vehiculos, setVehiculos] = useState([]);
    const [reparaciones, setReparaciones] = useState([]);
    const [citas, setCitas] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchDatosCuenta = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/mi-cuenta/');
                setDueño(response.data.dueño);
                setVehiculos(response.data.vehiculos);
                setReparaciones(response.data.reparaciones);
                setCitas(response.data.citas);
                setPagos(response.data.pagos);
            } catch (error) {
                setErrorMessage('Error al cargar la información de la cuenta.');
                console.error(error);
            }
        };

        fetchDatosCuenta();
    }, []);

    return (
        <Container component="main" maxWidth="md">
            <NavBar />
            <Box sx={{ marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Mi Cuenta
                    </Typography>

                    {/* Información del Dueño */}
                    <Typography variant="h5" gutterBottom align="center">Información del Dueño</Typography>
                    {dueño ? (
                        <Box sx={{ mb: 3 }}>
                            <Typography align="center"><strong>Nombre:</strong> {dueño.nombre} {dueño.apellido}</Typography>
                            <Typography align="center"><strong>RUT:</strong> {dueño.rut}</Typography>
                            <Typography align="center"><strong>Email:</strong> {dueño.email}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color="warning" href="/editar-perfil">
                                    Editar Perfil
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Alert severity="info" align="center">No hay información del dueño disponible.</Alert>
                    )}

                    {/* Vehículos */}
                    <Typography variant="h5" gutterBottom align="center">Vehículos</Typography>
                    {vehiculos && vehiculos.length > 0 ? (
                        <List>
                            {vehiculos.map((vehiculo, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.año})`} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Alert severity="info" align="center">No tienes vehículos registrados.</Alert>
                    )}


                    {/* Reparaciones */}
                    <Typography variant="h5" gutterBottom align="center">Reparaciones</Typography>
                    {reparaciones && reparaciones.length > 0 ? (
                        <List>
                            {reparaciones.map((reparacion, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`${reparacion.desc_problema} - Costo: ${reparacion.costo_final}`} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Alert severity="info" align="center">No tienes reparaciones registradas.</Alert>
                    )}

                    {/* Citas */}
                    <Typography variant="h5" gutterBottom align="center">Citas</Typography>
                    {citas && citas.length > 0 ? (
                        <List>
                            {citas.map((cita, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`${cita.fecha_y_hora} - ${cita.motivo}`} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Alert severity="info" align="center">No tienes citas registradas.</Alert>
                    )}

                    {/* Pagos */}
                    <Typography variant="h5" gutterBottom align="center">Pagos</Typography>
                    {pagos && pagos.length > 0 ? (
                        <List>
                            {pagos.map((pago, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`Monto: ${pago.monto} - Método: ${pago.metodo_pago}`} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Alert severity="info" align="center">No tienes pagos registrados.</Alert>
                    )}

                    {/* Mostrar mensaje de error en caso de fallos */}
                    {errorMessage && <Alert severity="error" align="center">{errorMessage}</Alert>}
                </Box>
            </Box>
            <BottomBar />
        </Container>
    );
};

export default MiCuentaPage;
