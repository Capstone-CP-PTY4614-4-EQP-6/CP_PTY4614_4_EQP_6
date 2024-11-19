import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid2, Fab, Box, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

function ListaPagos () {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 
    const fetchPagos =  () => {
      const token = localStorage.getItem('accessToken');
        axios.get('http://localhost:8000/api/pagos/',{
          headers:{
            'Authorization': `Bearer ${token}`}
        })
        .then(response => {
          setPagos(Array.isArray(response.data) ? response.data : []);
        })
        .catch(error => {
          setError(error.response ? error.response.data.message : error.message);
          setPagos([]);
        });
        setLoading(false);
    };

useEffect (() => {
    fetchPagos();
}, []);

useEffect (() => {
  if(location.state?.nuevoPago){
    console.log("Nuevo pago creado:", location.state.nuevoPago);   
    setPagos((prevPagos) => [...prevPagos, location.state.nuevoPago]); 
  }
}, [location.state]);


  if (loading) {
    return <Typography variant="h6">Cargando...</Typography>;
  }

  if (error) {
    return <Typography variant="body1" color="error">{error}</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem', position: 'relative' }}>
      <Grid2 container justifyContent="center">
        <Grid2>
          {pagos.length > 0 ? (
            <>
              <Typography variant="h4" align="center">Lista de pagos</Typography>
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
                  {procesos.map((pago) => (
                    <TableRow key={pago.id} onClick={() => navigate(`/editarproceso/${proceso.id}`)} style={{ cursor: 'pointer' }}>
                      <TableCell>{pago.id}</TableCell>
                      <TableCell>{pago.vehiculo}</TableCell>
                      <TableCell>{pago.fase_pago}</TableCell>
                      <TableCell>{pago.descripcion}</TableCell>
                      <TableCell>{pago.fecha_inicio}</TableCell>
                      <TableCell>{pago.fecha_fin}</TableCell>
                      <TableCell>{pago.estado_pago}</TableCell>
                      <TableCell>{pago.prioridad}</TableCell>
                      <TableCell>{pago.trabajador}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <Box textAlign="center">
              <Typography variant="h4">No hay pagos registrados!</Typography>
            </Box>
          )}
          <Fab color="primary" aria-label="add" onClick={() => navigate('/registrarpago')} sx={{ position: 'fixed', bottom: 20, right: 20 }}>
            <AddIcon />
          </Fab>
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default ListaPagos;
