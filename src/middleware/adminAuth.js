const { authenticateUser } = require('./authMiddleware');

const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticateUser(req, res, () => {
      if (!req.user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Admin authentication failed' });
  }
};

module.exports = { authenticateAdmin };