const express=require('express');
const authController=require('../controllers/authController');
const router=express.Router();



//login
router.post('/login',authController.user_login);
//logout
router.get('/logout',authController.user_logout);
//signup
router.post('/signup',authController.user_signup);
//forgot password
router.post('/forgotPassword',authController.forgot_password);

//reset password
router.post('/resetPassword',authController.reset_password);

module.exports=router;