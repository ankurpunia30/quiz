const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
            select: false, // Prevent password from being sent in queries
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

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Add method to verify password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
