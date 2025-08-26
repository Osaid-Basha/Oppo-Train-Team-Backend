// src/controllers/authController.js
const authService = require('../services/authService');

class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(422).json({ success: false, error: 'email, password and role are required' });
      }

      const result = await authService.loginWithEmailPasswordRole(email, password, role);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user     // { uid, email, role, profile }
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: `Login failed: ${error.message}`
      });
    }
  }
}

module.exports = new AuthController();
