const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/.+\@.+\..+/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: true, // Prevent password from being sent in queries
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        quizHistory: [
            {
                quizId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Quiz',
                    required: true,
                },
                score: {
                    type: Number,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        quizzesCreated: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz',
            },
        ],
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('User', userSchema);
