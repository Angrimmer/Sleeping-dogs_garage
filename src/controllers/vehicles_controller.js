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

module.exports = addVehicle;