// src/controllers/forgetPasswordController.js
const admin = require("firebase-admin");

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    res.json({ message: "Password reset link generated!", link });
  } catch (error) {
    
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({ message: "User not found with this email" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { forgotPassword };
