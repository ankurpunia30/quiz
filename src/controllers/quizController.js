const express = require('express');
const user=require('../models/userModel');
const Quiz = require('../models/quizModel');

// Creating a quiz
const createQuiz = async (req, res) => {
    const data = req.body; // Assumes data is already validated by the middleware
    const creator = req.user.id; // Logged-in user as the creator
    try {
        data.creator = creator; // Add the creator to the data

        // Create the quiz
        const newQuiz = await Quiz.create(data);
        //we also need to add the quiz id to the user's quizzes array
        await user.findByIdAndUpdate(creator, {
            $push: { quizzesCreated: newQuiz._id },
        }
        )
        

        // Respond with the created quiz
        res.status(201).json({
            status: 'success',
            data: {
                quiz: newQuiz,
            },
        });
    } catch (err) {
        console.error('Error creating quiz:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while creating the quiz.',
            error: err.message,
        });
    }
};

// Accessing all quizzes
const getAllQuizzes = async (req, res) => {
    const creator = req.user.id; // Creator from the logged-in user
    try {
        const allQuizzes = await Quiz.find({ creator: creator });

        if (allQuizzes.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No quizzes found for the current user.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                quizzes: allQuizzes,
            },
        });
    } catch (err) {
        console.error('Error getting quizzes:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while getting the quizzes.',
            error: err.message,
        });
    }
};

// Accessing a single quiz
const getSingleQuiz = async (req, res) => {
    const id = req.params.id;
    try {
        const singleQuiz = await Quiz.findById(id);

        if (!singleQuiz) {
            return res.status(404).json({
                status: 'fail',
                message: 'No quiz found with that ID',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                quiz: singleQuiz,
            },
        });
    } catch (err) {
        console.error('Error getting quiz:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while getting the quiz.',
            error: err.message,
        });
    }
};

// Updating a quiz
const updateQuiz = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        if (!updatedQuiz) {
            return res.status(404).json({
                status: 'fail',
                message: 'No quiz found with that ID',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                quiz: updatedQuiz,
            },
        });
    } catch (err) {
        console.error('Error updating quiz:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while updating the quiz.',
            error: err.message,
        });
    }
};

// Deleting a quiz
const deleteQuiz = async (req, res) => {
    const id = req.params.id;
    try {
        const quizToDelete = await Quiz.findByIdAndDelete(id);

        if (!quizToDelete) {
            return res.status(404).json({
                status: 'fail',
                message: 'No quiz found with that ID',
            });
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        console.error('Error deleting quiz:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while deleting the quiz.',
            error: err.message,
        });
    }
};

module.exports = {
    createQuiz,
    getAllQuizzes,
    getSingleQuiz,
    updateQuiz,
    deleteQuiz,
};
