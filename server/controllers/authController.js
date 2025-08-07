import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateOTP } from '../utils/generateOtp.js';
import { sendOtpEmail } from '../utils/sendOtpEmail.js';
import OTP from '../models/otpModel.js';
import { v4 as uuidv4 } from 'uuid';
import resend from '../config/resendClient.js';


export const register=async(req,res)=>{
    const {name,email,password}=req.body;

    if(!name || !email || !password){
        return res.json({success:false,message:'Missing Details'});
    }
    try{
        
        const existingUser=await userModel.findOne({email});
        
        if(existingUser){
            return res.json({success:false,message:"User already exits!"})
        }
        const hashedPassword=await bcrypt.hash(password,10);

        const user=new userModel({name,email,password:hashedPassword});
        await user.save();

        const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV ==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });
        

        await sendEmail({
            to: email,
            subject: 'Welcome to the site!',
            html: `<h1>Hello ${name}!</h1><p>Your account was created successfully.</p>`
        });



        return res.json({success:true});
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
        

}

export const login =async(req,res)=>{

    const {email,password}=req.body;

    if(!email || !password){
        return res.json({success:false ,message:'Email and password are required'})
    }
    try {
        const user =await  userModel.findOne({email});

        if(!user){
            return res.json({success:false ,message:'Invalid Email'})
        }

        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.json({success:false ,message:'Invalid Password'})
        }

        const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV ==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });

        return res.json({success:true});

    } catch (error) {
        res.json({success:false,message:error.message});
    }

}


export const logout=async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV ==='production'?'none':'strict',
            // maxAge:7*24*60*60*1000
        })
        return res.json({success:true,message:'Logged Out'});

    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

// OTP verification(Send)
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  try {
    await OTP.deleteMany({ email }); // remove previous
    await OTP.create({ email, otp, expiresAt });

    const result = await sendOtpEmail(email, otp);
    if (!result.success) throw new Error('Email not sent');

    return res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// OTP verification(Verify)

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Missing data' });

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    await OTP.deleteMany({ email }); // cleanup

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Password reset(Send)

export const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const token = uuidv4();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  user.resetToken = token;
  user.resetTokenExpiry = expiry;
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${token}`; // or your frontend URL

  try {
    await resend.emails.send({
      from: 'Tanvi <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link is valid for 15 minutes.</p>`
    });

    return res.json({ success: true, message: 'Reset email sent' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    return res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
};

// Password reset

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return res.json({ success: true, message: 'Password reset successful' });
};
