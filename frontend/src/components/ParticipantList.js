import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, Typography } from '@mui/material';
import socket from '../services/socket';

const ParticipantList = ({ project, onMembersChange }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on('user:online', (users) => setOnlineUsers(users));
    return () => socket.off('user:online');
  }, []);


  useEffect(() => {
    const handleNew = ({ userId, nickname }) => {
      onMembersChange(prev => [...prev, { _id: userId, nickname }]);
    };
    socket.on('member:added', handleNew);
    return () => socket.off('member:added', handleNew);
  }, [onMembersChange]);

  return (
    <Box>
      <Typography variant="subtitle1">Uczestnicy</Typography>
      <List>
        {project.members.map((m) => (
          <ListItem key={m._id}>
            <Typography>{m.nickname}</Typography>
            {project.owner._id === m._id && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                (owner)
              </Typography>
            )}
            {onlineUsers.includes(m._id) && (
              <Typography variant="caption" sx={{ color: 'green', ml: 1 }}>
                online
              </Typography>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ParticipantList;
