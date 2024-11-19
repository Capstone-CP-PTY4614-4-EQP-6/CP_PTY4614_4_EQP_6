import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid2, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegistrarPagos() {
  const [pagoData, setPagoData] = useState({
    proceso: '',
    cotizacion: '',
    monto: '',
    metodo_pago: '',
    fecha_pago: '',
    estado_pago: ''
  });

  const [procesos, setProcesos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  //opciones para los campos con choices
  const metodoPagoOptions = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta de Credito' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'tarjeta_debito', label: 'Tarjeta de Debito' }
  ];

  const estadoPagoOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' }
  ]
  //obtiene la lista de procesos
  useEffect(() => {
    axios.get('http://localhost:8000/api/procesos/', {
      headers: { 'Authorization': `Bearer ${token}`}
    })
    .then(response => {
      console.log(response.data);
      setProcesos(response.data);
    })
    .catch(error => setError('Error al obtener los procesos'));
  }, []);

  // //obtiene la lista de cotizaciones
  // useEffect(() => {
  //   axios.get('http://localhost:8000/api/cotizaciones/', {
  //     headers: { 'Authorization': `Bearer ${token}`}
  //   })
  //   .then(response => {
  //     console.log(response.data);
  //     setCotizaciones(response.data);
  //   })
  //   .catch(error => setError('Error al obtener las cotizaciones'));
  // }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Cambiando ${name} a ${value}`); // Línea de depuración
    setPagoData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
  
    console.log(pagoData); // Verifica los datos antes de enviarlos

    axios.post('http://localhost:8000/api/pagos/crear/', pagoData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log('Pago registrado:', response.data);
        setSuccess(true);
        setTimeout(() => {
          navigate('/pagos', { state: { nuevoPago: response.data } });
        }, 2000);
      })
      .catch(error => {
        console.error('Error al crear el pago:', error.response ? error.response.data : error.message);
        setError('Error al crear el pago. Por favor, intenta de nuevo.');
      })
      .finally(() => {
        setLoading(false);
      });
  };
    return (
      <Grid2
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}
      >
        <Paper elevation={6} style={{ padding: '2rem', width: '80%', maxWidth: '600px', borderRadius: '12px' }}>
          <Typography variant="h5" align="center" gutterBottom color="primary">
            Registrar pago
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="proceso-label" style={{ color: '#1976d2' }}>Proceso</InputLabel>
              <Select
                labelId="proceso-label"
                name="proceso"
                value={pagoData.proceso}
                onChange={handleChange}
                required
                color="primary"
              >
                {procesos.map((proceso) => (
                  <MenuItem key={proceso.id} value={proceso.id}>
                    {proceso.id} - {proceso.descripcion} {/* Ajusta según el modelo de datos del vehículo */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="cotizacion-label" style={{ color: '#1976d2' }}>Cotizacion</InputLabel>
              <Select
                labelId="cotizacion-label"
                name="cotizacion"
                value={pagoData.cotizacion} // Usa un valor vacío en caso de undefined o null
                onChange={handleChange}
                color="primary"
                required
              >
                {cotizaciones.map((cotizacion) => (
                  <MenuItem key={cotizacion.id_cotizacion} value={cotizacion.id_cotizacion}>
                    {cotizacion.descripcion} {cotizacion.monto_total}
                  </MenuItem>

                ))}
              </Select>
            </FormControl>

            <TextField
              name="fecha_pago"
              label="Fecha inicial del pago"
              type="datetime-local"
              value={pagoData.fecha_pago}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />

            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>
          </form>

          {error && <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>}

          {success && <Snackbar open autoHideDuration={6000} onClose={() => setSuccess(false)}>
            <Alert severity="success">Proceso registrado con éxito</Alert>
          </Snackbar>}
        </Paper>
      </Grid2>
    );
  };


export default RegistrarPagos;
