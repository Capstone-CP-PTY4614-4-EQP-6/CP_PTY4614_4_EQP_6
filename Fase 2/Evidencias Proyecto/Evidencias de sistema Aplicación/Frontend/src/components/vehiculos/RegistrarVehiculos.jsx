import React from 'react';
import { TextField, Button, Grid, Typography } from '@mui/material';

const RegistrarVehiculo = () => {
  const [patente, setPatente] = React.useState('');
  const [marca, setMarca] = React.useState('');
  const [modelo, setModelo] = React.useState('');
  const [año, setAño] = React.useState('');
  const [color, setColor] = React.useState('');
  const [kilometraje, setKilometraje] = React.useState('');
  const [tipo_combustible, setTipoCombustible] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Enviar el formulario al servidor
    console.log('Formulario enviado');
  };

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Registrar Vehículo</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Patente"
            value={patente}
            onChange={(event) => setPatente(event.target.value)}
            fullWidth
          />
          <TextField
            label="Marca"
            value={marca}
            onChange={(event) => setMarca(event.target.value)}
            fullWidth
          />
          <TextField
            label="Modelo"
            value={modelo}
            onChange={(event) => setModelo(event.target.value)}
            fullWidth
          />
          <TextField
            label="Año"
            value={año}
            onChange={(event) => setAño(event.target.value)}
            fullWidth
          />
          <TextField
            label="Color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            fullWidth
          />
          <TextField
            label="Kilometraje"
            value={kilometraje}
            onChange={(event) => setKilometraje(event.target.value)}
            fullWidth
          />
          <TextField
            label="Tipo de Combustible"
            value={tipo_combustible}
            onChange={(event) => setTipoCombustible(event.target.value)}
            fullWidth
          />
          <Button type="submit">Registrar Vehículo</Button>
        </form>
      </Grid>
    </Grid>
  );
};

export default RegistrarVehiculo;