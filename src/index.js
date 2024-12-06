const express = require('express');
const app = express();
//importing db connection
const connectDB = require('./config/db');
// Import the router from your authRoutes file
const user= require('./routes/authRoutes');
const quiz=require('./routes/quizRoutes');

// Middleware to parse incoming JSON requests
app.use(express.json());

// Connect to the database
connectDB();

// Define the root route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Use the authRoutes for any requests starting with '/api/auth'
app.use('/api/auth', user);
//route for quiz
app.use('/api/quiz',quiz);

// Define the port for the app to listen on
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
