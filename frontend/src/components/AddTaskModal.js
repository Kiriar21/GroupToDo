import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import api from '../services/api';

const AddTaskModal = ({ open, onClose, project }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    await api.createTask(project._id, title, description);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 300, mx: 'auto', mt: '15%', p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">Nowe zadanie</Typography>
        <TextField label="Tytuł" fullWidth margin="normal" value={title} onChange={e => setTitle(e.target.value)} />
        <TextField label="Opis" fullWidth margin="normal" value={description} onChange={e => setDescription(e.target.value)} />
        <Button variant="contained" onClick={handleAdd} fullWidth sx={{ mt: 2 }}>Dodaj</Button>
      </Box>
    </Modal>
  );
};

export default AddTaskModal;
