const db = require('../models/db');
const sanitizeHtml = require('sanitize-html');

const cleanText = (value = '') => {
  return sanitizeHtml(String(value), {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
};

const isValidHttpUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidPositiveNumber = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    !Number.isNaN(Number(value)) &&
    Number(value) >= 0
  );
};

const validateVehicleData = (data) => {
  const name = cleanText(data.name);
  const category = cleanText(data.category);
  const description = cleanText(data.description);
  const image_url = cleanText(data.image_url);
  const price = data.price;
  const top_speed = data.top_speed;

  if (!name || !category || !description || !image_url || price === '' || top_speed === '') {
    return {
      error: 'Tous les champs sont obligatoires'
    };
  }

  if (!isValidPositiveNumber(price) || !isValidPositiveNumber(top_speed)) {
    return {
      error: 'Le prix et la vitesse doivent être des nombres positifs'
    };
  }

  if (!isValidHttpUrl(image_url)) {
    return {
      error: "L'URL de l'image doit commencer par http:// ou https://"
    };
  }

  return {
    vehicle: {
      name,
      category,
      price: Number(price),
      top_speed: Number(top_speed),
      image_url,
      description
    }
  };
};

const addVehicle = async (req, res) => {
  try {
    const validation = validateVehicleData(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error
      });
    }

    const { name, category, price, top_speed, image_url, description } = validation.vehicle;

    const sql = `
      INSERT INTO vehicles (name, category, price, top_speed, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      category,
      price,
      top_speed,
      image_url,
      description
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

    if (!isValidPositiveNumber(id)) {
      return res.status(400).json({
        message: 'ID invalide'
      });
    }

    const validation = validateVehicleData(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error
      });
    }

    const { name, category, price, top_speed, image_url, description } = validation.vehicle;

    const sql = `
      UPDATE vehicles
      SET name = ?, category = ?, price = ?, top_speed = ?, image_url = ?, description = ?
      WHERE id = ?
    `;

    const values = [
      name,
      category,
      price,
      top_speed,
      image_url,
      description,
      Number(id)
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

    if (!isValidPositiveNumber(id)) {
      return res.status(400).json({
        message: 'ID invalide'
      });
    }

    const sql = `DELETE FROM vehicles WHERE id = ?`;
    const [result] = await db.query(sql, [Number(id)]);

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

    if (!isValidPositiveNumber(id)) {
      return res.status(400).json({
        message: 'ID invalide'
      });
    }

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

    const [results] = await db.query(sql, [Number(id)]);

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

module.exports = {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById
};