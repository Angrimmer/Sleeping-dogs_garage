require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/models/db');
const authRoutes = require('./src/routes/auth');
const vehicleRoutes = require('./src/routes/vehicles');
const voteRoutes = require('./src/routes/votes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/vehicles', voteRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connexion à la base de données réussie');
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :', error.message);
  }
}

startServer();