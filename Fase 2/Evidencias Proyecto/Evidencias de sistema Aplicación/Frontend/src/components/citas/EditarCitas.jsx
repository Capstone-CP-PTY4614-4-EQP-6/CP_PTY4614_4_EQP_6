import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditarCita = () => {
  const { pk } = useParams();
  const [cita, setCita] = useState({
    vehiculo: '',
    fecha_y_hora: '',
    motivo: '',
    ubicacion: '',
    estado_cita: '',
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el token desde localStorage (o cualquier otro mecanismo de almacenamiento que estés usando)
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate(); // Hook de navegación

  useEffect(() => {
    // Cargar la cita actual
    if (pk) {
      axios.get(`http://localhost:8000/api/citas/${pk}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => setCita(response.data))
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

    const { vehiculo, fecha_y_hora, motivo, ubicacion, estado_cita } = cita;
    if (!vehiculo || !fecha_y_hora || !motivo || !ubicacion || !estado_cita) {
      alert('Debe completar todos los campos');
      setLoading(false);
      return;
    }

    // Enviar el formulario al servidor
    axios.put(`http://localhost:8000/api/citas/${pk}/`, {
      vehiculo,
      fecha_y_hora,
      motivo,
      ubicacion,
      estado_cita,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,  // Incluir el token en la solicitud
      },
    })
      .then(() => {
        setLoading(false);
        alert('Cita actualizada con éxito');
        navigate('/citas');
      })
      .catch(error => {
        setLoading(false);
        setError(error.message);
        alert('Ha habido un error al actualizar la cita');
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCita({ ...cita, [name]: value });
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={8} md={6}>
        <Typography variant="h4" align="center" gutterBottom>
          Editar Cita
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
              value={cita.vehiculo}
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
            label="Fecha y Hora"
            name="fecha_y_hora"
            type="datetime-local"
            value={cita.fecha_y_hora}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Motivo"
            name="motivo"
            value={cita.motivo}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Ubicación"
            name="ubicacion"
            value={cita.ubicacion}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Estado de la cita"
            name="estado_cita"
            value={cita.estado_cita}
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
          <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth sx={{ mt: 2 }} >
            {loading ? 'Actualizando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Grid>
    </Grid>
  );
};

export default EditarCita;
