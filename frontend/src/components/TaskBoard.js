import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TaskCard from './TaskCard';
import api from '../services/api';
import socket from '../services/socket';

const statuses = ['To Do','In Progress','Done'];

const TaskBoard = ({ project, currentUser }) => {
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    const data = await api.getTasks(project._id);
    setTasks(data);
  };

  useEffect(() => {
    load();
    socket.emit('joinProject', project._id);

    socket.on('task:created', load);
    socket.on('task:updated', load);
    socket.on('task:deleted', load);

    socket.on('invitation:sent', load);  // może odświeżyć zaproszenia
    socket.on('member:added', load);      // albo odświeżyć listę członków

    return () => {
      socket.emit('leaveProject', project._id);
      socket.off('task:created', load);
      socket.off('task:updated', load);
      socket.off('task:deleted', load);
      socket.off('invitation:sent', load);
      socket.off('member:added', load);
    };
  }, [project]);

  return (
    <Grid container spacing={2}>
      {statuses.map(status=>(
        <Grid item xs={4} key={status}>
          <Paper sx={{p:1, minHeight:400}}>
            <Typography variant="h6" gutterBottom>{status}</Typography>
            <Box>
              {tasks.filter(t=>t.status===status).map(t=>(
                <TaskCard
                  key={t._id}
                  task={t}
                  project={project}
                  currentUser={currentUser}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskBoard;