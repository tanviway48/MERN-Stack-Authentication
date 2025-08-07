import express from 'express';
import { login, logout, register,sendOtp, verifyOtp, sendResetPasswordEmail, resetPassword } from '../controllers/authController.js';


const authRouter=express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/forgot-password', sendResetPasswordEmail);
authRouter.post('/reset-password/:token', resetPassword);


export default authRouter;