const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Le nom d’utilisateur et le mot de passe sont obligatoires'
      });
    }

    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Ce nom d’utilisateur existe déjà'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    return res.status(201).json({
      message: 'Utilisateur inscrit avec succès',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Erreur register :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de l’inscription'
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Le nom d’utilisateur et le mot de passe sont obligatoires'
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Identifiants invalides'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Identifiants invalides'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Connexion réussie',
      token
    });
  } catch (error) {
    console.error('Erreur login :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

module.exports = {
  register,
  login
};