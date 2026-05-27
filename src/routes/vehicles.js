const express = require('express');
const router = express.Router();

const addVehicle = require('../controllers/vehicles_controller');
const verifyToken = require('../middlewares/auth_middleware');

router.post('/add', verifyToken, addVehicle);

module.exports = router;