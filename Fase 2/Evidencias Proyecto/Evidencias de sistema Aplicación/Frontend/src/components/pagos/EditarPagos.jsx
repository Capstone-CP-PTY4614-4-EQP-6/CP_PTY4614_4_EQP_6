import React, { useEffect } from 'react';
import { TextField, Button, Grid2, Typography } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditarPago = () => {
  const [monto, setMonto] = React.useState('');
  const [metodo_pago, setMetodoPago] = React.useState('');
  const [fecha_pago, setFechaPago] = React.useState('');
  const [estado_pago, setEstadoPago] = React.useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // Suponiendo que el ID del pago se pasa como parámetro en la URL

  // Función para obtener los datos del pago al cargar el componente
  useEffect(() => {
    const fetchPago = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/pagos/${id}/`); // URL de tu API
        const pagoData = response.data;
        setMonto(pagoData.monto);
        setMetodoPago(pagoData.metodo_pago);
        setFechaPago(pagoData.fecha_pago);
        setEstadoPago(pagoData.estado_pago);
      } catch (error) {
        console.error('Error al obtener los datos del pago', error);
      }
    };

    fetchPago();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedPago = {
      monto,
      metodo_pago,
      fecha_pago,
      estado_pago,
    };

    try {
      await axios.put(`http://localhost:8000/api/pagos/${id}/`, updatedPago); // URL de tu API
      console.log('Pago actualizado correctamente');
      navigate('/pagos'); // Redirigir a la lista de pagos después de la actualización
    } catch (error) {
      console.error('Error al actualizar el pago', error);
    }
  };

  return (
    <Grid2 container>
      <Grid2 item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Editar Pago</Typography>
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
            Guardar Cambios
          </Button>
        </form>
      </Grid2>
    </Grid2>
  );
};

export default EditarPago;
