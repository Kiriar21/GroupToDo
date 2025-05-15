import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';
import api from '../services/api';
import {
  Container, Grid, Box, Typography, Button,
  IconButton, Alert, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import ProjectList      from '../components/ProjectList';
import AddProjectModal  from '../components/AddProjectModal';
import InvitationsModal from '../components/InvitationsModal';
import TaskBoard        from '../components/TaskBoard';
import AddTaskModal     from '../components/AddTaskModal';
import ParticipantList  from '../components/ParticipantList';
import AddUserModal     from '../components/AddUserModal';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects]                 = useState([]);
  const [selectedProject, setSelectedProject]   = useState(null);
  const [invitations, setInvitations]           = useState([]);
  const [showAddProject, setShowAddProject]     = useState(false);
  const [showAddTask, setShowAddTask]           = useState(false);
  const [showAddUser, setShowAddUser]           = useState(false);
  const [error, setError]                       = useState('');

  
  const loadProjects = useCallback(async () => {
    try {
      const p = await api.getProjects();
      setProjects(p);
      if (!selectedProject && p.length) {
        setSelectedProject(p[0]);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [selectedProject]);

  
  const loadInvitations = useCallback(async () => {
    try {
      const invs = await api.getInvitations();
      setInvitations(invs);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    socket.connect();
    socket.emit('request:online');
  }, []);

socket.on('connect', () => {
  socket.emit('request:online');
});

    useEffect(() => {
      projects.forEach(p => {
        socket.emit('joinProject', p._id);
      });
    }, [projects]);

  useEffect(() => {
    
    loadProjects();
    loadInvitations();

    
    const handleProjectCreated = async (proj) => {
      setProjects(prev =>
        prev.some(p => p._id === proj._id) ? prev : [...prev, proj]
      );
      if (proj.owner?.toString() === user.id || proj.owner?._id === user.id) {
        try {
          const full = await api.getProjectById(proj._id);
          setSelectedProject(full);
          setProjects(prev => prev.map(p => p._id === full._id ? full : p));
        } catch (e) {
        }
      }
    };


    const handleProjectDeleted = () => loadProjects();
    const handleProjectUpdated = () => loadProjects();
    const handleInvitationSent = () => loadInvitations();
    const handleInvitationRemoved = () => loadInvitations();
    const handleMemberAdded = async ({ userId }) => {
      if (user.id === userId) {
        await loadProjects();
      }
      if (selectedProject) {
        try {
          const full = await api.getProjectById(selectedProject._id);
          setSelectedProject(full);
        } catch (e) {}
      }
    };


    socket.on('project:created', handleProjectCreated);
    socket.on('project:deleted', handleProjectDeleted);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('invitation:sent', handleInvitationSent);
    socket.on('invitation:removed', handleInvitationRemoved);
    socket.on('member:added', handleMemberAdded);

    return () => {
      socket.off('project:created', handleProjectCreated);
      socket.off('project:deleted', handleProjectDeleted);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('invitation:sent', handleInvitationSent);
      socket.off('invitation:removed', handleInvitationRemoved);
      socket.off('member:added', handleMemberAdded);
    };
  }, [loadProjects, loadInvitations, user.id, selectedProject]);


  return (
    <Container maxWidth={false} disableGutters sx={{ minHeight: '90vh', px: 0, py: 2, bgcolor: 'background.default' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid
          container
          spacing={2}
          sx={{
            minHeight: '100vh',
            justifyContent: { xs: 'center', md: 'center' },
            alignItems: { xs: 'center', md: 'flex-start' },
            px: { xs: 1, md: 4 },
            py: { xs: 2, md: 4 }
          }}
        >
        <Grid item xs={12} md={2} sx={{ minWidth: 220, mx: { xs: 'auto', md: 0 } }}>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 4 }}>
            <Typography variant="subtitle1">Zalogowany:</Typography>
            <Typography variant="h6">{user.nickname}</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 4 }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Projekty</Typography>
              <IconButton onClick={() => setShowAddProject(true)}>
                <AddIcon />
              </IconButton>
            </Box>
            <ProjectList
              projects={projects}
              selected={selectedProject}
              onSelect={setSelectedProject}
              onProjectsChange={setProjects}
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 4 }}>
            <Typography variant="h6">Zaproszenia</Typography>
            <InvitationsModal invitations={invitations} reload={loadInvitations}/>
          </Paper>
          <Button
            variant="outlined"
            color="secondary"
            onClick={logout}
            sx={{ mt: 2, width: '100%' }}
          >
            Wyloguj
          </Button>
        </Grid>
          <Grid item xs={12} md={8} sx={{ mx: { xs: 'auto', md: 0 } }}>
          {selectedProject ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h5">{selectedProject.name}</Typography>
                  {selectedProject.owner && selectedProject.owner._id === user.id && (
                    <Button
                      variant="contained"
                      onClick={() => setShowAddTask(true)}
                      sx={{ mr: 1 }}
                    >
                      Dodaj zadanie
                    </Button>
                  )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  Opis tablicy zadań: {selectedProject.description ? selectedProject.description : 'Brak opisu'}
                </Typography>
              </Box>
              <TaskBoard
                project={selectedProject}
                currentUser={user}
                isOwner={selectedProject.owner && selectedProject.owner._id === user.id}
              />
            </>
          ) : (
            <Typography>Brak projektów</Typography>
          )}
        </Grid>
          <Grid item xs={12} md={2} sx={{ minWidth: 220, mx: { xs: 'auto', md: 0 } }}>
          {selectedProject && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <ParticipantList
                project={selectedProject}
                onMembersChange={members =>
                  setSelectedProject(prev => ({ ...prev, members }))}
              />
              {selectedProject.owner && selectedProject.owner._id === user.id && (
                <>
                  <Button
                    variant="contained"
                    onClick={() => setShowAddUser(true)}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    Dodaj osobę
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={async () => {
                      if (window.confirm('Czy na pewno chcesz zamknąć projekt?')) {
                        await api.deleteProject(selectedProject._id);
                        socket.emit('project:delete', { projectId: selectedProject._id });
                      }
                    }}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    Zamknij projekt
                  </Button>
                </>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
      <AddProjectModal open={showAddProject} onClose={() => setShowAddProject(false)} />
      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        project={selectedProject}
        members={selectedProject?.members || []}
      />
      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        project={selectedProject}
      />
    </Container>
  );
};

export default DashboardPage;
