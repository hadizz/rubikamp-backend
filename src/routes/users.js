const express = require('express');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users route (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user by ID route (admin only)
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create user route (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if required fields are provided
    if (!name || !email) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create(name, email, '123456', false);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Update user route (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, isAdmin } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    const updatedUser = await User.update(userId, {
      name: name || user.name,
      email: email || user.email,
      password: password || user.password,
      isAdmin: isAdmin !== undefined ? isAdmin : user.isAdmin
    });
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});


// Delete user route (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.delete(userId);
    res.json({ message: 'User deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});


module.exports = router; 