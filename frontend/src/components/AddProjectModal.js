import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import api from '../services/api';
import socket from '../services/socket';

const AddProjectModal = ({ open, onClose }) => {
  const [name, setName]           = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    const newProj = await api.createProject(name, description);
    socket.emit('project:create', newProj);
    onClose();
    setName('');
    setDescription('');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 300, mx: 'auto', mt: '15%', p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">Nowy projekt</Typography>
        <TextField
          label="Nazwa"
          fullWidth margin="normal"
          value={name} onChange={e => setName(e.target.value)}
        />
        <TextField
          label="Opis"
          fullWidth margin="normal"
          value={description} onChange={e => setDescription(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd} fullWidth sx={{ mt: 2 }}>
          Dodaj
        </Button>
      </Box>
    </Modal>
  );
};

export default AddProjectModal;