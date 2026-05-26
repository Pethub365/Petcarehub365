/**
 * Chat Socket Handler for PetcareHub365
 * Handles real-time chat between users, vets, and store owners
 */
const chatSocket = (io) => {
    const onlineUsers = new Map(); // userId -> socketId

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // User joins with their userId
        socket.on('join', (userId) => {
            if (userId) {
                onlineUsers.set(userId, socket.id);
                socket.userId = userId;
                console.log(`User ${userId} joined. Online: ${onlineUsers.size}`);
            }
        });

        // Join a specific chat room (session)
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room: ${roomId}`);
        });

        // Send message to a room
        socket.on('sendMessage', (data) => {
            const { roomId, message } = data;
            if (roomId) {
                io.to(roomId).emit('newMessage', message);
            }
        });

        // Typing indicator
        socket.on('typing', ({ roomId, userId }) => {
            socket.to(roomId).emit('userTyping', { userId });
        });

        socket.on('stopTyping', ({ roomId, userId }) => {
            socket.to(roomId).emit('userStopTyping', { userId });
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                console.log(`User ${socket.userId} disconnected. Online: ${onlineUsers.size}`);
            }
        });
    });
};

module.exports = chatSocket;
