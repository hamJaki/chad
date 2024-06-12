const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://shagdarhamza1:pn4vrM6DetQhyhl4@ac-9iiteqm.oeoglct.mongodb.net/chat-app?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message); // Лог для диагностики
        process.exit(1);
    }
};

module.exports = { connectDB };