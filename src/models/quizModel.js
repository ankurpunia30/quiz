const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        questions: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Question',
            validate: {
                validator: (arr) => arr.length > 0,
                message: 'A quiz must have at least one question',
            },
            required: true,
        },
        timeLimit: {
            type: Number,
            required: [true, 'Time limit is required'],
            validate: {
                validator: (value) => value > 0,
                message: 'Time limit must be a positive number',
            },
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            index: true,
        },
        results: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Result',
            },
        ],
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        tags: {
            type: [String],
            validate: {
                validator: (tags) => Array.isArray(tags) && tags.length <= 10,
                message: 'A quiz can have up to 10 tags',
            },
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'easy',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Quiz', quizSchema);
