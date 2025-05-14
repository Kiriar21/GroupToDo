import React from 'react';
import { List, ListItem, Button, Box, Typography } from '@mui/material';
import api from '../services/api';
import socket from '../services/socket';

const InvitationsModal = ({ invitations }) => {
  const handleAccept = async id => {
    await api.acceptInvitation(id);
    socket.emit('invitation:accept', { invId: id });
  };
  const handleDecline = async id => {
    await api.declineInvitation(id);
    socket.emit('invitation:decline', { invId: id });
  };

  return (
    <List>
      {invitations.map(inv => (
        <ListItem key={inv._id}>
          <Box sx={{ display:'flex', flexDirection:'column', width: '100%' }}>
            <Typography variant="subtitle1">{inv.projectId.name}</Typography>
            <Typography variant="caption">Zaproszony przez: {inv.invitedBy.nickname}</Typography>
            <Box>
              <Button size="small" onClick={() => handleAccept(inv._id)}>Akceptuj</Button>
              <Button size="small" onClick={() => handleDecline(inv._id)}>Odrzuć</Button>
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default InvitationsModal;