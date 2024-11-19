import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useUser } from '../components/contextouser';  // Ajusta según el contexto que uses

const ProtectedRoute = ({ element, roles, ...rest }) => {
  const { user } = useUser();

  // Si el usuario no está autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verificar si el usuario tiene el rol requerido
  if (!roles.includes(user.perfil.rol)) {
    return <Navigate to="/" />;
  }

  // Si pasa las condiciones, devuelve el componente element
  return <Route {...rest} element={element} />;
};

export default ProtectedRoute;
