const express = require('express');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns all users
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Retrieves a list of all users in the system. Only accessible by administrators.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Retrieves detailed information about a specific user by their ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID to retrieve
 *     responses:
 *       200:
 *         description: The user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Creates a new user in the system. Only administrators can create new users through this endpoint.
 *       Note that this is different from the public signup endpoint.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *               isAdmin:
 *                 type: boolean
 *                 description: Whether the user should have admin privileges
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields or user already exists
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Updates an existing user's information. Only administrators can modify user data.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's new name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's new email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's new password
 *               isAdmin:
 *                 type: boolean
 *                 description: Whether to grant or revoke admin privileges
 *     responses:
 *       200:
 *         description: The user was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Permanently removes a user from the system. This action cannot be undone.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: The user was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       404:
 *         description: The user was not found
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
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