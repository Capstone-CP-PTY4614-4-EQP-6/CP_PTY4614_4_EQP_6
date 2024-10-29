import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Link } from '@mui/material';
import axios from 'axios';

function ListaCotizacion() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/cotizaciones')
      .then(response => {
        setCotizaciones(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleEliminarCotizacion = (id) => {
    axios.delete(`/api/cotizaciones/${id}`)
      .then(response => {
        const nuevaLista = cotizaciones.filter(cotizacion => cotizacion.id !== id);
        setCotizaciones(nuevaLista);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Lista de Cotizaciones
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Total Estimado</TableCell>
              <TableCell>Fecha de Creación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cotizaciones.map(cotizacion => (
              <TableRow key={cotizacion.id}>
                <TableCell>{cotizacion.id}</TableCell>
                <TableCell>{cotizacion.vehiculo}</TableCell>
                <TableCell>{cotizacion.estado}</TableCell>
                <TableCell>{cotizacion.total_estimado}</TableCell>
                <TableCell>{cotizacion.fecha_creacion}</TableCell>
                <TableCell>
                  <Link to={`/editar-cotizacion/${cotizacion.id}`} component={Button} variant="contained" color="primary" size="small">
                    Editar
                  </Link>
                  <Button variant="contained" color="danger" size="small" onClick={() => handleEliminarCotizacion(cotizacion.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Link to="/registrar-cotizacion" component={Button} variant="contained" color="success" size="large">
        Nueva Cotización
      </Link>
    </Box>
  );
}

export default ListaCotizacion;