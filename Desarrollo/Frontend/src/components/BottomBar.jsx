import * as React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ChatIcon from '@mui/icons-material/Chat';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidIcon from '@mui/icons-material/Paid';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import { Link } from 'react-router-dom';
import CitasPage from '../pages/CitasPage';
import CotizacionesPage from '../pages/CotizacionesPage';
import DueñosPage from '../pages/DueñosPage';
import PagosPage from '../pages/PagosPage';
import VehiculosPage from '../pages/VehiculosPage';
import ReparacionesPage from '../pages/ReparacionesPage';



export default function LabelBottomNavigation() {
  const [value, setValue] = React.useState('recents');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <BottomNavigation
      sx={{
        width: { xs: '90%', sm: 500 },
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 7,
        borderRadius: 10,
        backgroundColor: '#2e353d',
      }}
      value={value}
      onChange={handleChange}
    >
      <BottomNavigationAction
        label="Vehiculo"
        value="vehiculo"
        href='/VehiculosPage'
        sx={{
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .MuiSvgIcon-root': {
            display: 'flex',
            margin: 'auto',
          },
        }}
        icon={<DirectionsCarFilledIcon />}
      />
      <BottomNavigationAction
        label="Reparaciones"
        value="reparaciones"
        href='/ReparacionesPage'
        sx={{
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .MuiSvgIcon-root': {
            display: 'flex',
            margin: 'auto',
          },
        }}
        icon={<BuildIcon />}
      />
      <BottomNavigationAction
        label="Citas"
        value="citas"
        href='/CitasComponent'
        sx={{
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .MuiSvgIcon-root': {
            display: 'flex',
            margin: 'auto',
          },
        }}
        icon={<AccessTimeIcon />}
      />
      <BottomNavigationAction
        label="Pagos"
        value="pagos"
        href='/PagosPage'
        sx={{
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .MuiSvgIcon-root': {
            display: 'flex',
            margin: 'auto',
          },
        }}
        icon={<PaidIcon />}
      />
      <BottomNavigationAction
        label="Mensajes"
        value="mensajes"
        sx={{
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .MuiSvgIcon-root': {
            display: 'flex',
            margin: 'auto',
          },
        }}
        icon={<ChatIcon />}
      />
    </BottomNavigation>
  );
}

