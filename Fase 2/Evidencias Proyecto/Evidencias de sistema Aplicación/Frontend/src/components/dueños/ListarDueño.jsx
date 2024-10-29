import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const ListaDueños = () => {
  const dueños = [
    { id: 1, rut: '12345678-9', nombre: 'Juan', apellido: 'Pérez', telefono: '123456789', email: 'juan.perez@example.com' },
    { id: 2, rut: '98765432-1', nombre: 'María', apellido: 'González', telefono: '987654321', email: 'maria.gonzalez@example.com' },
    { id: 3, rut: '11111111-1', nombre: 'Pedro', apellido: 'Martínez', telefono: '111111111', email: 'pedro.martinez@example.com' },
  ];

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Lista de Dueños</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>RUT</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dueños.map((dueño) => (
              <TableRow key={dueño.id}>
                <TableCell>{dueño.id}</TableCell>
                <TableCell>{dueño.rut}</TableCell>
                <TableCell>{dueño.nombre}</TableCell>
                <TableCell>{dueño.apellido}</TableCell>
                <TableCell>{dueño.telefono}</TableCell>
                <TableCell>{dueño.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default ListaDueños;