import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Fab,
  Grid,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const ListarVehiculos = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener vehículos del servidor
  const fetchVehiculos = () => {
    const token = localStorage.getItem("accessToken");
    axios.get('http://localhost:8000/api/vehiculos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      setVehiculos(Array.isArray(response.data) ? response.data : []);
    })
    .catch(error => {
      setError(error.response ? error.response.data : error.message);
      setVehiculos([]);
    });
    setLoading(false);
  };

  // Llamada inicial y configuración de intervalos
  useEffect(() => {
    fetchVehiculos();
    const interval = setInterval(fetchVehiculos, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleAddVehicle = () => navigate('/registrarvehiculo');
  const handleEditVehicle = (id) => navigate(`/editarvehiculo/${id}`);

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh', p: 2 }}>
      <Grid item xs={12} md={10} lg={8}>
        <Typography variant="h4" align="center" gutterBottom>
          Lista de Vehículos
        </Typography>
        
        {loading ? (
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '50vh' }}>
            <CircularProgress />
          </Grid>
        ) : error ? (
          <Typography variant="body1" color="error" align="center">
            Error al cargar vehículos: {error}
          </Typography>
        ) : vehiculos.length === 0 ? (
          <Typography variant="body1" align="center">
            No hay vehículos registrados.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {['ID', 'Patente', 'Marca', 'Modelo', 'Año', 'Color', 'Kilometraje', 'Tipo de Combustible', 'Fecha Última Revisión', 'Estado Vehículo', 'Dueño'].map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 'bold' }}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {vehiculos.map((vehiculo) => (
                <TableRow
                  key={vehiculo.id}
                  onClick={() => handleEditVehicle(vehiculo.id)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <TableCell>{vehiculo.id}</TableCell>
                  <TableCell>{vehiculo.patente}</TableCell>
                  <TableCell>{vehiculo.marca}</TableCell>
                  <TableCell>{vehiculo.modelo}</TableCell>
                  <TableCell>{vehiculo.año}</TableCell>
                  <TableCell>{vehiculo.color}</TableCell>
                  <TableCell>{vehiculo.kilometraje}</TableCell>
                  <TableCell>{vehiculo.tipo_combustible}</TableCell>
                  <TableCell>{vehiculo.ultima_revision}</TableCell>
                  <TableCell>{vehiculo.estado_vehiculo}</TableCell>
                  <TableCell>{vehiculo.dueno}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddVehicle}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Grid>
    </Grid>
  );
};

export default ListarVehiculos;
