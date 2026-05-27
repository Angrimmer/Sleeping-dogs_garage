const db = require('../models/db');

const addVehicle = async (req, res) => {
  try {
    const { name, category, price, top_speed, image_url, description } = req.body;

    if (!name || !category) {
        return res.status(400).json({
            message: 'le nom et la catégorie sont obligatoires'
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
    console.error('Erreur lors de l\'ajout du véhicule :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de l\'ajout du véhicule'
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

module.exports = {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  voteVehicle
};