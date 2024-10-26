//Backend API Endpoints for Reward system

const express = require('express');
const router = express.Router();
const db = require('../db');
// Record user activity and award points
router.post('/activity', async (req, res) => {
  const { userId, activityType } = req.body;
  const pointsEarned = getPointsForActivity(activityType);
  try {
    await db.query('BEGIN');
// Record activity
    await db.query(
      'INSERT INTO activities (user_id, activity_type, points_earned) VALUES ($1, $2, $3)',
      [userId, activityType, pointsEarned]
    );
// Update user points
    await db.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [pointsEarned, userId]
    );
// Check and update level if necessary
    await updateUserLevel(userId);
// Check and award achievements if necessary
    await checkAndAwardAchievements(userId);
    await db.query('COMMIT');
    res.status(200).json({ message: 'Activity recorded and points awarded', pointsEarned });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Error recording activity' });
  }
});
// Get user profile with points, level, and achievements
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userProfile = await db.query(
      'SELECT u.id, u.username, u.points, u.level, array_agg(a.achievement_name) as achievements ' +
      'FROM users u ' +
      'LEFT JOIN achievements a ON u.id = a.user_id ' +
      'WHERE u.id = $1 ' +
      'GROUP BY u.id',
      [userId]
    );
    res.status(200).json(userProfile.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});
// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db.query(
      'SELECT id, username, points, level ' +
      'FROM users ' +
      'ORDER BY points DESC ' +
      'LIMIT 100'
    );
    res.status(200).json(leaderboard.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});
// Redeem reward
router.post('/redeem-reward', async (req, res) => {
  const { userId, rewardId } = req.body;
  try {
    await db.query('BEGIN');
// Get reward details
    const reward = await db.query('SELECT * FROM rewards WHERE id = $1', [rewardId]);
    if (reward.rows.length === 0) {
      throw new Error('Reward not found');
    }
// Check if user has enough points
    const user = await db.query('SELECT points FROM users WHERE id = $1', [userId]);
    if (user.rows[0].points < reward.rows[0].point_cost) {
      throw new Error('Not enough points');
    }
// Deduct points and record redemption
    await db.query('UPDATE users SET points = points - $1 WHERE id = $2', [reward.rows[0].point_cost, userId]);
    await db.query('INSERT INTO user_rewards (user_id, reward_id) VALUES ($1, $2)', [userId, rewardId]);
    await db.query('COMMIT');
    res.status(200).json({ message: 'Reward redeemed successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
