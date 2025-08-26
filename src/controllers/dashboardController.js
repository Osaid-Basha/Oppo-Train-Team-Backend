const { db } = require('../config/firebase');

const dashboardController = {
  // Get counts of active and inactive members
  async getMembershipStatusCounts(req, res) {
    try {
      const activeSnapshot = await db
        .collection('users')
        .where('membership_status', '==', 'active')
        .get();

      const inactiveSnapshot = await db
        .collection('users')
        .where('membership_status', '==', 'inactive')
        .get();

      res.json({
        active: activeSnapshot.size,
        inactive: inactiveSnapshot.size,
      });
    } catch (error) {
      console.error('Error fetching membership status counts:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch membership status counts' });
    }
  },
};

module.exports = dashboardController;