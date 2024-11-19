import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid2, Fab, Box, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

function ListarProceso() {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProcesos = () => {
    const token = localStorage.getItem("accessToken"); // Asegúrate de que el nombre del token sea correcto
    axios.get('http://localhost:8000/api/procesos/', {
      headers: {
        'Authorization': `Bearer ${token}`}
    })
    .then(response => {
      setProcesos(Array.isArray(response.data) ? response.data : []);
    })
    .catch(error => {
      setError(error.response ? error.response.data : error.message);
      setProcesos([]);
    });
    setLoading(false);
    };

  useEffect(() => {
    fetchProcesos();
  }, []);


  useEffect(() => {
    if (location.state?.nuevoProceso) {
      console.log("Nuevo proceso recibido:", location.state.nuevoProceso);
      setProcesos((prevProcesos) => [...prevProcesos, location.state.nuevoProceso]);
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
          {procesos.length > 0 ? (
            <>
              <Typography variant="h4" align="center">Lista de procesos</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Vehiculo</TableCell>
                    <TableCell>Fase actual</TableCell>
                    <TableCell>Descripcion</TableCell>
                    <TableCell>Fecha inicio</TableCell>
                    <TableCell>Fecha fin</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Prioridad</TableCell>
                    <TableCell>Trabajador asignado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {procesos.map((proceso) => (
                    <TableRow key={proceso.id} onClick={() => navigate(`/editarproceso/${proceso.id}`)} style={{ cursor: 'pointer' }}>
                      <TableCell>{proceso.id}</TableCell>
                      <TableCell>{proceso.vehiculo}</TableCell>
                      <TableCell>{proceso.fase_proceso}</TableCell>
                      <TableCell>{proceso.descripcion}</TableCell>
                      <TableCell>{formatearFecha(proceso.fecha_inicio)}</TableCell>
                      <TableCell>{formatearFecha(proceso.fecha_fin)}</TableCell>
                      <TableCell>{proceso.estado_proceso}</TableCell>
                      <TableCell>{proceso.prioridad}</TableCell>
                      <TableCell>{proceso.trabajador}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <Box textAlign="center">
              <Typography variant="h4">No hay procesos registrados!</Typography>
            </Box>
          )}
          <Fab color="primary" aria-label="add" onClick={() => navigate('/registrarproceso')} sx={{ position: 'fixed', bottom: 20, right: 20 }}>
            <AddIcon />
          </Fab>
        </Grid2>
      </Grid2>
    </Container>
  );
}

export default ListarProceso;
