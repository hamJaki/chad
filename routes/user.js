const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('Register request received:', username); // Лог для диагностики
    try {
        let user = await User.findOne({ username });
        if (user) {
            console.log('User already exists:', username); // Лог для диагностики
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ username, password });
        await user.save();
        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            console.log('User registered and token generated:', username); // Лог для диагностики
            res.json({ token });
        });
    } catch (err) {
        console.error('Server error during registration:', err.message); // Лог для диагностики
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request received:', username); // Лог для диагностики
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('Invalid credentials:', username); // Лог для диагностики
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid credentials:', username); // Лог для диагностики
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            console.log('User logged in and token generated:', username); // Лог для диагностики
            res.json({ token });
        });
    } catch (err) {
        console.error('Server error during login:', err.message); // Лог для диагностики
        res.status(500).send('Server error');
    }
});

module.exports = router;