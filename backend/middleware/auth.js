const Project = require('../models/Project');

exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: 'Unauthorized' });
};

exports.isProjectOwner = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.owner.equals(req.session.userId)) {
      return res.status(403).json({ message: 'Forbidden: Not project owner' });
    }
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};