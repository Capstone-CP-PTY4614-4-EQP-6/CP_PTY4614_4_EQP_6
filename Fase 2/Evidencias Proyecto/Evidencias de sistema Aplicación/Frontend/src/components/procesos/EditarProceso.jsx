import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditarProceso() {
  const { pk } = useParams();
  const [proceso, setProceso] = useState({
    vehiculo: '',
    trabajador: "",
    fase_proceso: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado_proceso: '',
    prioridad: '',
    comentarios: '',
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate(); // Hook de navegación

  useEffect(() => {
    // Cargar la proceso actual
    if (pk) {
      axios.get(`http://localhost:8000/api/procesos/${pk}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => setProceso(response.data))
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


    const { vehiculo, fase_proceso, descripcion, fecha_inicio, fecha_fin, estado_proceso, prioridad, trabajador, comentarios } = proceso;
    if (!vehiculo || !fase_proceso || !descripcion || !fecha_inicio || !fecha_fin || !estado_proceso || !prioridad || !trabajador) {
      alert('Debe completar todos los campos');
      setLoading(false);
      return;
    }

  // Enviar el formulario al servidor
  axios.put(`http://localhost:8000/api/procesos/${pk}/`, {
    vehiculo,
    trabajador,
    fase_proceso,
    descripcion,
    fecha_inicio,
    fecha_fin,
    estado_proceso,
    prioridad,
    comentarios,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,  // Incluir el token en la solicitud
    },
  })
    .then(() => {
      setLoading(false);
      alert('Proceso actualizada con éxito');
      navigate('/procesos');
    })
    .catch(error => {
      setLoading(false);
      setError(error.message);
      alert('Ha habido un error al actualizar el proceso');
    });
};


const handleChange = (event) => {
  const { name, value } = event.target;
  setProceso({ ...proceso, [name]: value });
};

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={8} md={6}>
        <Typography variant="h4" align="center" gutterBottom>
          Editar Proceso
        </Typography>
        {error && (
          <Typography variant="body1" color="error" align="center">
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
        <TextField
            label="Fase"
            name="fase_proceso"
            value={proceso.fase_proceso}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            select  
            >
            <MenuItem value="desabolladura">Desabolladura</MenuItem>
            <MenuItem value="preparacion">Preparacion</MenuItem>
            <MenuItem value="pintura">Pintura</MenuItem>
          </TextField>
          <TextField
            label="Descripcion"
            name="descripcion"
            value={proceso.descripcion}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Fecha inicio"
            name="fecha_inicio"
            type="datetime-local"
            value={proceso.fecha_inicio}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Fecha Fin"
            name="fecha_fin"
            type="datetime-local"
            value={proceso.fecha_fin}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Estado proceso"
            name="estado_proceso"
            value={proceso.estado_proceso}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            select
            >
            <MenuItem value="iniciado">Iniciado</MenuItem>
            <MenuItem value="en_progreso">En progreso</MenuItem>
            <MenuItem value="completado">Completado</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
          </TextField>
          <TextField
            label="Prioridad"
            name="prioridad"
            value={proceso.prioridad}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            select           
            >
            <MenuItem value="alta">Alta</MenuItem>
            <MenuItem value="media">Media</MenuItem>
            <MenuItem value="baja">Baja</MenuItem>
          </TextField>

          <TextField
            label="trabajador"
            name="trabajador"
            value={proceso.trabajador}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            color="primary"
            required
            
          />
          <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth sx={{ mt: 2 }} >
            {loading ? 'Actualizando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Grid>
    </Grid>
  );
}

export default EditarProceso;
