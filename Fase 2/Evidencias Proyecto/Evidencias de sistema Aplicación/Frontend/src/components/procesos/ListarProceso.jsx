import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableHead, TableCell, TableRow, TableBody } from '@material-ui/core';
import axios from 'axios';

function ListarProceso() {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerProcesos = async () => {
      try {
        const response = await axios.get('/api/procesos');
        const data = response.data;
        setProcesos(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    obtenerProcesos();
  }, []);

  const handleEditar = (idProceso) => {
    const editarProceso = async () => {
      try {
        const response = await axios.put(`/api/procesos/${idProceso}`);
        const data = response.data;
        const nuevosProcesos = procesos.map((proceso) => {
          if (proceso.id_proceso === idProceso) {
            return data;
          }
          return proceso;
        });
        setProcesos(nuevosProcesos);
      } catch (error) {
        console.error(error);
      }
    };
    editarProceso();
  };

  const handleEliminar = (idProceso) => {
    const eliminarProceso = async () => {
      try {
        await axios.delete(`/api/procesos/${idProceso}`);
        const nuevosProcesos = procesos.filter((proceso) => proceso.id_proceso !== idProceso);
        setProcesos(nuevosProcesos);
      } catch (error) {
        console.error(error);
      }
    };
    eliminarProceso();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Lista de Procesos
      </Typography>
      <Button variant="contained" color="primary" href="/registro-proceso">
        Registrar Nuevo Proceso
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Fase</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Fecha de Inicio</TableCell>
            <TableCell>Fecha de Fin</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Prioridad</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {procesos.map((proceso) => (
            <TableRow key={proceso.id_proceso}>
              <TableCell>{proceso.id_proceso}</TableCell>
              <TableCell>{proceso.fase_proceso}</TableCell>
              <TableCell>{proceso.descripcion}</TableCell>
              <TableCell>{proceso.fecha_inicio}</TableCell>
              <TableCell>{proceso.fecha_fin}</TableCell>
              <TableCell>{proceso.estado_proceso}</TableCell>
              <TableCell>{proceso.prioridad}</TableCell>
              <TableCell>
                <Button variant="contained" color="warning" onClick={() => handleEditar(proceso.id_proceso)}>
                  Editar
                </Button>
                <Button variant="contained" color="danger" onClick={() => handleEliminar(proceso.id_proceso)}>
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {loading && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Cargando...
              </TableCell>
            </TableRow>
          )}
          {!procesos.length && !loading && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No hay procesos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

export default ListarProceso;