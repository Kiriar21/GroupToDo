import React, { useEffect } from 'react';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import socket from '../services/socket';

const ProjectList = ({ projects, onSelect, selected, onProjectsChange }) => {
  useEffect(() => {
    const onCreate  = proj => onProjectsChange(prev => [...prev, proj]);
    const onUpdate  = proj => onProjectsChange(prev => prev.map(p=>p._id===proj._id?proj:p));
    const onDelete  = ({ projectId }) => onProjectsChange(prev => prev.filter(p=>p._id!==projectId));
    socket.on('project:created', onCreate);
    socket.on('project:updated', onUpdate);
    socket.on('project:deleted', onDelete);
    return () => {
      socket.off('project:created', onCreate);
      socket.off('project:updated', onUpdate);
      socket.off('project:deleted', onDelete);
    };
  }, [onProjectsChange]);

  return (
    <List>
      {projects.map(p=>(
        <ListItem key={p._id} disablePadding>
          <ListItemButton
            selected={selected?._id===p._id}
            onClick={()=>onSelect(p)}
          >
            <ListItemText primary={p.name}/>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ProjectList;