const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth_middleware');
const {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  voteVehicle
} = require('../controllers/vehicles_controller');

router.post('/add', verifyToken, addVehicle);
router.put('/:id', verifyToken, updateVehicle);
router.delete('/:id', verifyToken, deleteVehicle);
router.post('/:id/vote', verifyToken, voteVehicle);

module.exports = router;