import React from 'react';
import { TextField, Button, Grid, Typography } from '@mui/material';

const EditarCita = () => {
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
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Editar Cita</Typography>
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
          <Button variant="contained" color="primary" type="submit">
            Guardar Cambios
          </Button>
        </form>
      </Grid>
    </Grid>
  );
};

export default EditarCita;