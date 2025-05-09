import React, { useState } from 'react';
import {
  Card, CardContent, Typography, IconButton, Box, MenuItem, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const TaskCard = ({ task, project, members, currentUser }) => {
  const [assignTo, setAssignTo] = useState(task.assignee || '');
  const isOwner = currentUser._id === project.owner;

  const author = members.find(m => m._id === task.author);
  const assignee = members.find(m => m._id === task.assignee);

  const handleDelete = () => {
    api.deleteTask(project._id, task._id);
  };

  const handleAssign = async e => {
    const newAssignee = e.target.value;
    setAssignTo(newAssignee);
    await api.updateTask(project._id, task._id, {
      status: 'In Progress',
      assignee: newAssignee,
    });
  };

  const handleChangeAssignee = async e => {
    const newAssignee = e.target.value;
    setAssignTo(newAssignee);
    await api.updateTask(project._id, task._id, { assignee: newAssignee });
  };

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">{task.title}</Typography>
          <IconButton size="small" onClick={handleDelete}><DeleteIcon fontSize="small" /></IconButton>
        </Box>

        <Typography variant="body2">Autor: {author?.nickname || '—'}</Typography>

        {task.status === 'To Do' && (
          <Select
            displayEmpty
            value={assignTo}
            onChange={handleAssign}
            fullWidth
            sx={{ mt: 1 }}
          >
            <MenuItem value="" disabled>Przypisz do...</MenuItem>
            {members.map(m => (
              <MenuItem key={m._id} value={m._id}>{m.nickname}</MenuItem>
            ))}
          </Select>
        )}

        {task.status === 'In Progress' && (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Przypisany: {assignee?.nickname || '—'}
            </Typography>
            {isOwner && (
              <Select
                displayEmpty
                value={assignTo}
                onChange={handleChangeAssignee}
                fullWidth
                sx={{ mt: 1 }}
              >
                <MenuItem value="" disabled>Zmień wykonawcę...</MenuItem>
                {members.map(m => (
                  <MenuItem key={m._id} value={m._id}>{m.nickname}</MenuItem>
                ))}
              </Select>
            )}
          </>
        )}

        {task.status === 'Done' && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Wykonał: {assignee?.nickname || '—'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
