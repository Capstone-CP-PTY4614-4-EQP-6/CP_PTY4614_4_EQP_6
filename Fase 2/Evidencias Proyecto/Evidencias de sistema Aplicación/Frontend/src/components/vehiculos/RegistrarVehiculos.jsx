import React, { useState } from 'react';
import { TextField, Button, Grid2, Typography, MenuItem, Snackbar, Alert, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegistrarVehiculo = () => {
  const navigate = useNavigate();
  const [vehiculoData, setVehiculoData] = useState({
    patente: '',
    marca: '',
    modelo: '',
    año: '',
    color: '',
    kilometraje: '',
    tipo_combustible: '',
    dueño: '',
    estado_vehiculo: '',
    fecha_ultima_revision: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehiculoData({ ...vehiculoData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    axios.post('http://localhost:8000/api/vehiculos/crear/', vehiculoData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log('Vehículo registrado:', response.data);
        setSuccess(true);  // Muestra el mensaje de éxito
        setTimeout(() => {
          navigate('/vehiculos', { state: { nuevoVehiculo: response.data } }); // Redirige y pasa el nuevo vehículo
        }, 2000);  // Redirige después de 2 segundos
      })
      .catch(error => {
        console.error('Error al crear vehículo:', error.response ? error.response.data : error.message);
        setError('Error al crear el vehículo. Por favor, intenta de nuevo.');
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
          Registrar Vehículo
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Patente"
            name="patente"
            value={vehiculoData.patente}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

          <TextField
            label="Marca"
            name="marca"
            value={vehiculoData.marca}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

          <TextField
            label="Modelo"
            name="modelo"
            value={vehiculoData.modelo}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

          <TextField
            label="Año"
            name="año"
            value={vehiculoData.año}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

          <TextField
            label="Color"
            name="color"
            value={vehiculoData.color}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

          <TextField
            label="Kilometraje"
            name="kilometraje"
            value={vehiculoData.kilometraje}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

          <TextField
            label="Tipo de Combustible"
            name="tipo_combustible"
            value={vehiculoData.tipo_combustible}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            select
            
          >
            <MenuItem value="bencina">Bencina</MenuItem>
            <MenuItem value="diesel">Diesel</MenuItem>
            {/* <MenuItem value="electrico">Electrico</MenuItem> */}
          </TextField>

          <TextField
            label="Dueño (ID)"
            name="dueño"
            value={vehiculoData.dueño}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />

          <TextField
            label="Estado del Vehículo"
            name="estado_vehiculo"
            value={vehiculoData.estado_vehiculo}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            select // Asegúrate de que el atributo select esté presente
            
          >
            <MenuItem value="disponible">Disponible</MenuItem>
            <MenuItem value="en_reparacion">En Reparación</MenuItem>
            <MenuItem value="no_disponible">No Disponible</MenuItem>
          </TextField>

          <TextField
            label="Fecha de la Última Revisión"
            name="fecha_ultima_revision"
            value={vehiculoData.fecha_ultima_revision}
            onChange={handleChange}
            type="date"
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            InputLabelProps={{
              shrink: true,
            }}
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
              {isLoading ? 'Registrando...' : 'Registrar Vehículo'}
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
              Volver
            </Button>
          </Box>
        </form>

        <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
          <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
            Vehículo registrado con éxito.
          </Alert>
        </Snackbar>

        <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Grid2>
  );
};

export default RegistrarVehiculo;
