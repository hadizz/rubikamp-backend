const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

class User {
  constructor(name, email, password, isAdmin = false) {
    this.id = Date.now().toString();
    this.name = name;
    this.email = email;
    this.password = password; // In a real app, this should be hashed
    this.isAdmin = isAdmin;
    this.createdAt = new Date();
  }

  static async readUsersFile() {
    try {
      const data = await fs.readFile(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If file doesn't exist, create it with empty users array
        await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
        return { users: [] };
      }
      throw error;
    }
  }

  static async writeUsersFile(data) {
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
  }

  static async findByEmail(email) {
    const data = await this.readUsersFile();
    return data.users.find(user => user.email === email);
  }

  static async findById(id) {
    const data = await this.readUsersFile();
    return data.users.find(user => user.id === id);
  }

  static async getAll() {
    const data = await this.readUsersFile();
    return data.users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    }));
  }

  static async create(name, email, password, isAdmin = false) {
    const data = await this.readUsersFile();
    const user = new User(name, email, password, isAdmin);
    data.users.push(user);
    await this.writeUsersFile(data);
    return user;
  }
}

module.exports = User; 