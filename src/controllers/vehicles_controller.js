const db = require('../models/db');

const addVehicle = async (req, res) => {
  try {
    const { name, category, price, top_speed, image_url, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: 'Le nom et la catégorie sont obligatoires'
      });
    }

    const sql = `
      INSERT INTO vehicles (name, category, price, top_speed, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      category,
      price || 0,
      top_speed || 0,
      image_url || '',
      description || ''
    ];

    const [result] = await db.query(sql, values);

    res.status(201).json({
      message: 'Véhicule ajouté avec succès',
      vehicleId: result.insertId
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du véhicule :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de l'ajout du véhicule"
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, top_speed, image_url, description } = req.body;

    const sql = `
      UPDATE vehicles
      SET name = ?, category = ?, price = ?, top_speed = ?, image_url = ?, description = ?
      WHERE id = ?
    `;

    const values = [
      name,
      category,
      price || 0,
      top_speed || 0,
      image_url || '',
      description || '',
      id
    ];

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Véhicule introuvable'
      });
    }

    res.status(200).json({
      message: 'Véhicule modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la modification du véhicule :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la modification du véhicule'
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM vehicles WHERE id = ?`;
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Véhicule introuvable'
      });
    }

    res.status(200).json({
      message: 'Véhicule supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la suppression du véhicule'
    });
  }
};

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

const getAllVehicles = async (req, res) => {
  try {
    const sql = `
      SELECT 
        v.id,
        v.name,
        v.category,
        v.price,
        v.top_speed,
        v.image_url,
        v.description,
        v.created_at,
        COUNT(vv.id) AS vote_count
      FROM vehicles v
      LEFT JOIN vehicle_votes vv ON v.id = vv.vehicle_id
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `;

    const [results] = await db.query(sql);

    res.status(200).json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules :', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des véhicules.'
    });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        v.id,
        v.name,
        v.category,
        v.price,
        v.top_speed,
        v.image_url,
        v.description,
        v.created_at,
        COUNT(vv.id) AS vote_count
      FROM vehicles v
      LEFT JOIN vehicle_votes vv ON v.id = vv.vehicle_id
      WHERE v.id = ?
      GROUP BY v.id
    `;

    const [results] = await db.query(sql, [id]);

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Véhicule introuvable.'
      });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule :', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération du véhicule.'
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
  addVehicle,
  updateVehicle,
  deleteVehicle,
  voteVehicle,
  getAllVehicles,
  getVehicleById,
  getVehicleVotes
};