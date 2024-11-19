import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');
  const [errorMessages, setErrorMessages] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = localStorage.getItem('accessToken');

  // Función para obtener usuarios
  axios.get('http://localhost:8000/api/admin/usuarios/', {
    headers: {
      Authorization: `Bearer ${token}`,  // Asegúrate de que el token esté correctamente añadido
    }
  })
  .then(response => {
    setUsers(response.data);
  })
  .catch(error => {
    console.error('Hubo un error al obtener los usuarios', error);
  });

  const handleChangeUser = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleChangeRole = (event) => {
    setNewRole(event.target.value);
  };

  const handleSubmit = () => {
    axios.post(`http://localhost:8000/api/admin/cambiar-rol/${selectedUser}/`, {
      rol: newRole,  // Asegúrate de que el rol esté correctamente enviado
    }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
    })
      .then(response => {
        setSuccessMessage('Rol actualizado exitosamente');
        setOpenSnackbar(true);
      })
      .catch(error => {
        setErrorMessages([error.response.data.detail]);
      });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Panel de Administración</Typography>

      {errorMessages.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {errorMessages.map((error, index) => (
            <Alert key={index} severity="error">
              {error}
            </Alert>
          ))}
        </Box>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="user-select-label">Seleccionar Usuario</InputLabel>
        <Select
          labelId="user-select-label"
          value={selectedUser}
          onChange={handleChangeUser}
          label="Seleccionar Usuario"
        >
          {users.map(user => (
            <MenuItem key={user.id} value={user.id}>
              {user.nombre} {user.apellido} - {user.email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="role-select-label">Nuevo Rol</InputLabel>
        <Select
          labelId="role-select-label"
          value={newRole}
          onChange={handleChangeRole}
          label="Nuevo Rol"
        >
          <MenuItem value="dueño">Dueño</MenuItem>
          <MenuItem value="administrador">Administrador</MenuItem>
          <MenuItem value="trabajador">Trabajador</MenuItem>
          <MenuItem value="supervisor">Supervisor</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleSubmit} fullWidth>
        Cambiar Rol
      </Button>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
