const express = require('express');
const Product = require('../models/Product');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         category:
 *           type: string
 *           description: The category of the product
 *         stock:
 *           type: number
 *           description: The stock quantity of the product
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the product was created
 *       example:
 *         id: "1623765432123"
 *         name: "Smartphone X"
 *         description: "Latest smartphone with amazing features"
 *         price: 999.99
 *         category: "electronics"
 *         stock: 50
 *         createdAt: "2023-06-15T12:30:45.123Z"
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the product
 *           example: "iPhone 14 Pro"
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *           example: "Latest iPhone with dynamic island feature"
 *         price:
 *           type: number
 *           description: The price of the product
 *           example: 999.99
 *         category:
 *           type: string
 *           description: The category the product belongs to
 *           example: "electronics"
 *         stock:
 *           type: number
 *           description: The available stock quantity (defaults to 0)
 *           example: 50
 *     ProductResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ProductInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The auto-generated ID of the product
 *               example: "1234567890"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the product was created
 *               example: "2024-03-14T12:00:00Z"
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: The product was not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: The product category
 *     responses:
 *       200:
 *         description: A list of products in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.findByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Creates a new product in the system. Only administrators can create products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "iPhone 14 Pro"
 *             description: "Latest iPhone with dynamic island feature"
 *             price: 999.99
 *             category: "electronics"
 *             stock: 50
 *     responses:
 *       201:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *                 product:
 *                   $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name, description, price, and category are required"
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Check if required fields are provided
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, description, price, and category are required' });
    }

    // Create new product
    const product = await Product.create(name, description, price, category, stock || 0);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Updates an existing product's information. Only administrators can modify products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the product
 *               description:
 *                 type: string
 *                 description: Updated description of the product
 *               price:
 *                 type: number
 *                 description: The new price of the product
 *               category:
 *                 type: string
 *                 description: The new category for the product
 *               stock:
 *                 type: number
 *                 description: Updated stock quantity
 *           example:
 *             name: "iPhone 14 Pro Max"
 *             description: "Updated description with new features"
 *             price: 1099.99
 *             category: "electronics"
 *             stock: 75
 *     responses:
 *       200:
 *         description: The product was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 product:
 *                   $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: The product was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category, stock } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    const updatedProduct = await Product.update(productId, {
      name,
      description,
      price,
      category,
      stock
    });
    
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: |
 *       **[Admin Only]** This endpoint requires admin privileges.
 *       Permanently removes a product from the system. This action cannot be undone.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product to delete
 *     responses:
 *       200:
 *         description: The product was successfully deleted
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
 *         description: The product was not found
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Token is valid but user is not an admin
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.delete(productId);
    res.json({ message: 'Product deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router; 