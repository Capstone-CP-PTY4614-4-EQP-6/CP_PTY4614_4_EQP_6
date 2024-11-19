import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert, Paper, Select, MenuItem, InputLabel, FormControl, Grid } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegistrarProceso() {
  const navigate = useNavigate();
  const [procesoData, setProcesoData] = useState({
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
  const [trabajadores, setTrabajadores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem("accessToken");

  // Opciones para los campos "choices" en el modelo Proceso
  const FASE_CHOICES = [
    { value: 'desabolladura', label: 'Desabolladura' },
    { value: 'preparacion', label: 'Preparación' },
    { value: 'pintura', label: 'Pintura' },
  ];

  const ESTADO_PROCESO_OPCIONES = [
    { value: 'iniciado', label: 'Iniciado' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completado', label: 'Completado' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  const PRIORIDAD_OPCIONES = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' },
  ];

  useEffect(() => {
    axios.get('http://localhost:8000/api/vehiculos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      console.log(response.data); // Verifica los datos
      setVehiculos(response.data);
    })
    .catch(error => setError('Error al cargar la lista de Vehiculos.'));
  }, []);


  useEffect(() => {
    axios.get('http://localhost:8000/api/trabajadores/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      console.log(response.data); // Verifica los datos
      setTrabajadores(response.data);
    })
    .catch(error => setError('Error al cargar la lista de trabajadores.'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Cambiando ${name} a ${value}`); // Línea de depuración
    setProcesoData(prevData => ({ ...prevData, [name]: value }));
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log(procesoData); // Verifica los datos antes de enviarlos
  
    axios.post('http://localhost:8000/api/procesos/crear/', procesoData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('Proceso registrado:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/procesos', { state: { nuevoProceso: response.data } });
      }, 2000);
    })
    .catch(error => {
      console.error('Error al crear el proceso:', error.response ? error.response.data : error.message);
      setError('Error al crear el proceso. Por favor, intenta de nuevo.');
    })
    .finally(() => {
      setIsLoading(false);
    });
  };
  

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}
    >
      <Paper elevation={6} style={{ padding: '2rem', width: '80%', maxWidth: '600px', borderRadius: '12px' }}>
        <Typography variant="h5" align="center" gutterBottom color="primary">
          Registrar Proceso
        </Typography>
        <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
            <InputLabel id="vehiculo-label" style={{ color: '#1976d2' }}>Vehículo</InputLabel>
            <Select
              labelId="vehiculo-label"
              name="vehiculo"
              value={procesoData.vehiculo}
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

          <FormControl fullWidth margin="normal">
            <InputLabel id="trabajador-label" style={{ color: '#1976d2' }}>Trabajador</InputLabel>
            <Select
              labelId="trabajador-label"
              name="trabajador"
              value={procesoData.trabajador} // Usa un valor vacío en caso de undefined o null
              onChange={handleChange}
              color="primary"
              required
            >
              {trabajadores.map((trabajador) => (
                <MenuItem key={trabajador.id_trabajador} value={trabajador.id_trabajador}>
                  {trabajador.nombre} {trabajador.apellido}
                </MenuItem>

              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="fase-proceso-label">Fase del Proceso</InputLabel>
            <Select
              labelId="fase-proceso-label"
              name="fase_proceso"
              value={procesoData.fase_proceso}
              onChange={handleChange}
              required
            >
              {FASE_CHOICES.map(fase => (
                <MenuItem key={fase.value} value={fase.value}>
                  {fase.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            name="descripcion"
            label="Descripción"
            value={procesoData.descripcion}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />

          <TextField
            name="fecha_inicio"
            label="Fecha de Inicio"
            type="datetime-local"
            value={procesoData.fecha_inicio}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            name="fecha_fin"
            label="Fecha de Fin"
            type="datetime-local"
            value={procesoData.fecha_fin}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="estado-proceso-label">Estado del Proceso</InputLabel>
            <Select
              labelId="estado-proceso-label"
              name="estado_proceso"
              value={procesoData.estado_proceso}
              onChange={handleChange}
              required
            >
              {ESTADO_PROCESO_OPCIONES.map(estado => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="prioridad-label">Prioridad</InputLabel>
            <Select
              labelId="prioridad-label"
              name="prioridad"
              value={procesoData.prioridad}
              onChange={handleChange}
              required
            >
              {PRIORIDAD_OPCIONES.map(prioridad => (
                <MenuItem key={prioridad.value} value={prioridad.value}>
                  {prioridad.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar'}
          </Button>
        </form>

        {error && <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>}
        
        {success && <Snackbar open autoHideDuration={6000} onClose={() => setSuccess(false)}>
          <Alert severity="success">Proceso registrado con éxito</Alert>
        </Snackbar>}
      </Paper>
    </Grid>
  );
}

export default RegistrarProceso;
