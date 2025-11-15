import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || process.env.REACT_APP_BACKEND_URL || '';

/**
 * PUBLIC_INTERFACE
 * initSocket
 * Initializes a socket.io client with basic error handling.
 */
export function initSocket(authToken) {
  if (!WS_URL) {
    // Return a mock that won't crash when backend is unavailable
    return {
      on: () => {},
      emit: () => {},
      disconnect: () => {},
    };
  }
  try {
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: authToken ? { token: authToken } : undefined,
    });
    socket.on('connect_error', () => {
      // swallow errors to keep UI functional
    });
    return socket;
  } catch {
    return {
      on: () => {},
      emit: () => {},
      disconnect: () => {},
    };
  }
}
