const express = require('express');
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  const invs = await Invitation.find({
    invitedUser: req.userId,
    status: 'pending'
  })
  .populate('projectId', 'name')
  .populate('invitedBy', 'nickname');
  
  res.json(invs);
});


router.put('/:invId/accept', isAuthenticated, async (req, res, next) => {
  try {
    const inv = await Invitation.findById(req.params.invId);
    if (!inv || inv.invitedUser.toString() !== req.userId) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const project = await Project.findById(inv.projectId);
    if (!project) {
      await Invitation.findByIdAndDelete(inv._id);
      req.io.to(`user_${req.userId}`).emit('invitation:removed', { invId: inv._id });
      return res.status(410).json({ message: 'Projekt nie istnieje – zaproszenie usunięte.' });
    }

    await Project.findByIdAndUpdate(inv.projectId, {
      $addToSet: { members: req.userId }
    });

    req.io.to(`project_${inv.projectId}`).emit('member:added', { userId: req.userId });

    await Invitation.findByIdAndUpdate(inv._id, { status: 'accepted' });
    await Invitation.deleteOne({ _id: inv._id });

    req.io.to(`user_${req.userId}`).emit('invitation:removed', { invId: inv._id });

    const populatedProject = await Project.findById(inv.projectId)
      .populate('members', 'nickname')
      .populate('owner', 'nickname');

    req.io.to(`user_${req.userId}`).emit('project:created', populatedProject);

    res.json({ message: 'Invitation accepted' });
  } catch (err) {
    next(err);
  }
});


router.put('/:invId/decline', isAuthenticated, async (req, res) => {
  const inv = await Invitation.findById(req.params.invId);
  if (!inv || inv.invitedUser.toString() !== req.userId) {
    return res.status(404).json({ message: 'Invitation not found' });
  }

  const project = await Project.findById(inv.projectId);
  if (!project) {
    await Invitation.findByIdAndDelete(inv._id);
    req.io.to(`user_${req.userId}`).emit('invitation:removed', { invId: inv._id });
    return res.status(410).json({ message: 'Projekt nie istnieje – zaproszenie usunięte.' });
  }

  await Invitation.findByIdAndDelete(req.params.invId);
  req.io.to(`user_${req.userId}`).emit('invitation:removed', { invId: inv._id });
  res.json({ message: 'Invitation declined' });
});



module.exports = router;