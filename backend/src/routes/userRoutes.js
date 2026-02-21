const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUsersBulk,
  searchUsers,
  exportUsersToCSV,
} = require('../controllers/userController');
const { validateUser, validate } = require('../middleware/validation');

// Search and Export routes (must be before /:id routes)
router.get('/search', searchUsers);
router.get('/export', exportUsersToCSV);

// Bulk delete
router.post('/bulk-delete', deleteUsersBulk);

// CRUD routes
router.route('/').get(getUsers).post(validateUser, validate, createUser);

router
  .route('/:id')
  .get(getUserById)
  .put(validateUser, validate, updateUser)
  .delete(deleteUser);

module.exports = router;
