import React from 'react';
import { TextField, Button, Grid, Typography } from '@mui/material';

const RegistrarPago = () => {
  const [monto, setMonto] = React.useState('');
  const [metodo_pago, setMetodoPago] = React.useState('');
  const [fecha_pago, setFechaPago] = React.useState('');
  const [estado_pago, setEstadoPago] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Enviar el formulario al servidor
    console.log('Formulario enviado');
  };

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Registrar Pago</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Monto"
            value={monto}
            onChange={(event) => setMonto(event.target.value)}
            fullWidth
          />
          <TextField
            label="Método de Pago"
            value={metodo_pago}
            onChange={(event) => setMetodoPago(event.target.value)}
            fullWidth
          />
          <TextField
            label="Fecha de Pago"
            value={fecha_pago}
            onChange={(event) => setFechaPago(event.target.value)}
            fullWidth
          />
          <TextField
            label="Estado de Pago"
            value={estado_pago}
            onChange={(event) => setEstadoPago(event.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit">
            Registrar Pago
          </Button>
        </form>
      </Grid>
    </Grid>
  );
};

export default RegistrarPago;