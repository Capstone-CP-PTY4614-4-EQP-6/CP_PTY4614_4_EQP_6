import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoMatch from './components/NoMatch';
import Dashboardpage from './pages/Dashboardpage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import MiCuentaPage from './pages/MiCuentaPage';
import CitasPage from './pages/CitasPage';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import CotizacionesPage from './pages/CotizacionesPage';
import DueñosPage from './pages/DueñosPage';
import ReparacionesPage from './pages/ReparacionesPage';
import ProcesosPage from './pages/ProcesosPage';
import PagosPage from './pages/PagosPage';
import VehiculosPage from './pages/VehiculosPage';

const theme = createTheme({
  palette: {
    background: {
      default: '#333', // Fondo gris oscuro en todas las páginas
    },
    text: {
      primary: '#fff', // Texto blanco para que contraste con el fondo oscuro
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NoMatch />} />
          <Route path="dashboard" element={<Dashboardpage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegistroPage />} />
          <Route path="citas" element={<CitasPage />} />
          <Route path="mi-cuenta" element={<MiCuentaPage />} />
          <Route path="cotizaciones" element={<CotizacionesPage />} />
          <Route path="Dueños" element={<DueñosPage />} />
          <Route path="pagos" element={<PagosPage />} />
          <Route path="Reparaciones" element={<ReparacionesPage />} />
          <Route path="Procesos" element={<ProcesosPage />} />
          <Route path="Vehiculos" element={<VehiculosPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
