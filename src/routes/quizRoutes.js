//it will contain all routes related to quiz
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authController = require('../controllers/authController');
const {validateQuizFields} = require('../middleware/validateQuiz');
const authMiddlewarer = require('../middleware/authMiddleware');


//creating a quiz
router.post('/create',authMiddlewarer,validateQuizFields,quizController.createQuiz);
// //accessing all quizzes
router.get('/all',authMiddlewarer,quizController.getAllQuizzes);
// //accessing a single quiz
 router.get('/:id',quizController.getSingleQuiz);
// //updating a quiz
router.patch('/:id',authMiddlewarer,quizController.updateQuiz);
// //deleting a quiz
router.delete('/:id',authMiddlewarer,quizController.deleteQuiz);

//start quiz
router.post('/:id/start',authMiddlewarer,quizController.startQuiz);
//submit quiz
router.post('/:id/submit',authMiddlewarer,quizController.submitQuiz);


//getting quiz results
router.get('/:id/results',authMiddlewarer,quizController.getQuizResult);
module.exports = router;