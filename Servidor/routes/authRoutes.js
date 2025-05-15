const express = require("express");
const router = express.Router();
const { loginConGoogle } = require("../middlewares/authMiddleware");

router.post("/google", loginConGoogle); 

module.exports = router;


