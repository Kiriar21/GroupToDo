const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router({ mergeParams: true });

router.get('/', isAuthenticated, async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.projectId });
  res.json(tasks);
});

router.post('/', isAuthenticated, async (req, res) => {
  const task = await Task.create({
    projectId: req.params.projectId,
    title: req.body.title,
    description: req.body.description,
    author: req.userId
  });
  req.io.to(`project_${req.params.projectId}`).emit('task:created', task);
  res.json(task);
});

router.put('/:taskId', isAuthenticated, async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const isOwner = task.author.equals(req.userId);
  const project = await Project.findById(task.projectId);
  const isProjOwner = project.owner.equals(req.userId);

  // Każdy członek projektu może zmienić status,
  // tylko owner/autor może edytować inne pola!
  if (!isOwner && !isProjOwner) {
    // tylko status
    if (typeof req.body.status === 'string' && ['To Do', 'In Progress', 'Done'].includes(req.body.status)) {
      task.status = req.body.status;
      if (req.body.status === 'In Progress') task.assignee = req.userId;
      task.updatedAt = Date.now();
      await task.save();
      // Populate po save
      const populatedTask = await Task.findById(task._id)
        .populate('author', 'nickname')
        .populate('assignee', 'nickname');
      req.io.to(`project_${task.projectId}`).emit('task:updated', populatedTask);
      return res.json(populatedTask);
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  // Owner lub autor: pełna edycja
  const { status, assignee, title, description } = req.body;
  if (status && status !== task.status) {
    task.status = status;
    if (status === 'In Progress') task.assignee = req.userId;
  }
  if (assignee && isProjOwner) task.assignee = assignee;
  if (title) task.title = title;
  if (description) task.description = description;
  task.updatedAt = Date.now();
  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('author', 'nickname')
    .populate('assignee', 'nickname');
  req.io.to(`project_${task.projectId}`).emit('task:updated', populatedTask);
  res.json(populatedTask);
});

router.delete('/:taskId', isAuthenticated, async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const isOwner = task.author.equals(req.userId);
  const project = await Project.findById(task.projectId);
  const isProjOwner = project.owner.equals(req.userId);
  if (!isOwner && !isProjOwner) return res.status(403).json({ message: 'Forbidden' });

  await task.remove();
  req.io.to(`project_${task.projectId}`).emit('task:deleted', { taskId: req.params.taskId });
  res.json({ message: 'Task deleted' });
});

router.put('/:taskId/assign', isAuthenticated, async (req, res) => {
  try {
    const { assignee } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.owner.equals(req.userId)) {
      return res.status(403).json({ message: 'Only project owner can assign tasks.' });
    }

    if (!project.members.map(id => id.toString()).includes(assignee)) {
      return res.status(400).json({ message: 'Assignee is not a project member.' });
    }

    task.assignee = assignee;
    task.updatedAt = Date.now();
    await task.save();

    await task.populate('author', 'nickname').populate('assignee', 'nickname');

    req.io.to(`project_${task.projectId}`).emit('task:updated', task);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;