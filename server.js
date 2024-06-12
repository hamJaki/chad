const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const userRouter = require('./routes/user');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

connectDB();

app.use(express.json());
app.use(express.static('public'));
app.use('/api/users', userRouter);

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.userId = decoded.user.id;
        next();
    });
});

io.on('connection', async socket => {
    console.log('New WebSocket connection');

    const user = await User.findById(socket.userId);
    if (!user) {
        return socket.disconnect();
    }

    socket.username = user.username;

    // Load last 10 messages from database
    const messages = await Message.find().sort({ _id: -1 }).limit(10).exec();
    messages.reverse(); // To show the latest messages last
    socket.emit('loadMessages', messages);

    socket.on('sendMessage', async message => {
        const time = new Date().toLocaleTimeString();
        const newMessage = new Message({ username: socket.username, message, time });
        await newMessage.save();
        io.emit('message', { username: socket.username, message, time });
    });

    socket.on('disconnect', () => {
        console.log('User has left');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));