import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

// define las columnas de la tabla
const columns = [
  { field: 'patente', headerName: 'Patente', width: 90 },
  {
    field: 'cliente',
    headerName: 'Cliente',
    width: 150,
    editable: true,
  },
  {
    field: 'telefono',
    headerName: 'Telefono',
    width: 150,
    editable: true,
  },
  {
    field: 'fecha llegada',
    headerName: 'Fecha llegada',
    type: 'date',
    width: 110,
    editable: true,
  },
  {
    field: 'estado',
    headerName: 'Estado',
    type: 'text',
    sortable: false,
    width: 160,
    editable: true,
  },
  {
    field: 'monto',
    headerName: 'Monto',
    type: 'number',
    sortable: false,
    width: 160,
    editable: true,
  },
];

// define los datos de prueba
const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },

];

// componente principal
export default function DataGridDemo() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw',  }}>
      {/* caja que contiene la tabla */}
      <Box
        backgroundColor="whitesmoke"
        sx={{
          width: { xs: '100%', sm: '80%', md: '70%', lg: '60%' },
          maxWidth: '1200px',
          padding: 2,
          backgroundColor: 'whitesmoke',
          margin: 'auto',
        }}
      >
        {/* tabla de datos */}
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-row': {
              minHeight: '60px !important',
            },
          }}
        />
      </Box>
    </Box>
  );
}

        