import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await axios.post('/api/registro/', {
        username,
        password,
        password_confirm: passwordConfirm,
      });

      if (response.status === 201) {
        setSuccessMessage('Usuario registrado exitosamente');
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Error al registrar el usuario. Verifica los datos e intenta nuevamente.');
      setSuccessMessage('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        Height: '100vh',
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
        <Link href="/home" underline="none" sx={{ color: '#fff', display: 'inline-flex', alignItems: 'center' }} >
          <ArrowBackIcon sx={{ fontSize: '1.2rem', mr: 1 }} />
          Regresar al Inicio
        </Link>
        <Typography variant="h4" gutterBottom>
          Registrar Usuario
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

        <Box component="form" noValidate onSubmit={handleRegister}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de Usuario"
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
            autoComplete="new-password"
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="passwordConfirm"
            label="Confirmar Contraseña"
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
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
            Registrar Usuario
          </Button>
        </Box>
        <Link href="/login" underline="none" sx={{ color: '#fff' }}>
          ¿Ya tienes cuenta? Inicia sesión aquí
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterPage;
