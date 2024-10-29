import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const LoginComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/login/', {
        username,
        password,
      });

      if (response.status === 200) {
        setSuccessMessage('Inicio de sesión exitoso');
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Nombre de usuario o contraseña incorrectos.');
      setSuccessMessage('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#333', // Fondo gris oscuro
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
        <Link href="/home" underline="none" sx={{ color: '#fff', display: 'inline-flex', alignItems: 'center' }} >
          <ArrowBackIcon sx={{ fontSize: '1.2rem', mr: 1 }} />
          Regresar al Inicio
        </Link>
        <Typography variant="h4" gutterBottom>
          Iniciar Sesión
        </Typography>

        {errorMessage && (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
        {successMessage && (
          <Typography variant="body1" color="success" sx={{ mt: 2 }}>
            {successMessage}
          </Typography>
        )}

        <Box component="form" noValidate onSubmit={handleLogin}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de usuario"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Iniciar Sesión
          </Button>
        </Box>
        <Link href="/registro" underline="none" sx={{ color: '#fff' }}>
          ¿No tienes cuenta? Regístrate aquí
        </Link>
      </Box>
    </Box>
  );
};

export default LoginComponent;
