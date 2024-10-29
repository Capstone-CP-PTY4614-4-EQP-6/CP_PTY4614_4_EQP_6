// NoMatch.jsx
import React from 'react';

const NoMatch = () => {
  return (
    <div className="not-found" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>
          Lo sentimos, la página que estás buscando no existe o ha sido eliminada.
        </p>
      </div>
    </div>
  );
};

export default NoMatch;

