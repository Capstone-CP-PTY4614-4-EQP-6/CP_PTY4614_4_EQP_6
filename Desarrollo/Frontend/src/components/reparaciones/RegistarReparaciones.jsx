import React from 'react';
import { TextField, Button, Grid, Typography } from '@mui/material';

const RegistrarReparacion = () => {
  const [desc_problema, setDescProblema] = React.useState('');
  const [fecha_ingreso, setFechaIngreso] = React.useState('');
  const [fecha_estimada_fin, setFechaEstimadaFin] = React.useState('');
  const [costo_estimado, setCostoEstimado] = React.useState('');
  const [estado_reparacion, setEstadoReparacion] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Enviar el formulario al servidor
    console.log('Formulario enviado');
  };

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Registrar Reparación</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Descripción del Problema"
            value={desc_problema}
            onChange={(event) => setDescProblema(event.target.value)}
            fullWidth
          />
          <TextField
            label="Fecha de Ingreso"
            value={fecha_ingreso}
            onChange={(event) => setFechaIngreso(event.target.value)}
            fullWidth
          />
          <TextField
            label="Fecha Estimada de Fin"
            value={fecha_estimada_fin}
            onChange={(event) => setFechaEstimadaFin(event.target.value)}
            fullWidth
          />
          <TextField
            label="Costo Estimado"
            value={costo_estimado}
            onChange={(event) => setCostoEstimado(event.target.value)}
            fullWidth
          />
          <TextField
            label="Estado de la Reparación"
            value={estado_reparacion}
            onChange={(event) => setEstadoReparacion(event.target.value)}
            fullWidth
          />
          <Button type="submit">Registrar Reparación</Button>
        </form>
      </Grid>
    </Grid>
  );
};

export default RegistrarReparacion;