import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditTaskModal from './EditTaskModal';
import api from '../services/api';
import socket from '../services/socket';

const TaskCard = ({ task, project, currentUser, isOwner, members }) => {
  const [openEdit, setOpenEdit] = useState(false);

  const handleDelete = async () => {
    await api.deleteTask(project._id, task._id);
    socket.emit('task:delete', { id: task._id, projectId: project._id });
  };

  return (
    <>
      <Card sx={{ mb: 1 }}>
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