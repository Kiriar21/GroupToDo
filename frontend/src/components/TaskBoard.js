import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TaskCard from './TaskCard';
import api from '../services/api';
import socket from '../services/socket';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

  // Drag and drop obsługa
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    // Zmieniamy status zadania na nowy
    const updatedTask = {
      ...task,
      status: destination.droppableId
    };

    // Update na backendzie
    await api.updateTask(project._id, task._id, { status: destination.droppableId });
    socket.emit('task:updated', updatedTask);
    load(); // reload tasks
  };

  // Pogrupowanie po statusie
  const tasksByStatus = {
    'To Do': [],
    'In Progress': [],
    'Done': []
  };
  tasks.forEach(t => tasksByStatus[t.status].push(t));

  return (
    <Box sx={{ width: '100%', minWidth: 900, maxWidth: '100%', mx: 'auto' }}>
      <DragDropContext onDragEnd={onDragEnd}>
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
                minWidth: 0,
              }}
            >
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
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
                      {tasksByStatus[status].length === 0 ? (
                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                          Brak zadań
                        </Typography>
                      ) : (
                        tasksByStatus[status].map((t, idx) => (
                          <Draggable draggableId={t._id} index={idx} key={t._id}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={t}
                                  project={project}
                                  currentUser={currentUser}
                                  isOwner={isOwner}
                                  members={project.members || []}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </Box>
                  </Paper>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  );
};

export default TaskBoard;
