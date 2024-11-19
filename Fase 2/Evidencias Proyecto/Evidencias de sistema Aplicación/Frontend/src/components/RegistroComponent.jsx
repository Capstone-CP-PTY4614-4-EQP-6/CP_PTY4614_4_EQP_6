import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    password: '',
  });
  const [errorMessages, setErrorMessages] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]); // Resetear mensajes de error
    console.log('Submitting form with data:', formData);

    try {
      const response = await axios.post('http://localhost:8000/api/register/', formData);
      console.log('Response from server:', response);

      if (response.status === 201) {
        const { token } = response.data;  // Assuming the token is in response.data
        console.log('Registration successful. Token received:', token);

        localStorage.setItem('authToken', token);
        localStorage.setItem('username', formData.nombre);

        setSuccessMessage('Usuario registrado exitosamente.');
        setOpenSnackbar(true);
        
        setFormData({
          email: '',
          nombre: '',
          apellido: '',
          password: '',
        });

        console.log('Redirecting to login page...');
        navigate('/login');
      }
    } catch (error) {
      console.log('Error during registration:', error);
      if (error.response && error.response.data) {
        console.log('Error details from server:', error.response.data);
        setErrorMessages(Object.values(error.response.data).flat());
      } else {
        console.log('An unknown error occurred.');
        setErrorMessages(['Ocurrió un error desconocido.']);
      }
    }
  };

  const handleCloseSnackbar = () => {
    console.log('Closing success snackbar');
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
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
          backgroundColor: '#444',
          borderRadius: 2,
          padding: 4,
          boxShadow: 3,
          color: '#fff',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Registrar Usuario
        </Typography>

        {errorMessages.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {errorMessages.map((error, index) => (
              <Alert key={index} severity="error">
                {error}
              </Alert>
            ))}
          </Box>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px',
              },
              '& label': {
                color: '#fff',
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="apellido"
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px',
              },
              '& label': {
                color: '#fff',
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px',
              },
              '& label': {
                color: '#fff',
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px',
              },
              '& label': {
                color: '#fff',
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#555',
              '&:hover': {
                backgroundColor: '#666',
              },
            }}
          >
            Registrar
          </Button>
        </Box>

        <Link href="/login" underline="none" sx={{ color: '#fff' }}>
          ¿Ya tienes una cuenta? Inicia sesión aquí.
        </Link>
        <p>
          <Link href="/" underline="none" sx={{ color: '#fff' }}>
            Volver a la página principal
          </Link>
        </p>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          Usuario registrado exitosamente.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;