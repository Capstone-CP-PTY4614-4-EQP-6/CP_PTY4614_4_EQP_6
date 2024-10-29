import React, { useState } from 'react';
import { Box, Typography, Button, TextField, FormLabel } from '@material-ui/core';
import axios from 'axios';

function RegistrarProceso() {
  const [formulario, setFormulario] = useState({
    fase_proceso: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado_proceso: '',
    prioridad: '',
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const registrarProceso = async () => {
      try {
        const response = await axios.post('/api/procesos', formulario);
        console.log(response.data);
        alert('Proceso registrado con éxito');
      } catch (error) {
        console.error(error);
        alert('Error al registrar el proceso');
      }
    };
    registrarProceso();
  };

  const handleChange = (event) => {
    setFormulario({
      ...formulario,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Registrar Nuevo Proceso
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormLabel>Fase del Proceso:</FormLabel>
        <TextField
          id="fase_proceso"
          name="fase_proceso"
          value={formulario.fase_proceso}
          onChange={handleChange}
          label="Fase del Proceso"
          variant="outlined"
        />
        <br />
        <FormLabel>Descripción:</FormLabel>
        <TextField
          id="descripcion"
          name="descripcion"
          value={formulario.descripcion}
          onChange={handleChange}
          label="Descripción"
          variant="outlined"
        />
        <br />
        <FormLabel>Fecha de Inicio:</FormLabel>
        <TextField
          id="fecha_inicio"
          name="fecha_inicio"
          value={formulario.fecha_inicio}
          onChange={handleChange}
          label="Fecha de Inicio"
          variant="outlined"
        />
        <br />
        <FormLabel>Fecha de Fin:</FormLabel>
        <TextField
          id="fecha_fin"
          name="fecha_fin"
          value={formulario.fecha_fin}
          onChange={handleChange}
          label="Fecha de Fin"
          variant="outlined"
        />
        <br />
        <FormLabel>Estado del Proceso:</FormLabel>
        <TextField
          id="estado_proceso"
          name="estado_proceso"
          value={formulario.estado_proceso}
          onChange={handleChange}
          label="Estado del Proceso"
          variant="outlined"
        />
        <br />
        <FormLabel>Prioridad:</FormLabel>
        <TextField
          id="prioridad"
          name="prioridad"
          value={formulario.prioridad}
          onChange={handleChange}
          label="Prioridad"
          variant="outlined"
        />
        <br />
        <Button type="submit" variant="contained" color="success">
          Registrar Proceso
        </Button>
        <Button variant="contained" color="secondary" href="/lista-procesos">
          Cancelar
        </Button>
      </form>
    </Box>
  );
}

export default RegistrarProceso;