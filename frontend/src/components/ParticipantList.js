import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, Typography } from '@mui/material';
import socket from '../services/socket';

const ParticipantList = ({ project, onMembersChange }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.connect();
    socket.emit('request:online');

    socket.on('user:online', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('user:online');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleNewMember = ({ userId, nickname }) => {
      onMembersChange(prev => [
        ...prev,
        { _id: userId, nickname }
      ]);
    };
    socket.on('member:added', handleNewMember);
    return () => {
      socket.off('member:added', handleNewMember);
    };
  }, [onMembersChange]);

  if (!project || !Array.isArray(project.members)) {
    return (
      <Box>
        <Typography variant="subtitle1">Uczestnicy</Typography>
        <Typography>Ładowanie…</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1">Uczestnicy</Typography>
      <List>
        {project.members.length > 0 ? project.members.map((m) => {
          const memberId = m._id != null ? String(m._id) : null;
          return (
            <ListItem key={memberId || Math.random()}>
              <Typography>{m.nickname || '—'}</Typography>

              {project.owner?._id === m._id && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  (owner)
                </Typography>
              )}

              {memberId && onlineUsers.includes(memberId) && (
                <Typography variant="caption" sx={{ color: 'green', ml: 1 }}>
                  online
                </Typography>
              )}
            </ListItem>
          );
        }) : (
          <ListItem>
            <Typography>Brak uczestników do wyświetlenia.</Typography>
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default ParticipantList;
