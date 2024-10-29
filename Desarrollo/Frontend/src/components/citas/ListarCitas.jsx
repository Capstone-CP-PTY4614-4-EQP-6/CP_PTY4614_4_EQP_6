import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid2 } from '@mui/material';

const ListaCitas = () => {
  const citas = [
    { id: 1, vehiculo: 'Vehículo 1', fecha_y_hora: '2023-02-15 10:00', motivo: 'Motivo 1', ubicacion: 'Ubicación 1' },
    { id: 2, vehiculo: 'Vehículo 2', fecha_y_hora: '2023-02-16 11:00', motivo: 'Motivo 2', ubicacion: 'Ubicación 2' },
    { id: 3, vehiculo: 'Vehículo 3', fecha_y_hora: '2023-02-17 12:00', motivo: 'Motivo 3', ubicacion: 'Ubicación 3' },
  ];

  return (
    <Grid2 container>
      <Grid2 item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Lista de Citas</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Ubicación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citas.map((cita) => (
              <TableRow key={cita.id}>
                <TableCell>{cita.id}</TableCell>
                <TableCell>{cita.vehiculo}</TableCell>
                <TableCell>{cita.fecha_y_hora}</TableCell>
                <TableCell>{cita.motivo}</TableCell>
                <TableCell>{cita.ubicacion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid2>
    </Grid2>
  );
};

export default ListaCitas;