const express = require('express');
const user=require('../models/userModel');
const Quiz = require('../models/quizModel');
const Result = require('../models/resultModel');
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




//starting a quiz 
const startQuiz = async (req, res) => {
    const id = req.params.id;
    try {
        const quiz = await Quiz.findById(id);
        // Check if the quiz exists
        if (!quiz) {
            return res.status(404).json({
                status: 'fail',
                message: 'No quiz found with that ID',
            });
        }

        // Check if the quiz is active
        if (quiz.status !== 'active') {
            return res.status(400).json({
                status: 'fail',
                message: 'The quiz is not active',
            });
        }

        // Check if the quiz has participants
        if (quiz.participants.includes(req.user.id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'You have already started the quiz',
            });
        }

        // Add the user to the participants array
        quiz.participants.push(req.user.id);
        await quiz.save();

        res.status(200).json({
            status: 'success',
            data: {
                quiz,
            },
        });

    } catch (err) {
        console.error('Error starting quiz:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while starting the quiz.',
            error: err.message,
        });
    }
}

const submitQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const quiz = await Quiz.findById(id);
        // Check if the quiz exists
        if (!quiz) {
            return res.status(404).json({
                status: 'fail',
                message: 'No quiz found with that ID',
            });
        }

        // Check if the quiz is active
        if (quiz.status === 'inactive') {
            return res.status(400).json({
                status: 'fail',
                message: 'The quiz is not active',
            });
        }
        // if(quiz.status==='completed'){
        //     return res.status(400).json({
        //         status: 'fail',
        //         message: 'The quiz is already completed',
        //     });
        // }


        // Check if the user has started the quiz
        if (!quiz.participants.includes(req.user.id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'You have not started the quiz',
            });
        }

        // Check if the quiz has already been submitted
        if (quiz.results.some(result => result.participant == req.user.id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'You have already submitted the quiz',
            });
        }

        // Calculate the score
        let score = 0;
        const userAnswers = req.body.answers;
        quiz.questions.forEach((question, index) => {
            // Ensure answer comparison works for multiple-choice or single-choice
            if (Array.isArray(question.correctAnswers) && Array.isArray(userAnswers[index])) {
                if (question.correctAnswers.sort().join(',') === userAnswers[index].sort().join(',')) {
                    score++;
                }
            } else if (question.correctAnswers === userAnswers[index]) {
                score++;
            }
        });

        // Create the result object
        const result = {
            participant: req.user.id,
            score,
            totalQuestions: quiz.questions.length,
            correctAnswers: score,
            resultMessage: score === quiz.questions.length ? 'Perfect score!' : `You scored ${score} out of ${quiz.questions.length}.`,
        };

        // Store the result in the quiz
        //storing result into result model
        const details={
            quiz:id,
            user:req.user.id,
            score,
            totalQuestions: quiz.questions.length,
            correctAnswers: score,
            percentage: (score / quiz.questions.length) * 100,
            feedback: score === quiz.questions.length ? 'Perfect score!' : `You scored ${score} out of ${quiz.questions.length}.`,
            
        }
        const newResult = await Result.create(details);
        quiz.results.push(newResult._id);
        // quiz.status='completed';

        //updating quiz history of user
        //providing quiz id,score,timestamp
        await user.findByIdAndUpdate(req.user.id, {
            $push: { quizHistory: {quiz:id,score:score,timestamp:new Date()} },
        }
        )
        await quiz.save();

        
        res.status(200).json({
            status: 'success',
            data: {
                result,
            },
        });

    } catch (err) {
        console.error('Error submitting quiz:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while submitting the quiz.',
            error: err.message,
        });
    }
}

//getting a quiz result

const getQuizResult = async (req, res) => {
    const id=req.params.id;
    try{
        //getting results of a quiz with quiz id
        const results=await Result.find({quiz:id});
        if(results.length===0){
            return res.status(404).json({
                status: 'fail',
                message: 'No results found for the quiz.',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                results,
            },
        });

    }
    catch(err){
        console.error('Error getting quiz result:', err);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while getting the quiz result.',
            error: err.message,
        });
    }
}

module.exports = {
    createQuiz,
    getAllQuizzes,
    getSingleQuiz,
    updateQuiz,
    deleteQuiz,
    startQuiz,
    submitQuiz,
    getQuizResult
};
