const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        correctAnswers: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
        },
        feedback: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save middleware to calculate percentage if not provided
resultSchema.pre('save', function (next) {
    if (!this.percentage) {
        this.percentage = (this.correctAnswers / this.totalQuestions) * 100;
    }
    next();
});

module.exports = mongoose.model('Result', resultSchema);
