import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    // Inicializamos el estado con el valor de localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const navigate = useNavigate();
  const isMenuOpen = Boolean(anchorEl);

  // Actualiza el estado de autenticación y el localStorage cuando se inicie sesión
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/'); // Redirige a la página principal después de iniciar sesión
  };

  // Actualiza el estado de autenticación y el localStorage cuando se cierre sesión
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    navigate('/'); // Redirige a la página principal o login
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {isAuthenticated ? (
        [
          <MenuItem key="account" onClick={() => { handleMenuClose(); navigate('/mi-cuenta'); }}>Ver cuenta</MenuItem>,
          <MenuItem key="logout" onClick={() => { handleMenuClose(); handleLogout(); }}>Cerrar sesión</MenuItem>
        ]
      ) : (
        <MenuItem key="login" onClick={() => { handleMenuClose(); navigate('/login'); }}>Iniciar sesión</MenuItem>
      )}
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ top: 7, left: 0, right: 0, mx: 'auto', maxWidth: 'calc(100% - 20px)', borderRadius: '15px', backgroundColor: '#2e353d' }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/home"
            sx={{
              mr: 2,
              display: 'block',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Blaze
          </Typography>
          <IconButton color="inherit" onClick={() => { navigate("/dashboard"); }} sx={{ marginRight: "10px" }}>
            <DashboardIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </Box>
  );
}

export default NavBar;
