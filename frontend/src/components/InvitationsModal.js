import React, { useState } from 'react';
import { List, ListItem, Button, Box, Typography, Alert } from '@mui/material';
import api from '../services/api';
import socket from '../services/socket';

const InvitationsModal = ({ invitations, reload }) => {
  const [message, setMessage] = useState('');

  const handleAccept = async id => {
    setMessage('');
    try {
      await api.acceptInvitation(id);
      socket.emit('invitation:accept', { invId: id });
      reload && reload(); 
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Błąd akceptowania zaproszenia';
      setMessage(msg);
      reload && reload();
    }
  };

  const handleDecline = async id => {
    setMessage('');
    try {
      await api.declineInvitation(id);
      socket.emit('invitation:decline', { invId: id });
      reload && reload();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Błąd odrzucania zaproszenia';
      setMessage(msg);
      reload && reload();
    }
  };

  return (
    <Box>
      {message && (
        <Alert
          severity={message.includes('Projekt nie istnieje') ? 'info' : 'error'}
          sx={{ mb: 1 }}
        >
          {message}
        </Alert>
      )}
      <List>
        {invitations.map(inv => (
          <ListItem key={inv._id}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="subtitle1">{inv.projectId.name}</Typography>
              <Typography variant="caption">
                Zaproszony przez: {inv.invitedBy.nickname}
              </Typography>
              <Box>
                <Button size="small" onClick={() => handleAccept(inv._id)}>
                  Akceptuj
                </Button>
                <Button size="small" onClick={() => handleDecline(inv._id)}>
                  Odrzuć
                </Button>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InvitationsModal;
