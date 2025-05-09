import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  withCredentials: true,
});

socket.on('connect_error', err => {
  console.error('Socket connect error:', err);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

export default socket;
