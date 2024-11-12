// HomePage.jsx
import React from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material/';
import background from '../assets/img-homepage.png';

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
                Gestione sus vehículos y servicios de manera eficiente. Por favor, inicie sesión para acceder a su cuenta.
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
                {/* se puede agregar más botones o enlaces relevantes */}
            </Box>
        </Box>
    );
};

export default HomePage;
