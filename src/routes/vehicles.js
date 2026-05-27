const express = require('express');
const router = express.Router();

const addVehicle = require('../controllers/vehicles_controller');
const verifyToken = require('../middlewares/auth_middleware');

// Route pour ajouter un véhicule (protégée par le middleware de vérification de token)
router.post('/add', verifyToken, addVehicle);

module.exports = router;