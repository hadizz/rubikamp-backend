const fs = require('fs').promises;
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

class Product {
  constructor(name, description, price, category, stock = 0) {
    this.id = Date.now().toString();
    this.name = name;
    this.description = description;
    this.price = price;
    this.category = category;
    this.stock = stock;
    this.createdAt = new Date();
  }

  static async readProductsFile() {
    try {
      const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If file doesn't exist, create it with empty products array
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify({ products: [] }, null, 2));
        return { products: [] };
      }
      throw error;
    }
  }

  static async writeProductsFile(data) {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  }

  static async findById(id) {
    const data = await this.readProductsFile();
    return data.products.find(product => product.id === id);
  }

  static async findByCategory(category) {
    const data = await this.readProductsFile();
    return data.products.filter(product => product.category === category);
  }

  static async getAll() {
    const data = await this.readProductsFile();
    return data.products;
  }

  static async create(name, description, price, category, stock = 0) {
    const data = await this.readProductsFile();
    const product = new Product(name, description, price, category, stock);
    data.products.push(product);
    await this.writeProductsFile(data);
    return product;
  }

  static async delete(id) {
    const data = await this.readProductsFile();
    data.products = data.products.filter(product => product.id !== id);
    await this.writeProductsFile(data);
  }

  static async update(id, { name, description, price, category, stock }) {
    const data = await this.readProductsFile();
    const product = data.products.find(product => product.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    await this.writeProductsFile(data);
    return product;
  }
}

module.exports = Product; 