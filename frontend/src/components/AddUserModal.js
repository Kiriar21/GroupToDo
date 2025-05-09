import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert } from '@mui/material';
import api from '../services/api';

const AddUserModal = ({ open, onClose, project, refreshInvitations }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async () => {
    setError('');
    try {
      await api.inviteUser(project._id, nickname);
      setSuccess('Zaproszenie wysłane pomyślnie');
      setNickname('');
      refreshInvitations();
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd zaproszenia');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 300, mx: 'auto', mt: '15%', p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">Dodaj osobę</Typography>
        {success && <Alert severity="success" sx={{ my: 1 }}>{success}</Alert>}
        {error   && <Alert severity="error"   sx={{ my: 1 }}>{error}</Alert>}
        <TextField
          label="Nickname"
          fullWidth
          margin="normal"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleInvite}>
          Zaproś
        </Button>
      </Box>
    </Modal>
  );
};

export default AddUserModal;
