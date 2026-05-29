const db = require('../models/db');

const voteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const checkSql = `
      SELECT * FROM vehicle_votes
      WHERE user_id = ? AND vehicle_id = ?
    `;

    const [existingVote] = await db.query(checkSql, [userId, id]);

    if (existingVote.length > 0) {
      return res.status(409).json({
        message: 'Vous avez déjà voté pour ce véhicule'
      });
    }

    const insertSql = `
      INSERT INTO vehicle_votes (user_id, vehicle_id)
      VALUES (?, ?)
    `;

    await db.query(insertSql, [userId, id]);

    res.status(201).json({
      message: 'Vote ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du vote du véhicule :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors du vote du véhicule'
    });
  }
};

const getVehicleVotes = async (req, res) => {
  try {
    const { id } = req.params;

    const checkVehicleSql = `SELECT id FROM vehicles WHERE id = ?`;
    const [vehicleResult] = await db.query(checkVehicleSql, [id]);

    if (vehicleResult.length === 0) {
      return res.status(404).json({
        message: 'Véhicule introuvable.'
      });
    }

    const voteSql = `
      SELECT COUNT(*) AS votes
      FROM vehicle_votes
      WHERE vehicle_id = ?
    `;

    const [results] = await db.query(voteSql, [id]);

    res.status(200).json({
      vehicle_id: Number(id),
      votes: results[0].votes
    });
  } catch (error) {
    console.error('Erreur lors du comptage des votes :', error);
    res.status(500).json({
      message: 'Erreur serveur lors du comptage des votes.'
    });
  }
};

module.exports = {
  voteVehicle,
  getVehicleVotes
};