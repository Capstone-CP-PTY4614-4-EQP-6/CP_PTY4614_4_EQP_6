import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const RegistrarCita = () => {
  const [vehiculo, setVehiculo] = React.useState('');
  const [fecha_y_hora, setFecha_y_hora] = React.useState('');
  const [motivo, setMotivo] = React.useState('');
  const [ubicacion, setUbicacion] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Enviar el formulario al servidor
    console.log('Formulario enviado');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#333',
      }}
    >
      <Box
        sx={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: '#444', // Fondo del formulario
            borderRadius: 2,
            padding: 4,
            boxShadow: 3,
            color: '#fff',
        }}
      >
        <Typography variant="h2" align="center">
          Registrar Cita
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Vehículo"
            value={vehiculo}
            onChange={(event) => setVehiculo(event.target.value)}
            fullWidth
          />
          <TextField
            label="Fecha y Hora"
            value={fecha_y_hora}
            onChange={(event) => setFecha_y_hora(event.target.value)}
            fullWidth
          />
          <TextField
            label="Motivo"
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            fullWidth
          />
          <TextField
            label="Ubicación"
            value={ubicacion}
            onChange={(event) => setUbicacion(event.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
          >
            Registrar Cita
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default RegistrarCita;
