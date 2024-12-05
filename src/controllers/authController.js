const express = require('express');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// User Login
const user_login = async (req, res, next) => {
    const data = req.body;
    try {
        // Validate the presence of email and password
        if (!(data.email && data.password)) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        // Check if user exists in the database
        const user = await User.findOne({ email: data.email }).select('+password'); // Explicitly include the password field
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        console.log(user);
        
        // Compare the password provided by the user with the hashed password in DB
        if (!data.password || !user.password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        console.log(data.password, user.password);
        
        const isMatch = await bcrypt.compare(data.password, user.password); // Compare the password with bcrypt
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // Set JWT token in an HTTP-only cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
};


// User Logout
const user_logout = async (req, res) => {
    try {
        // Extract the token from the header
        const tokenHeader = req.headers.cookie; // Assuming the key is 'jwt'
        if (!tokenHeader || !tokenHeader.startsWith('jwt=')) {
            return res.status(400).json({ error: 'User not logged in' });
        }

        const token = tokenHeader.split('jwt=')[1]; // Extract the actual token
        if (!token) {
            return res.status(400).json({ error: 'Token not found' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Ensure the user exists in the database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ error: 'User not logged in' });
        }

        // Clear the token from the client-side
        res.setHeader('jwt', ''); // Clear the header token for the client
        return res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// User Signup
const user_signup = async (req, res, next) => {
    const data = req.body;
    try {
        if (!(data.email && data.name && data.password)) {
            return res.status(400).json({ error: "Invalid data" });
        }

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);
        const newUser = new User({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
};

// Forgot Password
const forgot_password = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Generate a password reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        // Create a reset URL
        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send email with the reset URL
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetURL}">Reset Password</a>`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
};

// Reset Password
const reset_password = async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Verify the reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    user_login,
    user_logout,
    user_signup,
    forgot_password,
    reset_password,
};
