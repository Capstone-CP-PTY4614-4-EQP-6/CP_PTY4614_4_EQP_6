import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const ListaReparaciones = () => {
  const reparaciones = [
    { id: 1, desc_problema: 'Problema 1', fecha_ingreso: '2022-01-01', fecha_estimada_fin: '2022-01-15', costo_estimado: 100, estado_reparacion: 'En progreso' },
    { id: 2, desc_problema: 'Problema 2', fecha_ingreso: '2022-01-15', fecha_estimada_fin: '2022-02-01', costo_estimado: 200, estado_reparacion: 'Finalizado' },
    { id: 3, desc_problema: 'Problema 3', fecha_ingreso: '2022-02-01', fecha_estimada_fin: '2022-03-01', costo_estimado: 300, estado_reparacion: 'En progreso' },
  ];

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Lista de Reparaciones</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Descripción del Problema</TableCell>
              <TableCell>Fecha de Ingreso</TableCell>
              <TableCell>Fecha Estimada de Fin</TableCell>
              <TableCell>Costo Estimado</TableCell>
              <TableCell>Estado de la Reparación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reparaciones.map((reparacion) => (
              <TableRow key={reparacion.id}>
                <TableCell>{reparacion.id}</TableCell>
                <TableCell>{reparacion.desc_problema}</TableCell>
                <TableCell>{reparacion.fecha_ingreso}</TableCell>
                <TableCell>{reparacion.fecha_estimada_fin}</TableCell>
                <TableCell>{reparacion.costo_estimado}</TableCell>
                <TableCell>{reparacion.estado_reparacion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default ListaReparaciones;