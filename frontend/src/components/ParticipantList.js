import React from 'react';
import { Box, List, ListItem, Typography } from '@mui/material';

const ParticipantList = ({ project }) => (
  <Box>
    <Typography variant="subtitle1">Uczestnicy</Typography>
    <List>
      {project.members.map(m => (
        <ListItem key={m._id}>{m.nickname}</ListItem>
      ))}
    </List>
  </Box>
);

export default ParticipantList;
