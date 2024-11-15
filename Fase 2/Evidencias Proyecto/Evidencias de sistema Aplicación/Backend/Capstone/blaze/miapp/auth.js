// Función de login
function login(email, password) {
    fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), // Verifica si este formato de JSON es correcto
    })
      .then(response => response.json())
      .then(data => {
        if (data.access && data.refresh) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          console.log('Token de acceso obtenido');
          window.location.href = '/home';
        } else {
          console.error('No se pudo obtener el token');
        }
      })
      .catch(error => console.error('Error en la autenticación:', error));
  }
  
  // Función de logout
  function getVehiculos() {
    const token = localStorage.getItem('access_token');
  
    if (token) {
      fetch('http://localhost:8000/api/vehiculos/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Incluir el token en los encabezados
        },
      })
        .then(response => {
          if (!response.ok) {
            // Si el token ha expirado, intenta refrescar el token automáticamente
            if (response.status === 401) {
              console.log('Token expirado, intentando refrescar el token...');
              refreshToken().then(() => getVehiculos());
            } else {
              console.error('Error al obtener vehículos:', response.status);
            }
          } else {
            return response.json();
          }
        })
        .then(data => {
          console.log('Vehículos:', data);
        })
        .catch(error => console.error('Error al obtener vehículos:', error));
    } else {
      console.log('No estás autenticado, por favor inicia sesión');
      // Redirigir al login si no hay token
      window.location.href = '/login';  // Asegúrate de tener esta ruta configurada
    }
  }
  
  
  function fetchWithAuth(url, options = {}) {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token available');
      return;
    }
  
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };
  
    return fetch(url, options)
      .then(response => {
        if (response.status === 401) {
          // Si el token de acceso ha expirado, intenta refrescarlo
          return refreshToken().then(() => {
            // Después de refrescar, intenta la solicitud nuevamente
            return fetch(url, options);
          });
        }
        return response;
      });
  }
  
  
  function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error('No refresh token available');
      return Promise.reject('No refresh token');
    }
  
    return fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          console.log('Access token refreshed');
        } else {
          console.error('Failed to refresh token');
        }
      })
      .catch(error => {
        console.error('Error refreshing token:', error);
        // Redirige al usuario al login si el refresh token también es inválido
        window.location.href = '/login';
      });
  }
  
