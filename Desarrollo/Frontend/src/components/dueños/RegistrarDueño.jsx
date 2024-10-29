import React from 'react';
import { TextField, Button, Grid2, Typography } from '@mui/material';

const RegistrarDueño = () => {
  const [rut, setRut] = React.useState('');
  const [nombre, setNombre] = React.useState('');
  const [apellido, setApellido] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Enviar el formulario al servidor
    console.log('Formulario enviado');
  };

  return (
    <Grid2 container>
      <Grid2 item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Registrar Dueño</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="RUT"
            value={rut}
            onChange={(event) => setRut(event.target.value)}
            fullWidth
          />
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            fullWidth
          />
          <TextField
            label="Apellido"
            value={apellido}
            onChange={(event) => setApellido(event.target.value)}
            fullWidth
          />
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit">
            Registrar Dueño
          </Button>
        </form>
      </Grid2>
    </Grid2>
  );
};

export default RegistrarDueño;