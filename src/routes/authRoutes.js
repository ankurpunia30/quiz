const express=require('express');
const authController=require('../controllers/authController');
const router=express.Router();

const {user_login,user_logout,user_signup,forgot_password,reset_password}=require('../controllers/authController');

router.post('/login',user_login);
router.post('/logout',user_logout);
router.post('/signup',user_signup);
router.post('/forgot-password',forgot_password);
router.post('/reset-password',reset_password);

module.exports=router;