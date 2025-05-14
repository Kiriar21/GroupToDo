const { verify } = require('./utils/jwt');
const Project = require('./models/Project');

module.exports = (io) => {
  const onlineUsers = new Set();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const payload = verify(token);
    if (!payload) return next(new Error('Authentication error'));
    socket.userId = payload.userId;
    next();
  });

  io.on('connection', (socket) => {
    const uid = socket.userId;
    onlineUsers.add(uid);

    io.emit('user:online', Array.from(onlineUsers));

    Project.find({ members: uid }).then(projects => {
      projects.forEach(p => socket.join(`project_${p._id}`));
    });

    socket.join(`user_${uid}`);

    socket.on('disconnect', () => {
      onlineUsers.delete(uid);
      io.emit('user:online', Array.from(onlineUsers));
    });
  });
};
