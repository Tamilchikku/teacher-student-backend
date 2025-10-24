const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user._id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join room for real-time updates
    socket.join(socket.userId);

    // Handle article reading progress
    socket.on('readingProgress', (data) => {
      // Broadcast to teacher if available
      socket.broadcast.emit('studentProgress', {
        studentId: socket.userId,
        ...data
      });
    });

    // Handle real-time highlights
    socket.on('newHighlight', (data) => {
      socket.broadcast.emit('highlightAdded', {
        studentId: socket.userId,
        ...data
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

module.exports = socketHandler;