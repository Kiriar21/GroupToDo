const express = require('express');
const Project = require('../models/Project');
const Invitation = require('../models/Invitation');
const { isAuthenticated, isProjectOwner } = require('../middleware/auth');
const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  const projects = await Project.find({ members: req.session.userId });
  res.json(projects);
});

router.post('/', isAuthenticated, async (req, res) => {
  const proj = await Project.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.session.userId,
    members: [req.session.userId]
  });
  res.json(proj);
});

router.get('/:projectId', isAuthenticated, async (req, res) => {
  const proj = await Project.findById(req.params.projectId).populate('owner members');
  res.json(proj);
});

router.put('/:projectId', isAuthenticated, isProjectOwner, async (req, res) => {
  const { name, isClosed } = req.body;
  if (name !== undefined) req.project.name = name;
  if (isClosed !== undefined) req.project.isClosed = isClosed;
  await req.project.save();
  req.io.to(`project_${req.project._id}`).emit('project:updated', req.project);
  res.json(req.project);
});

router.delete('/:projectId', isAuthenticated, isProjectOwner, async (req, res) => {
  await Project.findByIdAndDelete(req.params.projectId);
  req.io.to(`project_${req.params.projectId}`).emit('project:deleted', { projectId: req.params.projectId });
  res.json({ message: 'Project deleted' });
});

router.post('/:projectId/invitations', isAuthenticated, isProjectOwner, async (req, res) => {
  const { nickname } = req.body;
  const invitedUser = await require('../models/User').findOne({ nickname });
  if (!invitedUser) return res.status(404).json({ message: 'User not found' });
  const existing = await Invitation.findOne({ projectId: req.params.projectId, invitedUser: invitedUser._id });
  if (existing) return res.status(400).json({ message: 'Invitation already sent' });
  const inv = await Invitation.create({
    projectId: req.params.projectId,
    invitedUser: invitedUser._id,
    invitedBy: req.session.userId
  });
  req.io.to(`project_${req.params.projectId}`).emit('invitation:sent', inv);
  res.json(inv);
});

module.exports = router;