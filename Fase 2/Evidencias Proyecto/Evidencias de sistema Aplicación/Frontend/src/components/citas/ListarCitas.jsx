import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid2, Fab, Box, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const ListaCitas = () => {
  const [citas, setCitas] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchCitas = () => {
    const token = localStorage.getItem("accessToken"); // Asegúrate de que el nombre del token sea correcto
    axios.get('http://localhost:8000/api/citas/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (Array.isArray(response.data)) {
        console.log('Citas obtenidas:', response.data);
        setCitas(response.data);
      } else {
        console.error('La respuesta no contiene un array de citas:', response.data);
        setCitas([]);
      }
    })
    .catch(error => {
      console.error("Error al obtener citas:", error.response ? error.response.data : error.message);
      setCitas([]);
    });
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  useEffect(() => {
    if (location.state?.nuevaCita) {
      console.log("Nueva cita recibida:", location.state.nuevaCita);
      setCitas((prevCitas) => [...prevCitas, location.state.nuevaCita]);
    }
  }, [location.state]);

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const opciones = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return fecha.toLocaleString('es-ES', opciones).replace(',', '');
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem', position: 'relative' }}>
      <Grid2 container justifyContent="center">
        <Grid2>
          {citas.length > 0 ? (
            <>
              <Typography variant="h4" align="center">Lista de Citas</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Vehículo</TableCell>
                    <TableCell>Fecha y Hora</TableCell>
                    <TableCell>Motivo</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell>Estado de la cita</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citas.map((cita) => (
                    <TableRow key={cita.id} onClick={() => navigate(`/editarcita/${cita.id}`)} style={{ cursor: 'pointer' }}>
                      <TableCell>{cita.id}</TableCell>
                      <TableCell>{cita.vehiculo}</TableCell>
                      <TableCell>{formatearFecha(cita.fecha_y_hora)}</TableCell>
                      <TableCell>{cita.motivo}</TableCell>
                      <TableCell>{cita.ubicacion}</TableCell>
                      <TableCell>{cita.estado_cita}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <Box textAlign="center">
              <Typography variant="h4">No tienes citas registradas!</Typography>
            </Box>
          )}
          <Fab color="primary" aria-label="add" onClick={() => navigate('/registrarcita')} sx={{ position: 'fixed', bottom: 20, right: 20 }}>
            <AddIcon />
          </Fab>
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default ListaCitas;
