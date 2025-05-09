import React from 'react';
import { List, ListItem, Button, Box, Typography } from '@mui/material';
import api from '../services/api';

const InvitationsList = ({ invitations, refresh, refreshProjects }) => {
  const handleAccept = async invId => {
    await api.acceptInvitation(invId);
    refresh();
    refreshProjects();
  };
  const handleDecline = async invId => {
    await api.declineInvitation(invId);
    refresh();
  };

  return (
    <List>
      {invitations.map(inv => (
        <ListItem key={inv._id}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Typography>{inv.projectName}</Typography>
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

export default InvitationsList;
