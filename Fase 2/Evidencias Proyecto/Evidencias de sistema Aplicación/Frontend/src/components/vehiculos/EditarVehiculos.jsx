import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Typography, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditarVehiculo = () => {
  const { pk } = useParams();
  const [vehiculo, setVehiculo] = useState({
    patente: '',
    marca: '',
    modelo: '',
    año: '',
    color: '',
    kilometraje: '',
    tipo_combustible: '',
    fecha_ultima_revision: '',
    dueño: '',
    estado_vehiculo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate(); // Hook de navegación

  useEffect(() => {
    if (pk) {
      axios.get(`http://localhost:8000/api/vehiculos/${pk}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => setVehiculo(response.data))
        .catch(error => setError(error.message));
    }
  }, [pk, token]);


  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
  
    // Validación
    const { patente, marca, modelo, año, color, kilometraje, tipo_combustible, dueño, estado_vehiculo, fecha_ultima_revision } = vehiculo;
  
    if (!patente || !marca || !modelo || !año || !color || !kilometraje || !tipo_combustible || !dueño || !estado_vehiculo || !fecha_ultima_revision) {
      alert('Debe completar todos los campos');
      setLoading(false);
      return;
    }
  
  
    axios.put(`http://localhost:8000/api/vehiculos/${pk}/`, {
      patente, marca, modelo, año, color, kilometraje, tipo_combustible, dueño, estado_vehiculo, fecha_ultima_revision,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setLoading(false);
        alert('Vehículo actualizado con éxito');
        navigate('/vehiculos'); // Redirige a la página de listado de vehículos
      })
      .catch((error) => {
        setLoading(false);
        setError(error.response ? error.response.data : error.message); // Muestra la respuesta detallada del error
        alert('Ha habido un error al actualizar el vehículo');
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setVehiculo( { ...vehiculo, [name]: value });
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={8} md={6}>
        <Typography variant="h4" align="center" gutterBottom>
          Editar Vehículo
        </Typography>
        {error && (
          <Typography variant="body1" color="error" align="center">
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
        
          <TextField
            label="Patente"
            name="patente"
            value={vehiculo.patente}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Marca"
            name="marca"
            value={vehiculo.marca}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Modelo"
            name="modelo"
            value={vehiculo.modelo}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Año"
            name="año"
            value={vehiculo.año}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Color"
            name="color"
            value={vehiculo.color}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Kilometraje"
            name="kilometraje"
            value={vehiculo.kilometraje}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tipo combustible"
            name="tipo_combustible"
            value={vehiculo.tipo_combustible}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Fecha ultima revision"
            name="fecha_ultima_revision"
            value={vehiculo.fecha_ultima_revision}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Dueño"
            name="dueño"
            value={vehiculo.dueño}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Estado vehiculo"
            name="estado_vehiculo"
            value={vehiculo.estado_vehiculo}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth sx={{ mt: 2 }}>
            {loading ? 'Actualizando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Grid>
    </Grid>
  );
};

export default EditarVehiculo;
