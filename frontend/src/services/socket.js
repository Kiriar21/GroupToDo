import { io } from 'socket.io-client';
import { getToken } from '../context/AuthContext';

const socket = io(process.env.REACT_APP_WS_URL, {
  autoConnect: false,
  auth: () => ({ token: getToken() }),
});

socket.on('connect_error', (err) => {
  console.error('Socket connect error:', err);
});
socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

export default socket;
