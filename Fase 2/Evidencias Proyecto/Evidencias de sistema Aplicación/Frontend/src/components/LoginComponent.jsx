import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión...");
  
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email,
        password,
      });
  
      console.log("Respuesta completa del servidor:", response.data);
  
      if (response.status === 200) {
        const accessToken = response.data.access;
        const refreshToken = response.data.refresh;
  
        // Guardar los tokens en localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('isAuthenticated', 'true');  // Añadir esta línea
  
        console.log("Inicio de sesión exitoso.");
        console.log("Token JWT de acceso recibido:", accessToken);
        console.log("Token JWT de refresco recibido:", refreshToken);
  
        setSuccessMessage('Inicio de sesión exitoso');
        setErrorMessage('');
  
        // Redirigir a la página de inicio
        navigate('/home');
        console.log("Redirigiendo a la página de inicio...");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage('Credenciales incorrectas. Verifica tus datos e intenta nuevamente.');
      } else {
        setErrorMessage('Error al iniciar sesión. Intenta de nuevo más tarde.');
      }
      setSuccessMessage('');
      console.error("Error al iniciar sesión:", error.response ? error.response.data : error.message);
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
            id="email"
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          ¿No tienes cuenta? Regístrate aquí.
        </Link>
        <p>
          <Link href="/" underline="none" sx={{ color: '#fff' }}>
            Volver a la página principal
          </Link>
        </p>
      </Box>
    </Box>
  );
};

export default LoginPage;
