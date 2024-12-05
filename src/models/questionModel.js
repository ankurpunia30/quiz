const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, 'Question content is required'],
            trim: true,
        },
        options: {
            type: [String],
            validate: {
                validator: (arr) => arr.length >= 2,
                message: 'There must be at least 2 options',
            },
            required: true,
        },
        correctAnswers: {
            type: [String],
            validate: {
                validator: function (answers) {
                    return answers.every((answer) => this.options.includes(answer));
                },
                message: 'Correct answers must be part of the options',
            },
            required: true,
        },
        type: {
            type: String,
            enum: ['single-choice', 'multiple-choice'],
            default: 'single-choice',
        },
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
            index: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Question', questionSchema);
