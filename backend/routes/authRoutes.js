const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/authcontroller.js");
const authController = require("../controllers/authcontroller.js"); 
const { refreshToken } = require("../controllers/authcontroller");
const pgController = require("../controllers/pgcontroller.js"); 

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/refresh", refreshToken);



module.exports = router;
