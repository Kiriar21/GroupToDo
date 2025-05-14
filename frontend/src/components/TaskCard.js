import React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import socket from '../services/socket';

const TaskCard = ({ task, project, currentUser, isOwner }) => {
  const handleDelete = async () => {
    await api.deleteTask(project._id, task._id);
    socket.emit('task:delete', { id: task._id, projectId: project._id });
  };

  return (
    <Card sx={{ mb:1 }}>
      <CardContent sx={{ display:'flex', justifyContent:'space-between' }}>
        <Typography>{task.title}</Typography>
        {isOwner && (
          <IconButton size="small" onClick={handleDelete}>
            <DeleteIcon fontSize="small"/>
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
