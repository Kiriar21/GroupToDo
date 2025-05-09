import React from 'react';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const ProjectList = ({ projects, onSelect, selected }) => (
  <List>
    {projects.map(p => (
      <ListItem key={p._id} disablePadding>
        <ListItemButton selected={selected?._id === p._id} onClick={() => onSelect(p)}>
          <ListItemText primary={p.name} />
        </ListItemButton>
      </ListItem>
    ))}
  </List>
);

export default ProjectList;
