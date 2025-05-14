module.exports = (io, sessionMiddleware) => {
  const onlineUsers = new Set();

  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', (socket) => {
    const session = socket.request.session;
    if (!session || !session.userId) {
      return socket.disconnect(true);
    }

    const userId = session.userId.toString();
    
    onlineUsers.add(userId);
    io.emit('user:online', Array.from(onlineUsers));

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:online', Array.from(onlineUsers));
    });

    const Project = require('./models/Project');
    Project.find({ members: userId }).then(projects => {
      projects.forEach(p => socket.join(`project_${p._id}`));
    });

    socket.join(`user_${userId}`);
  });
};
