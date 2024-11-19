import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Link, Fab, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';


const ListaCotizacion = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const location = useLocation();


const fetchCotizaciones = () => {
  const token = localStorage.getItem('accessToken');
  axios.get('http://localhost:8000/api/cotizaciones/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (Array.isArray(response.data)) {
      console.log('Cotizaciones obtenidas:', response.data);
      setCotizaciones(response.data);
    } else {
      console.error('La respuesta no contiene un array de cotizaciones:', response.data);
      setCotizaciones([]);
    }
  })
  .catch(error => {
    console.error("error al obtener cotizaciones:", error.response ? error.response.data : error.message);
    setCotizaciones([]);
  })
  .catch(error => {
    console.error("error al obtener cotizaciones:", error.response ? error.response.data : error.message);
    setCotizaciones([]);
  });
};

  useEffect(() => {
    fetchCotizaciones();
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

  useEffect(() => {
    if (location.state?.nuevaCotizacion) {
      console.log("Nueva cotizacion recibida:", location.state.nuevaCotizacion);
      setCotizaciones((prevCotizaciones) => [...prevCotizaciones, location.state.nuevaCotizacion]);
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
              <TableRow key={cotizacion.id}onClick={() => navigate(`/editarcotizaciones/${cotizacion.id}`)} style={{ cursor: 'pointer' }}>
                <TableCell>{cotizacion.id}</TableCell>
                <TableCell>{cotizacion.vehiculo}</TableCell>
                <TableCell>{cotizacion.estado}</TableCell>
                <TableCell>{cotizacion.total_estimado}</TableCell>
                <TableCell>{formatearFecha(cotizacion.fecha_creacion)}</TableCell>
                <TableCell>
                  <Link to={`/editarcotizaciones/${cotizacion.id}`} component={Button} variant="contained" color="primary" size="small">
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
      <Fab color="primary" aria-label="add" onClick={() => navigate('/registrarcotizaciones')} sx={{ position: 'fixed', bottom: 20, right: 20 }}>
            <AddIcon />
          </Fab>
    </Box>
  );
}

export default ListaCotizacion;