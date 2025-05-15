import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TaskCard from './TaskCard';
import api from '../services/api';
import socket from '../services/socket';

const statuses = ['To Do', 'In Progress', 'Done'];

const TaskBoard = ({ project, currentUser, isOwner }) => {
  const [tasks, setTasks] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await api.getTasks(project._id);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  }, [project._id]);

  useEffect(() => {
    load();
    socket.emit('joinProject', project._id);

    socket.on('task:created', load);
    socket.on('task:updated', load);
    socket.on('task:deleted', load);
    socket.on('invitation:sent', load);
    socket.on('member:added', load);

    return () => {
      socket.emit('leaveProject', project._id);
      socket.off('task:created', load);
      socket.off('task:updated', load);
      socket.off('task:deleted', load);
      socket.off('invitation:sent', load);
      socket.off('member:added', load);
    };
  }, [load, project._id]);

  // NAJWAŻNIEJSZE - wymuszenie szerokości na 100%
  return (
    <Box sx={{ width: '100%', minWidth: 900, maxWidth: '100%', mx: 'auto' }}>
      <Grid
        container
        spacing={2}
        sx={{
          width: '100%',
          minWidth: 900,
          maxWidth: '100%',
          alignItems: 'stretch',
        }}
      >
        {statuses.map(status => (
          <Grid
            item
            xs={12}
            md={4}
            key={status}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minWidth: 0, // ważne by nie zawężał się
            }}
          >
            <Paper
              sx={{
                p: 1,
                minHeight: 400,
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                boxSizing: 'border-box',
              }}
            >
              <Typography variant="h6" gutterBottom align="center">
                {status}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {tasks.filter(t => t.status === status).length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                    Brak zadań
                  </Typography>
                ) : (
                  tasks
                    .filter(t => t.status === status)
                    .map(t => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        project={project}
                        currentUser={currentUser}
                        isOwner={isOwner}
                        members={project.members || []}
                      />
                    ))
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TaskBoard;
