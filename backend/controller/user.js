const express = require("express");
const path = require("path");
const User = require("../model/user");
const router = express.Router();
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");

router.post("/create-user", upload.single("file"), catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  // Check if file was uploaded
  if (!req.file) {
    return next(new ErrorHandler("Please upload an avatar image", 400));
  }
  
  // Check if user already exists
  const userEmail = await User.findOne({ email });
  if (userEmail) {
    const filename = req.file.filename;
    const filePath = `uploads/${filename}`;
    
    // Delete uploaded file if user already exists
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
      }
    });
    
    return next(new ErrorHandler("User already exists", 400));
  }
  
  const filename = req.file.filename;
  const fileUrl = path.join(filename);
  
  const user = {
    name: name,
    email: email,
    password: password,
    avatar: {
      public_id: "sample_id",
      url: fileUrl,
    },
  };
  
  const activationToken = createActivationToken(user);
  const activationUrl = `http://localhost:5173/activation/${activationToken}`;
  
  try {
    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
    });
    
    res.status(201).json({
      success: true,
      message: `Please check your email: ${user.email} to activate your account!`
    });
  } catch (error) {
    // Delete uploaded file if email sending fails
    const filename = req.file.filename;
    const filePath = `uploads/${filename}`;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
      }
    });
    
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// Activate user
router.post("/activation", catchAsyncErrors(async (req, res, next) => {
  const { activation_token } = req.body;
  
  if (!activation_token) {
    return next(new ErrorHandler("Activation token is required", 400));
  }
  
  let newUser;
  try {
    newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }
  
  if (!newUser) {
    return next(new ErrorHandler("Invalid token", 400));
  }
  
  const { name, email, password, avatar } = newUser;
  
  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }
  
  // Create user in database
  try {
    user = await User.create({
      name,
      email,
      password,
      avatar,
    });
    
    console.log("User created successfully:", user._id);
    sendToken(user, 201, res);
  } catch (error) {
    console.log("Error creating user:", error);
    return next(new ErrorHandler(`Failed to create user: ${error.message}`, 500));
  }
}));

module.exports = router;
