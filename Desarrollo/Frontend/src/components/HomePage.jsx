import React from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material/';
import background from '../assets/img-homepage.png';
import { Link } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

const HomePage = () => {
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 2 : 4,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: isMobile ? '2rem' : '3.5rem',
            marginTop: isMobile ? '2rem' : '5rem',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Bienvenido a Blaze
          <br />
          Gestione sus vehículos y servicios de manera eficiente.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            margin: isMobile ? 2 : 4,
          }}
        >
          {!localStorage.getItem('token') && (
            <Button
              href="/login"
              sx={{
                backgroundColor: '#2e353d',
                color: 'white',
                padding: isMobile ? 1 : 2,
                borderRadius: 3,
                fontSize: isMobile ? '1rem' : '1.5rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '2e353d',
                  color: 'black',
                },
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Box>
      </Box>
    );
  };
  
  export default HomePage;

