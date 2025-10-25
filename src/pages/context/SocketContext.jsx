import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Use environment variable with fallback
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server via WebSocket');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      newSocket.on('articleViewed', (data) => {
        if (user.role === 'teacher') {
          toast.success(`New article view recorded!`);
        }
      });

      newSocket.on('studentProgress', (data) => {
        if (user.role === 'teacher') {
          console.log('Student progress update:', data);
        }
      });

      newSocket.on('highlightAdded', (data) => {
        if (user.role === 'teacher') {
          console.log('Student added highlight:', data);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user, token]);

  const emitReadingProgress = (articleId, progress) => {
    if (socket && user?.role === 'student') {
      socket.emit('readingProgress', {
        articleId,
        progress,
        studentId: user._id
      });
    }
  };

  const emitNewHighlight = (articleId, highlight) => {
    if (socket && user?.role === 'student') {
      socket.emit('newHighlight', {
        articleId,
        highlight,
        studentId: user._id
      });
    }
  };

  const value = {
    socket,
    emitReadingProgress,
    emitNewHighlight
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};