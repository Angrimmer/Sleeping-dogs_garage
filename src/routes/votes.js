const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth_middleware');

const {
  voteVehicle,
  getVehicleVotes
} = require('../controllers/votes_controller');

router.get('/:id/votes', getVehicleVotes);
router.post('/:id/vote', verifyToken, voteVehicle);

module.exports = router;