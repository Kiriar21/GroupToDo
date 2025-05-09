import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage = () => (
  <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h3" gutterBottom>Group Task Manager</Typography>
    <Typography variant="body1" gutterBottom>
      Aplikacja do zarządzania zadaniami w czasie rzeczywistym.
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Button variant="contained" component={Link} to="/login" sx={{ mr: 2 }}>
        Logowanie
      </Button>
      <Button variant="outlined" component={Link} to="/register">
        Rejestracja
      </Button>
    </Box>
  </Container>
);

export default HomePage;
