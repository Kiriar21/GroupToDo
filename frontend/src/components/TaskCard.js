import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditTaskModal from './EditTaskModal';
import api from '../services/api';
import socket from '../services/socket';

const TaskCard = ({ task, project, currentUser, isOwner, members }) => {
  const [openEdit, setOpenEdit] = useState(false);

  const isAssignedToCurrentUser =
    (task.assignee?._id || task.assignee) === (currentUser?.id || currentUser?._id);

  const handleDelete = async () => {
    await api.deleteTask(project._id, task._id);
    socket.emit('task:delete', { id: task._id, projectId: project._id });
  };

  const getBorderColor = (status, isMine) => {
    switch (status) {
      case 'To Do':
        return isMine ? '#FFD700' : '#FFFACD'; 
      case 'In Progress':
        return isMine ? '#FFA500' : '#FFE4B5'; 
      case 'Done':
        return isMine ? '#32CD32' : '#90ee90'; 
      default:
        return '#e0e0e0';
    }
  };

  const getBoxShadow = (status, isMine) => {
    if (!isMine) return undefined;
    switch (status) {
      case 'To Do':
        return '0 0 8px #FFD70066';
      case 'In Progress':
        return '0 0 8px #FFA50066';
      case 'Done':
        return '0 0 8px #90ee90';
      default:
        return undefined;
    }
  };

  return (
    <>
      <Card
        sx={{
          mb: 1,
          border: `2px solid ${getBorderColor(task.status, isAssignedToCurrentUser)}`,
          boxShadow: getBoxShadow(task.status, isAssignedToCurrentUser),
          borderRadius: 2,
          transition: 'border 0.2s'
        }}
      >
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => setOpenEdit(true)}>
            <Typography variant="subtitle1">{task.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Opis: {task.description || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Autor: {task.author?.nickname || task.author}
              <br />
              Przypisany: {task.assignee?.nickname || (members.find(m => m._id === task.assignee)?.nickname) || 'Brak'}
            </Typography>
          </Box>
          <Box>
            {isOwner ? <IconButton size="small" onClick={handleDelete}><DeleteIcon fontSize="small"/></IconButton> : null}
            <IconButton size="small" onClick={() => setOpenEdit(true)}><EditIcon fontSize="small"/></IconButton>
          </Box>
        </CardContent>
      </Card>
      <EditTaskModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        project={project}
        members={members}
        task={task}
        isOwner={isOwner}
      />
    </>
  );
};

export default TaskCard;