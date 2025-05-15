import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import api from '../services/api';
import socket from '../services/socket';

const AddTaskModal = ({ open, onClose, project, members }) => {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee]     = useState('');
  const [loading, setLoading]       = useState(false);
  const memberList = Array.isArray(members) ? members : [];

  const handleAdd = async () => {
    setLoading(true);
    const newTask = await api.createTask(project._id, title, description, assignee);
    socket.emit('task:create', newTask);
    onClose();
    setTitle('');
    setDescription('');
    setAssignee('');
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 300, mx: 'auto', mt: '15%', p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">Nowe zadanie</Typography>
        <TextField
          label="Tytuł"
          fullWidth margin="normal"
          value={title} onChange={e => setTitle(e.target.value)}
        />
        <TextField
          label="Opis"
          fullWidth margin="normal"
          value={description} onChange={e => setDescription(e.target.value)}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Przypisz do</InputLabel>
          <Select
            value={assignee}
            label="Przypisz do"
            onChange={e => setAssignee(e.target.value)}
          >
            <MenuItem value="">Brak</MenuItem>
              {memberList.map(m => (
                <MenuItem value={m._id} key={m._id}>{m.nickname}</MenuItem>
              ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleAdd}
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20}/> : 'Dodaj'}
        </Button>
      </Box>
    </Modal>
  );
};

export default AddTaskModal;
