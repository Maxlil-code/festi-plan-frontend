import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Initialize socket connection avec la configuration backend
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000', {
        transports: ['polling', 'websocket'], // Start with polling, then upgrade
        timeout: 45000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          token: token,
        },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Backend events - Available events from server
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Test the connection
        newSocket.emit('test_connection');
      });

      newSocket.on('welcome', (data) => {
        console.log('Welcome message:', data);
        // data contains: { message, socketId, timestamp, transport }
      });

      newSocket.on('connection_confirmed', (data) => {
        console.log('Connection confirmed:', data);
        // data contains: { message, timestamp, socketId, transport }
      });

      newSocket.on('room_joined', (data) => {
        console.log('Joined room:', data);
        // data contains: { room, message }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Online users management (if implemented on backend)
      newSocket.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user:online', (user) => {
        setOnlineUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
      });

      newSocket.on('user:offline', (userId) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== userId));
      });

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    } else {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
    }
  }, [isAuthenticated, token, user]);

  // Utility methods for common socket operations
  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave_room', roomId);
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit('send_message', { roomId, message });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
