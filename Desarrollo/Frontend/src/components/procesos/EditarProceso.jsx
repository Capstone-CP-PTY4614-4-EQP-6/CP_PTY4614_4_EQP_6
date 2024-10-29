import React from 'react';
import { Box, Typography, Button, TextField, FormLabel } from '@material-ui/core';
import axios from 'axios';

function EditarProceso() {
  const [formulario, setFormulario] = React.useState({
    nombre: '',
    descripcion: '',
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const actualizarProceso = async () => {
      try {
        const response = await axios.put(`/api/procesos/${formulario.id}`, formulario);
        console.log(response.data);
        // Redirigir a la lista de procesos
        window.location.href = '/lista-procesos';
      } catch (error) {
        console.error(error);
      }
    };
    actualizarProceso();
  };

  const handleChange = (event) => {
    setFormulario({
      ...formulario,
      [event.target.name]: event.target.value,
    });
  };

  // Obtener el ID del proceso desde la URL
  const idProceso = window.location.pathname.split('/').pop();

  // Obtener los datos del proceso desde la API
  const obtenerProceso = async () => {
    try {
      const response = await axios.get(`/api/procesos/${idProceso}`);
      const data = response.data;
      setFormulario(data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    obtenerProceso();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Editar Proceso
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormLabel>Nombre:</FormLabel>
        <TextField
          id="nombre"
          name="nombre"
          value={formulario.nombre}
          onChange={handleChange}
          label="Nombre"
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
        <Button type="submit" variant="contained" color="primary">
          Actualizar Proceso
        </Button>
        <Button variant="contained" color="secondary" href="/lista-procesos">
          Cancelar
        </Button>
      </form>
    </Box>
  );
}

export default EditarProceso;