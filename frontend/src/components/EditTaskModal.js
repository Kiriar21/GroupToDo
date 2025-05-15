import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import api from '../services/api';
import socket from '../services/socket';

const statuses = ['To Do', 'In Progress', 'Done'];

const EditTaskModal = ({ open, onClose, project, members, task, isOwner, currentUser }) => {
  const [title, setTitle]           = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [assignee, setAssignee]     = useState(task.assignee?._id || task.assignee || '');
  const [status, setStatus]         = useState(task.status || 'To Do');
  const [loading, setLoading]       = useState(false);


  const handleSave = async () => {
    setLoading(true);

    // Tworzymy payload tylko z dozwolonymi polami!
    let data = {};
    if (isOwner) {
      data = { title, description, status, assignee };
    } else {
      data = { status };
    }
    await api.updateTask(project._id, task._id, data);
    socket.emit('task:update', { taskId: task._id, ...data });
    onClose();
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 300, mx: 'auto', mt: '10%', p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">Edytuj zadanie</Typography>
        <TextField
          label="Tytuł"
          fullWidth margin="normal"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={!isOwner}
        />
        <TextField
          label="Opis"
          fullWidth margin="normal"
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={!isOwner}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={e => setStatus(e.target.value)}
          >
            {statuses.map(st => (
              <MenuItem value={st} key={st}>{st}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Przypisz do</InputLabel>
          <Select
            value={assignee || ''}
            label="Przypisz do"
            onChange={e => setAssignee(e.target.value)}
            disabled={!isOwner}
          >
            <MenuItem value="">Brak</MenuItem>
            {members.map(m => (
              <MenuItem value={m._id} key={m._id}>{m.nickname}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleSave}
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20}/> : 'Zapisz'}
        </Button>
      </Box>
    </Modal>
  );
};

export default EditTaskModal;
