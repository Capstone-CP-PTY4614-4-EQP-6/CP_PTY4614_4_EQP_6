import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Box, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, OutlinedInput, InputAdornment, FormLabel } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditarCotizacion() {
  const {pk} = useParams();
  const [cotizacion, setCotizacion] = useState({
    vehiculo: '',
    fecha_creacion: '',
    estado: '',
    total_estimado: '',
    descripcion: '',
    monto_total:  '',
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate(); // Hook de navegación

  useEffect(() => {
    // Cargar la cotizacion actual
    if (pk) {
      axios.get(`http://localhost:8000/api/cotizaciones/${pk}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => setCotizacion(response.data))
        .catch(error => setError(error.message));
    }

    // Cargar la lista de vehículos
    axios.get('http://localhost:8000/api/vehiculos/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => setVehiculos(response.data))
      .catch(error => setError(error.message));
  }, [pk, token]);


  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    const { vehiculo, fecha_creacion, estado, total_estimado, descripcion, monto_total } = cotizacion;
    if (!vehiculo || !fecha_creacion || !estado || !total_estimado || !descripcion || !monto_total) {
      alert('Debe completar todos los campos');
      setLoading(false);
      return;
    }

     // Enviar el formulario al servidor
     axios.put(`http://localhost:8000/api/cotizaciones/${pk}/`, {
      vehiculo,
      fecha_creacion,
      estado,
      total_estimado,
      descripcion,
      monto_total,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,  // Incluir el token en la solicitud
      },
    })
      .then(() => {
        setLoading(false);
        alert('Cotizacion actualizada con éxito');
        navigate('/cotizaciones');
      })
      .catch(error => {
        setLoading(false);
        setError(error.message);
        alert('Ha habido un error al actualizar la cotizacion');
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCotizacion({ ...cotizacion, [name]: value});
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={8} md={6}>
        <Typography variant="h4" align="center" gutterBottom>
          Editar cotizacion
        </Typography>
        {error && (
          <Typography variant="body1" color="error" align="center">
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Vehículo</InputLabel>
            <Select
              name="vehiculo"
              value={cotizacion.vehiculo}
              onChange={handleChange}
              label="Vehículo"
            >
              {vehiculos.map((vehiculo) => (
                <MenuItem key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.modelo} - {vehiculo.patente} {/* Ajusta según los datos del vehículo */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Fecha"
            name="fecha_creacion"
            type="datetime-local"
            value={cotizacion.fecha_creacion}
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
            value={cotizacion.estado}
            onChange={handleChange}
            required
            fullWidth
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
            value={cotizacion.descripcion}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Monto total"
            name="monto_total"
            value={cotizacion.monto_total}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="total_estimadO"
            name="total_estimado"
            value={cotizacion.total_estimado}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth sx={{ mt: 2 }} >
            {loading ? 'Actualizando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Grid>
    </Grid>
  );
}

export default EditarCotizacion;