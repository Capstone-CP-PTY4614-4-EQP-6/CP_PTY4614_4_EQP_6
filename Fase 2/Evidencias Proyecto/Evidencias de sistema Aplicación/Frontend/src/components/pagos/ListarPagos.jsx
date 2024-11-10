import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Button, Grid2 } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ListaPagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/pagos/'); // URL de tu API
        setPagos(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  const handleEdit = (id) => {
    navigate(`/editar-pago/${id}`); // Redirigir a la página de edición del pago
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este pago?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/pagos/${id}`); // Eliminar el pago desde la API
      setPagos(pagos.filter(pago => pago.id !== id)); // Actualizar el estado local
    } catch (error) {
      setError(error.message);
      alert('Ha habido un error al eliminar el pago');
    }
  };

  if (loading) {
    return <Typography variant="h6">Cargando...</Typography>;
  }

  if (error) {
    return <Typography variant="body1" color="error">{error}</Typography>;
  }

  return (
    <Grid2 container>
      <Grid2 item xs={12}>
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
                  <Button variant="contained" color="primary" onClick={() => handleEdit(pago.id)}>
                    Editar
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDelete(pago.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid2>
    </Grid2>
  );
};

export default ListaPagos;
