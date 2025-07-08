const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../model/user");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");

// Create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// ==================== Create User (Register) ====================
router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Remove uploaded file if user already exists
      if (req.file) {
        const filePath = `uploads/${req.file.filename}`;
        fs.unlink(filePath, (err) => {
          if (err) console.log("Error deleting file:", err);
        });
      }
      return next(new ErrorHandler("User already exists", 400));
    }

    const fileUrl = req.file ? path.join(req.file.filename) : "";

    const user = {
      name,
      email,
      password,
      avatar: {
        public_id: "sample_id",
        url: fileUrl,
      },
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `http://localhost:5173/activation/${activationToken}`;

    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
    });

    res.status(201).json({
      success: true,
      message: `Please check your email (${user.email}) to activate your account!`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ==================== Activate User ====================
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const decodedUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!decodedUser) {
        return next(new ErrorHandler("Invalid activation token", 400));
      }

      const { name, email, password, avatar } = decodedUser;

      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const newUser = await User.create({
        name,
        email,
        password,
        avatar,
      });

      sendToken(newUser, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
