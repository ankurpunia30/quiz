const validateQuizFields = (req, res, next) => {
    try{
    const { title, description, questions, timeLimit } = req.body;
    const creator = req.user.id;
    if (!title || !description || !questions || !timeLimit || !creator) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing required fields: title, description, questions, timeLimit, and creator.',
        });
    }

    if (!Array.isArray(questions) || questions.length < 1) {
        return res.status(400).json({
            status: 'fail',
            message: 'Questions must be an array with at least one question.',
        });
    }

    if (typeof timeLimit !== 'number' || timeLimit <= 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Time limit must be a positive number.',
        });
    }

    next();
    }
    catch(err){
        console.error('Error validating quiz fields:', err);

        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while validating the quiz fields.',
            error: err.message,
        });
    }
};

module.exports = { validateQuizFields };