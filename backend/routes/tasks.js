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
  if (!isOwner && !isProjOwner) return res.status(403).json({ message: 'Forbidden' });

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

  req.io.to(`project_${task.projectId}`).emit('task:updated', task);
  res.json(task);
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

module.exports = router;