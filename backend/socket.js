module.exports = (io, sessionMiddleware) => {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', (socket) => {
    const session = socket.request.session;
    if (!session || !session.userId) {
      return socket.disconnect(true);
    }
    const userId = session.userId;

    const Project = require('./models/Project');
    Project.find({ members: userId }).then(projects => {
      projects.forEach(p => socket.join(`project_${p._id}`));
    });

    socket.on('disconnect', () => {
      
    });
  });
};