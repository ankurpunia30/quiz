//checking if the user is authenticated or not
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');



const authMiddleware = async (req,res,next)=>{

    const token=req.headers.cookie;
    console.log(token);
    if(!token){
        return res.status(401).json({
            status:'fail',
            message:'You are not logged in! Please log in to get access'
        });
    }
    try{
        const Token=token.split('jwt=')[1];
        const decoded=jwt.verify(Token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({
                status:'fail',
                message:'The user belonging to this token does no longer exist'
            });
        }
        req.user=user;
        console.log(req.user);
        next();
    }
    catch(err){
        return res.status(401).json({
            status:'fail',
            message:'You are not logged in! Please log in to get access'
        });
    }

}
module.exports = authMiddleware;
