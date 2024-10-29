import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const ListaVehiculos = () => {
  const vehiculos = [
    { id: 1, patente: 'ABC123', marca: 'Toyota', modelo: 'Corolla', año: 2015, color: 'Blanco', kilometraje: 100000, tipo_combustible: 'Gasolina' },
    { id: 2, patente: 'DEF456', marca: 'Honda', modelo: 'Civic', año: 2018, color: 'Negro', kilometraje: 50000, tipo_combustible: 'Gasolina' },
    { id: 3, patente: 'GHI789', marca: 'Ford', modelo: 'Focus', año: 2012, color: 'Rojo', kilometraje: 200000, tipo_combustible: 'Diesel' },
  ];

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Lista de Vehículos</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patente</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Año</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Kilometraje</TableCell>
              <TableCell>Tipo de Combustible</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehiculos.map((vehiculo) => (
              <TableRow key={vehiculo.id}>
                <TableCell>{vehiculo.id}</TableCell>
                <TableCell>{vehiculo.patente}</TableCell>
                <TableCell>{vehiculo.marca}</TableCell>
                <TableCell>{vehiculo.modelo}</TableCell>
                <TableCell>{vehiculo.año}</TableCell>
                <TableCell>{vehiculo.color}</TableCell>
                <TableCell>{vehiculo.kilometraje}</TableCell>
                <TableCell>{vehiculo.tipo_combustible}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default ListaVehiculos;