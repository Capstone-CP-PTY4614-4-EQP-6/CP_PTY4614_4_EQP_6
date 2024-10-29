import React, { useState } from 'react';
import { Box, Typography, Button, TextField, FormLabel } from '@mui/material';
import { Snackbar } from '@mui/material';

function EditarCotizacion() {
  const [formulario, setFormulario] = useState({
    // Campos del formulario
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const handleSubmit = (event) => {
    event.preventDefault();
    //  enviar el formulario
    console.log(formulario);
  };

  const handleChange = (event) => {
    setFormulario({
      ...formulario,
      [event.target.name]: event.target.value,
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Editar Cotización
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormLabel>Campos del formulario:</FormLabel>
        <TextField
          id="campo1"
          name="campo1"
          value={formulario.campo1}
          onChange={handleChange}
          label="Campo 1"
          variant="outlined"
        />
        <br />
        <TextField
          id="campo2"
          name="campo2"
          value={formulario.campo2}
          onChange={handleChange}
          label="Campo 2"
          variant="outlined"
        />
        <br />
        <Button type="submit" variant="contained" color="success">
          Guardar Cambios
        </Button>
        <Button variant="contained" color="secondary" href="/lista-cotizaciones">
          Cancelar
        </Button>
      </form>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Box>
  );
}

export default EditarCotizacion;