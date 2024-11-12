import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert, Paper, Select, MenuItem, InputLabel, FormControl, Grid2 } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegistrarCitas = () => {
  const navigate = useNavigate();
  const [citaData, setCitaData] = useState({
    vehiculo: '',          // ID del vehículo seleccionado
    fecha_y_hora: '',
    motivo: '',
    ubicacion: '',
    estado_cita: 'pendiente'
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
    setCitaData({ ...citaData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");

    axios.post('http://localhost:8000/api/citas/crear/', citaData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log('Cita creada con éxito:', response.data);
        setSuccess(true);
        setTimeout(() => {
          navigate('/citas', { state: { nuevaCita: response.data } });
        }, 2000);
      })
      .catch(error => {
        console.error('Error al crear cita:', error);
        setError('Error al crear la cita. Por favor, intenta de nuevo.');
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
              value={citaData.vehiculo}
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
            type="datetime-local"
            label="Fecha y Hora"
            name="fecha_y_hora"
            value={citaData.fecha_y_hora}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Motivo"
            name="motivo"
            value={citaData.motivo}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />
          <TextField
            label="Ubicación"
            name="ubicacion"
            value={citaData.ubicacion}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

        <TextField
            label="Estado de la cita"
            name="estado_cita"
            value={citaData.estado_cita}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            select
            >
            <MenuItem value="confirmada">Confirmada</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
            <MenuItem value="completada">Completada</MenuItem>
          </TextField>

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
};

export default RegistrarCitas;
