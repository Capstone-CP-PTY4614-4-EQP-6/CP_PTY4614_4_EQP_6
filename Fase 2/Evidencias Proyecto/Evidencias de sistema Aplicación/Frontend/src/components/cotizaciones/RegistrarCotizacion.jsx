import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Alert } from '@mui/material';
import axios from 'axios';

function RegistrarCotizacion() {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener los datos de la cotización desde la API
    axios.get('/api/cotizaciones')
      .then(response => {
        setFormData(response.data);
      })
      .catch(error => {
        setError(error.message);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    // Enviar el formulario a la API
    axios.post('/api/cotizaciones', formData)
      .then(response => {
        setMessages([...messages, { text: 'Cotización registrada exitosamente', severity: 'success' }]);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Container maxWidth="sm" className="mt-5">
      <Typography variant="h2" component="h1" gutterBottom>
        Registrar Cotización
      </Typography>
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          id="nombre"
          name="nombre"
          label="Nombre"
          variant="outlined"
          value={formData.nombre}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          id="descripcion"
          name="descripcion"
          label="Descripción"
          variant="outlined"
          value={formData.descripcion}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? 'Enviando...' : 'Guardar'}
        </Button>
        <Button variant="contained" color="secondary" href="/lista-cotizaciones" fullWidth>
          Cancelar
        </Button>
      </form>
      {messages.map((message, index) => (
        <Alert key={index} severity={message.severity}>
          {message.text}
        </Alert>
      ))}
    </Container>
  );
}

export default RegistrarCotizacion;