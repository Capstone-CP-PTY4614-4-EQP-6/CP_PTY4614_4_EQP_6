import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircleOutline, ErrorOutline, Pending } from '@mui/icons-material';

const Dashboard = () => {
  const [procesos, setProcesos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/procesos/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setProcesos(response.data))
      .catch((error) => console.error('Error al obtener procesos:', error));

    axios
      .get('http://localhost:8000/api/citas/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setCitas(response.data))
      .catch((error) => console.error('Error al obtener citas:', error));

    axios
      .get('http://localhost:8000/api/vehiculos/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setVehiculos(response.data))
      .catch((error) => console.error('Error al obtener vehículos:', error));

    axios
      .get('http://localhost:8000/api/trabajadores/', { // Asegúrate de tener un endpoint de trabajadores
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTrabajadores(response.data))
      .catch((error) => console.error('Error al obtener trabajadores:', error));
  }, [token]);

  // Contadores
  const totalProcesos = procesos.length;
  const procesosPendientes = procesos.filter((p) => p.estado_proceso === 'pendiente').length;
  const procesosEnProgreso = procesos.filter((p) => p.estado_proceso === 'en_progreso').length;
  const procesosCompletados = procesos.filter((p) => p.estado_proceso === 'completado').length;

  const totalVehiculos = vehiculos.length;
  const totalTrabajadores = trabajadores.length;

  const totalPagosCompletados = citas.filter((c) => c.estado_pago === 'completado').length;
  const totalPagosPendientes = citas.filter((c) => c.estado_pago === 'pendiente').length;

  // Contar vehículos por tipo (o cualquier otra categoría)
  const vehiculosPorMarca = vehiculos.reduce((acc, vehiculo) => {
    acc[vehiculo.marca] = (acc[vehiculo.marca] || 0) + 1;
    return acc;
  }, {});

  // Gráfico de rendimiento de trabajadores
  const rendimientoTrabajadores = trabajadores.map((trabajador) => ({
    nombre: trabajador.nombre,
    reparaciones: procesos.filter((p) => p.trabajador === trabajador.id).length,
  }));

  return (
    <Grid container spacing={3}>
      {/* Sección de métricas rápidas */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {/* Total de Procesos */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleOutline color="success" />
                  <Typography variant="subtitle1">Total Procesos</Typography>
                </Box>
                <Typography variant="h4">{totalProcesos}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Procesos Pendientes */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Pending color="warning" />
                  <Typography variant="subtitle1">Procesos Pendientes</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {procesosPendientes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Procesos En Progreso */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <ErrorOutline color="info" />
                  <Typography variant="subtitle1">Procesos en Progreso</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {procesosEnProgreso}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Citas de Hoy */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleOutline color="primary" />
                  <Typography variant="subtitle1">Citas de Hoy</Typography>
                </Box>
                <Typography variant="h4">{citas.filter((c) => new Date(c.fecha).toDateString() === new Date().toDateString()).length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Gráfico de Estado de Procesos */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estado de los Procesos
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { estado: 'Pendiente', cantidad: procesosPendientes },
                  { estado: 'En Progreso', cantidad: procesosEnProgreso },
                  { estado: 'Completado', cantidad: procesosCompletados },
                ]}
              >
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico de Pagos */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pagos
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completados', value: totalPagosCompletados },
                    { name: 'Pendientes', value: totalPagosPendientes },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  <Cell fill="#4caf50" />
                  <Cell fill="#ff9800" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico de Vehículos por Marca */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vehículos por Marca
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={Object.keys(vehiculosPorMarca).map((marca) => ({
                  marca,
                  cantidad: vehiculosPorMarca[marca],
                }))}
              >
                <XAxis dataKey="marca" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico de Rendimiento de Trabajadores */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rendimiento de Trabajadores
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={rendimientoTrabajadores}
              >
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reparaciones" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
