import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert, Paper, Select, MenuItem, InputLabel, FormControl, Grid2 } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegistrarCotizacion = () => {
  const navigate = useNavigate();
  const [cotizacionData, setcotizacionData] = useState({
    vehiculo: '',
    fecha_creacion: '',
    estado: '',
    total_estimado: '',
    descripcion: '',
    monto_total:  '',
  });
  const [vehiculos, setVehiculos] = useState([]);  // Lista de vehículos disponibles
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Obtiene la lista de vehículos desde la API cuando el componente se monta
    const token = localStorage.getItem("accessToken");

    axios.get('http://localhost:8000/api/vehiculos/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setVehiculos(response.data);  // Guarda la lista de vehículos
    })
    .catch(error => {
      console.error('Error al obtener vehículos:', error);
      setError('Error al cargar la lista de vehículos.');
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setcotizacionData({ ...cotizacionData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError('No se encontró el token de autenticación. Inicia sesión nuevamente.');
      return;
    }

    axios.post('http://localhost:8000/api/cotizaciones/crear/', cotizacionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('cotizacion creada con éxito:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/cotizaciones', { state: { nuevaCotizacion: response.data } });
      }, 2000);
    })
    .catch(error => {
      console.error('Error al crear cotizacion:', error);
      const mensajeError = error.response?.data?.detail || 'Error inesperado. Por favor, intenta de nuevo.';
      setError(mensajeError);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };


  return (
    <Grid2 
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}
    >
      <Paper elevation={6} style={{ padding: '2rem', width: '80%', maxWidth: '600px', borderRadius: '12px' }}>
        <Typography variant="h5" align="center" gutterBottom color="primary">
          Registrar Cita
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="vehiculo-label" style={{ color: '#1976d2' }}>Vehículo</InputLabel>
            <Select
              labelId="vehiculo-label"
              name="vehiculo"
              value={cotizacionData.vehiculo}
              onChange={handleChange}
              required
              color="primary"
            >
              {vehiculos.map((vehiculo) => (
                <MenuItem key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.modelo} - {vehiculo.patente} {/* Ajusta según el modelo de datos del vehículo */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Fecha"
            name="fecha_creacion"
            type="datetime-local"
            value={cotizacionData.fecha_creacion}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <Select
            labelId="estado-label"
            name="estado"
            value={cotizacionData.estado}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
            color="primary"
          >
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="Aceptada">Aceptada</MenuItem>
            <MenuItem value="Rechazada">Rechazada</MenuItem>
          </Select>
          <TextField
            label="Descripcion"
            name="descripcion"
            value={cotizacionData.descripcion}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Monto total"
            name="monto_total"
            value={cotizacionData.monto_total}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="total_estimadO"
            name="total_estimado"
            value={cotizacionData.total_estimado}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5, 
                fontSize: '16px', 
                borderRadius: '8px', 
                backgroundColor: '#1976d2', 
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              {isLoading ? 'Registrando...' : 'Registrar Cita'}
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => navigate(-1)}
              sx={{
                py: 1.5, 
                fontSize: '16px', 
                borderRadius: '8px', 
                borderColor: '#1976d2', 
                '&:hover': { borderColor: '#1565c0' },
              }}
            >
              Volver Atrás
            </Button>
          </Box>
        </form>
        
        {success && (
          <Snackbar open autoHideDuration={3000} onClose={() => setSuccess(false)}>
            <Alert severity="success" sx={{ width: '100%' }}>
              Cita registrada exitosamente!
            </Alert>
          </Snackbar>
        )}
        
        {error && (
          <Snackbar open autoHideDuration={3000} onClose={() => setError(null)}>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Grid2>
  );
}

export default RegistrarCotizacion;