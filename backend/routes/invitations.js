const express = require('express');
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  const invs = await Invitation.find({ invitedUser: req.session.userId, status: 'pending' })
    .populate('projectId invitedBy', 'name nickname');
  res.json(invs);
});

router.put('/:invId/accept', isAuthenticated, async (req, res) => {
  const inv = await Invitation.findById(req.params.invId);
  if (!inv || inv.invitedUser.toString() !== req.session.userId) return res.status(404).json({ message: 'Invitation not found' });
  await Project.findByIdAndUpdate(inv.projectId, { $addToSet: { members: req.session.userId } });
  req.io.to(`project_${inv.projectId}`).emit('member:added', { userId: req.session.userId });
  await inv.remove();
  res.json({ message: 'Invitation accepted' });
});

router.put('/:invId/decline', isAuthenticated, async (req, res) => {
  const inv = await Invitation.findById(req.params.invId);
  if (!inv || inv.invitedUser.toString() !== req.session.userId) return res.status(404).json({ message: 'Invitation not found' });
  await inv.remove();
  res.json({ message: 'Invitation declined' });
});

module.exports = router;