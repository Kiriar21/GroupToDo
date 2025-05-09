import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Box, Typography, Button, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';

import ProjectList from '../components/ProjectList';
import AddProjectModal from '../components/AddProjectModal';
import InvitationsModal from '../components/InvitationsModal';
import TaskBoard from '../components/TaskBoard';
import AddTaskModal from '../components/AddTaskModal';
import ParticipantList from '../components/ParticipantList';
import AddUserModal from '../components/AddUserModal';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects]       = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask]       = useState(false);
  const [showAddUser, setShowAddUser]       = useState(false);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (!selectedProject && data.length) setSelectedProject(data[0]);
      else {
        const updated = data.find(p => p._id === selectedProject?._id);
        setSelectedProject(updated || null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadInvitations = async () => {
    try {
      const data = await api.getInvitations();
      setInvitations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadTasks = async projectId => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await api.getTasks(projectId);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadInvitations();
  }, []);

  useEffect(() => {
    loadTasks(selectedProject?._id);
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    socket.emit('joinProject', selectedProject._id);
    return () => socket.emit('leaveProject', selectedProject._id);
  }, [selectedProject]);

  useEffect(() => {
    socket.on('task:created', task => {
      if (task.projectId === selectedProject?._id) {
        setTasks(prev => [...prev, task]);
      }
    });
    socket.on('task:updated', updated => {
      if (updated.projectId === selectedProject?._id) {
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      }
    });
    socket.on('task:deleted', ({ id, projectId }) => {
      if (projectId === selectedProject?._id) {
        setTasks(prev => prev.filter(t => t._id !== id));
      }
    });
    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, [selectedProject]);

  const handleDeleteProject = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć ten projekt?')) {
      await api.deleteProject(selectedProject._id);
      loadProjects();
      setSelectedProject(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={3}>
          {user && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1">Zalogowany jako:</Typography>
              <Typography variant="h6">{user.nickname}</Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Projekty</Typography>
            <IconButton onClick={() => setShowAddProject(true)}><AddIcon /></IconButton>
          </Box>
          <ProjectList
            projects={projects}
            selected={selectedProject}
            onSelect={setSelectedProject}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>Zaproszenia</Typography>
          <InvitationsModal
            invitations={invitations}
            refreshInvitations={loadInvitations}
            refreshProjects={loadProjects}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={logout}
            sx={{ mt: 4 }}
          >
            Wyloguj
          </Button>
        </Grid>

        <Grid item xs={9}>
          {loading ? (
            <CircularProgress />
          ) : selectedProject ? (
            <>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h5">{selectedProject.name}</Typography>
                <Box>
                  <Button
                    variant="contained"
                    onClick={() => setShowAddTask(true)}
                    sx={{ mr: 1 }}
                  >
                    Dodaj zadanie
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteProject}
                  >
                    Zamknij projekt
                  </Button>
                </Box>
              </Box>
              <TaskBoard tasks={tasks} project={selectedProject} currentUser={user} />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <ParticipantList project={selectedProject} />
                <Button variant="contained" onClick={() => setShowAddUser(true)}>
                  Dodaj osobę
                </Button>
              </Box>
            </>
          ) : (
            <Typography>Brak projektów</Typography>
          )}
        </Grid>
      </Grid>

      <AddProjectModal
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        refresh={loadProjects}
      />
      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        project={selectedProject}
      />
      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        project={selectedProject}
        refreshInvitations={loadInvitations}
      />
    </Container>
  );
};

export default DashboardPage;