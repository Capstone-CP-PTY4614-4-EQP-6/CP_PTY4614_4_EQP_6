import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoMatch from './components/NoMatch';
import Dashboardpage from './pages/Dashboardpage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import MiCuentaPage from './pages/MiCuentaPage';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import CotizacionesPage from './pages/CotizacionesPage';

import DueñosPage from './pages/DueñosPage';


import ProcesosPage from './pages/ProcesosPage';
import EditarProceso from './components/procesos/EditarProceso';
import RegistrarProceso from './components/procesos/RegistrarProceso';

import PagosPage from './pages/PagosPage';
import EditarPago from './components/pagos/EditarPagos';
import RegistrarPago from './components/pagos/RegistrarPagos';

import VehiculosPage from './pages/VehiculosPage';
import EditarVehiculo from './components/vehiculos/EditarVehiculos';
import RegistrarVehiculo from './components/vehiculos/RegistrarVehiculos';

import CitasPage from './pages/CitasPage';
import EditarCita from './components/citas/EditarCitas';
import RegistrarCita from './components/citas/RegistrarCitas';

// const theme = createTheme({
//   palette: {
//     background: {
//       default: '#333', // Fondo gris oscuro en todas las páginas
//     },
//     text: {
//       primary: '#fff', // Texto blanco para que contraste con el fondo oscuro
//     },
//   },
// });

const App = () => {
  return (

      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NoMatch />} />
          <Route path="/dashboard" element={<Dashboardpage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          <Route path="/citas" element={<CitasPage />} />
          <Route path="/editarcita/:pk" element={<EditarCita />} />
          <Route path="/registrarcita" element={<RegistrarCita />} />

          <Route path="/mi-cuenta" element={<MiCuentaPage />} />
          
          <Route path="/cotizaciones" element={<CotizacionesPage />} />
          <Route path="/dueños" element={<DueñosPage />} />
          <Route path="/pagos" element={<PagosPage />} />

          <Route path="/procesos" element={<ProcesosPage />} />
          <Route path="/editarproceso/:pk" element={<EditarProceso />} />
          <Route path="/registrarproceso" element={<RegistrarProceso />} />

          <Route path="/vehiculos" element={<VehiculosPage />} />
          <Route path="/editarvehiculo/:pk" element={<EditarVehiculo />} />
          <Route path="/registrarvehiculo" element={<RegistrarVehiculo />} />
        </Routes>
      </BrowserRouter>

  );
};

export default App;
