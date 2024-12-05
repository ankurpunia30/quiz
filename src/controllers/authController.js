const express=require('express');
const User=require('../models/user');
const jwt=require('jsonwebtoken');

const bcrypt=require('bcrypt');
//login


// User Login
const user_login = async (req, res, next) => {
    const data = req.body;
    try {
        // Validate the presence of email and password
        if (!(data.email && data.password)) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        // Check if user exists
        const user = await User.findOne({ email: data.email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Compare password with hashed password stored in DB
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN, // Set token expiration
        });

        // Set JWT in cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true, // Ensures cookie is not accessible from JavaScript
            secure: process.env.NODE_ENV === 'production', // Cookie is sent only over HTTPS in production
        });

        // Return success response with user data and token
        return res.status(200).json({
            message: 'Login successful',
            token, // Optionally include token in response body
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
const user_logout = async (req, res, next) => {
    // Clear JWT cookie
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { user_login, user_logout };

//signup


const user_signup = async (req, res, next) => {
    const data = req.body;
    try {
        // Validation for required fields
        if (!(data.email && data.name && data.password)) {
            return res.status(400).json({ error: "Invalid data" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create a new user
        const newUser = new User({
            name: data.name,
            email: data.email,
            password: hashedPassword
        });

        // Save the new user
        await newUser.save();

        return res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
};

//forgot password
const forgot_password=async(req,res,next)=>{
    
}

//reset password
const reset_password=async(req,res,next)=>{
}

module.exports={
    user_login,
    user_logout,
    user_signup,
    forgot_password,
    reset_password
}