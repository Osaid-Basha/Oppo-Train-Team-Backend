const axios = require("axios");
const { db } = require("../config/firebase");

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // API key من .env
      const apiKey = process.env.FIREBASE_API_KEY;

      // استدعاء Firebase REST API
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        { email, password, returnSecureToken: true }
      );

      const { idToken, localId } = response.data;

      // بيانات إضافية من Firestore
      const userDoc = await db.collection("users").doc(localId).get();

      res.json({
        message: "Login successful",
        token: idToken, // 🔥 تستعمله في Postman
        user: userDoc.exists ? userDoc.data() : { email },
      });
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      res.status(500).json({
        error: "Login failed",
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },
};

module.exports = authController;
