import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import api from '../services/api';
import socket from '../services/socket';
import TaskCard from './TaskCard';

const statuses = ['To Do', 'In Progress', 'Done'];

const TaskBoard = ({ project, currentUser }) => {
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    const data = await api.getTasks(project._id);
    setTasks(data);
  };

  useEffect(() => {
    load();
    socket.on('task:created', load);
    socket.on('task:updated', load);
    socket.on('task:deleted', load);
    return () => {
      socket.off('task:created', load);
      socket.off('task:updated', load);
      socket.off('task:deleted', load);
    };
  }, [project]);

  return (
    <Grid container spacing={2}>
      {statuses.map(status => (
        <Grid item xs={4} key={status}>
          <Paper sx={{ p: 1, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>{status}</Typography>
            <Box>
              {tasks
                .filter(t => t.status === status)
                .map(t => (
                  <TaskCard
                    key={t._id}
                    task={t}
                    project={project}
                    members={project.members}
                    currentUser={currentUser}
                  />
                ))
              }
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskBoard;
