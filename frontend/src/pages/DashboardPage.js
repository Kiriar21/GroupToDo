

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';
import api from '../services/api';
import {
  Container, Grid, Box, Typography, Button,
  IconButton, Alert
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
    
    loadProjects();
    loadInvitations();

    
    const handleProjectCreated = proj => {
      setProjects(prev =>
        prev.some(p => p._id === proj._id) ? prev : [...prev, proj]
      );
    };
    const handleProjectDeleted = () => loadProjects();
    const handleProjectUpdated = () => loadProjects();
    const handleInvitationSent = () => loadInvitations();
    const handleMemberAdded = ({ userId }) => {
      
      if (user.id === userId) {
        loadProjects();
      }
    };

    socket.on('project:created', handleProjectCreated);
    socket.on('project:deleted', handleProjectDeleted);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('invitation:sent', handleInvitationSent);
    socket.on('member:added', handleMemberAdded);

    return () => {
      socket.off('project:created', handleProjectCreated);
      socket.off('project:deleted', handleProjectDeleted);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('invitation:sent', handleInvitationSent);
      socket.off('member:added', handleMemberAdded);
    };
  }, [loadProjects, loadInvitations, user.id]);

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle1">Zalogowany:</Typography>
            <Typography variant="h6">{user.nickname}</Typography>
          </Box>

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

          <Typography variant="h6" sx={{ mt: 2 }}>Zaproszenia</Typography>
          <InvitationsModal invitations={invitations} />

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
          {selectedProject ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                    onClick={async () => {
                      if (window.confirm('Usuń?')) {
                        await api.deleteProject(selectedProject._id);
                        socket.emit('project:delete', { projectId: selectedProject._id });
                      }
                    }}
                  >
                    Zamknij
                  </Button>
                </Box>
              </Box>

              <TaskBoard project={selectedProject} currentUser={user} />

              <ParticipantList
                project={selectedProject}
                onMembersChange={members =>
                  setSelectedProject(prev => ({ ...prev, members }))
                }
              />

              <Button
                variant="contained"
                onClick={() => setShowAddUser(true)}
                sx={{ mt: 2 }}
              >
                Dodaj osobę
              </Button>
            </>
          ) : (
            <Typography>Brak projektów</Typography>
          )}
        </Grid>
      </Grid>

      <AddProjectModal open={showAddProject} onClose={() => setShowAddProject(false)} />
      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        project={selectedProject}
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
