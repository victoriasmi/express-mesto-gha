const router = require('express').Router();
const {
  getUsers, getUserById, createUser, updateAvatar, updateProfile,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.post('/users', createUser);
router.patch('/users/me/avatar', updateAvatar);
router.patch('/users/me', updateProfile);

module.exports = router;
