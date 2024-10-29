import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const ListaPagos = () => {
  const pagos = [
    { id: 1, monto: 100, metodo_pago: 'Tarjeta de crédito', fecha_pago: '2022-01-01', estado_pago: 'Pagado' },
    { id: 2, monto: 200, metodo_pago: 'Transferencia bancaria', fecha_pago: '2022-01-15', estado_pago: 'Pagado' },
    { id: 3, monto: 300, metodo_pago: 'Efectivo', fecha_pago: '2022-02-01', estado_pago: 'Pagado' },
  ];

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Typography variant="h2">Lista de Pagos</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Método de Pago</TableCell>
              <TableCell>Fecha de Pago</TableCell>
              <TableCell>Estado de Pago</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell>{pago.id}</TableCell>
                <TableCell>{pago.monto}</TableCell>
                <TableCell>{pago.metodo_pago}</TableCell>
                <TableCell>{pago.fecha_pago}</TableCell>
                <TableCell>{pago.estado_pago}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary">
                    Editar
                  </Button>
                  <Button variant="contained" color="secondary">
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default ListaPagos;