const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth_middleware');

const {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
} = require('../controllers/vehicles_controller');

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

router.post('/add', verifyToken, addVehicle);
router.put('/:id', verifyToken, updateVehicle);
router.delete('/:id', verifyToken, deleteVehicle);

module.exports = router;