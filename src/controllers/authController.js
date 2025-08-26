const axios = require("axios");
const { admin, db, auth } = require("../config/firebase");
const nodemailer = require("nodemailer");
const CONSTANTS = require("../utils/constants");

const apiKey = process.env.FIREBASE_API_KEY;

// helper لتوليد OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const authController = {
   // 🔹 Register new user
  async register(req, res) {
    try {
      const { email, password, full_name, student_id, phone, university, year_of_study } = req.body;

      if (!email || !password || !full_name || !student_id) {
        return res
          .status(CONSTANTS.HTTP_STATUS.BAD_REQUEST)
          .json({ error: "Email, password, full_name and student_id are required" });
      }

      // check for existing student ID
      const existingStudent = await db
        .collection(CONSTANTS.COLLECTIONS.USERS)
        .where("student_id", "==", student_id)
        .get();

      if (!existingStudent.empty) {
        return res
          .status(CONSTANTS.HTTP_STATUS.CONFLICT)
          .json({ error: CONSTANTS.ERROR_MESSAGES.STUDENT_ID_EXISTS });
      }

      // create user in Firebase Authentication
      const userRecord = await auth.createUser({ email, password });

      const userData = {
        email,
        full_name,
        student_id,
        phone: phone || "",
        university: university || "",
        year_of_study: year_of_study || "",
        is_member: false,
        membership_status: CONSTANTS.MEMBERSHIP_STATUS.PENDING,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection(CONSTANTS.COLLECTIONS.USERS).doc(userRecord.uid).set(userData);

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        message: CONSTANTS.SUCCESS_MESSAGES.USER_REGISTERED,
        user: { id: userRecord.uid, ...userData }
      });
    } catch (error) {
      console.error("Registration error:", error);
      let status = CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
      let message = error.message;

      if (error.code === CONSTANTS.FIREBASE_ERRORS.EMAIL_ALREADY_EXISTS) {
        status = CONSTANTS.HTTP_STATUS.CONFLICT;
        message = CONSTANTS.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
      }

      res.status(status).json({ error: message });
    }
  },

  // 🔹 Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Firebase REST API login
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        { email, password, returnSecureToken: true }
      );

      const { idToken, localId } = response.data;

      // بيانات إضافية من Firestore
      const userDoc = await db.collection("users").doc(localId).get();

      res.json({
        message: "Login successful",
        token: idToken,
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

  // 🔹 Forgot Password using OTP (6 digits)
  async forgotPasswordOTP(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const otp = generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000; // صالح 5 دقائق

      // خزن الكود في Firestore
      await db.collection("password_resets").doc(email).set({ otp, expiresAt });

      // ابعت الإيميل (بإستخدام nodemailer + Gmail)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your password reset code is: ${otp} (valid for 5 minutes)`,
      });

      res.json({ message: "OTP sent to email" });
    } catch (error) {
      console.error("Forgot password OTP error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // 🔹 Verify OTP
  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      const doc = await db.collection("password_resets").doc(email).get();

      if (!doc.exists) return res.status(400).json({ error: "No reset request found" });

      const data = doc.data();
      if (data.otp !== otp) return res.status(400).json({ error: "Invalid OTP code" });
      if (Date.now() > data.expiresAt) return res.status(400).json({ error: "OTP expired" });

      res.json({ message: "OTP verified successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🔹 Reset Password بعد OTP
  async resetPasswordWithOTP(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP and new password are required" });
      }

      const doc = await db.collection("password_resets").doc(email).get();
      if (!doc.exists) return res.status(400).json({ error: "No reset request found" });

      const data = doc.data();
      if (data.otp !== otp) return res.status(400).json({ error: "Invalid OTP code" });
      if (Date.now() > data.expiresAt) return res.status(400).json({ error: "OTP expired" });

      // نجيب اليوزر من Firebase Authentication
      const userRecord = await auth.getUserByEmail(email);

      // نحدث الباسورد
      await auth.updateUser(userRecord.uid, { password: newPassword });

      // احذف الكود من Firestore (عشان ما ينفع يستعمله مرتين)
      await db.collection("password_resets").doc(email).delete();

      res.json({ message: "Password has been reset successfully using OTP" });
    } catch (error) {
      console.error("Reset password with OTP error:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = authController;
