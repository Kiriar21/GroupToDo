const { verify } = require('../utils/jwt');
const Project = require('../models/Project');

exports.isAuthenticated = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const payload = verify(auth.split(' ')[1]);
  if (!payload) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
  req.userId = payload.userId;
  next();
};

exports.isProjectOwner = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.owner.equals(req.userId)) {
      return res.status(403).json({ message: 'Forbidden: Not project owner' });
    }
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};
