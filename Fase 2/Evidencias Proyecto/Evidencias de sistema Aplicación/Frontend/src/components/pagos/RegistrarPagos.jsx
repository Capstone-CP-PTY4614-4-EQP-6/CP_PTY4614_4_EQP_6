import React, { useState } from 'react';
import { TextField, Button, Grid2, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegistrarPago = () => {
  const [monto, setMonto] = useState('');
  const [metodo_pago, setMetodoPago] = useState('');
  const [fecha_pago, setFechaPago] = useState('');
  const [estado_pago, setEstadoPago] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Validar campos
    if (!monto || !metodo_pago || !fecha_pago || !estado_pago) {
      alert('Debe completar todos los campos');
      setLoading(false);
      return;
    }

    try {
      // Enviar el formulario al servidor
      const response = await axios.post('http://localhost:8000/api/pagos/', {
        monto,
        metodo_pago,
        fecha_pago,
        estado_pago
      });
      alert('Pago registrado con éxito');
      navigate('/lista-pagos'); // Redirigir a la lista de pagos después de registrar
    } catch (error) {
      setError(error.message);
      alert('Ha habido un error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid2 container>
      <Grid2 item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Registrar Pago</Typography>
        {error && (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        )}
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
          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Pago'}
          </Button>
        </form>
      </Grid2>
    </Grid2>
  );
};

export default RegistrarPago;
