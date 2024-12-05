const { _r } = require('express-tools');
const Matrimonial = require('../../../models');  // Assuming the model exists
const mongoose = require('mongoose');
const path = require('path');

/**
 * POST - Save matrimonial form data
 */
module.exports.saveMatrimonial = async (req, res) => {
  try {
    const { name, email, address, gender, dob, gotra, district_city, education, jobProfile, income, maritalStatus, fatherName, fatherProfession, motherName, motherProfession, contact } = req.body;

    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const age = calculateAge(dob);

    const newMatrimonial = new Matrimonial({
      name,
      email,
      address,
      gender,
      dob,
      gotra,
      district_city,
      education,
      jobProfile,
      income,
      maritalStatus,
      fatherName,
      fatherProfession,
      motherName,
      motherProfession,
      contact,
      photo: req.file ? req.file.path : null,
      age
    });

    await newMatrimonial.save();
    _r.success({ req, res, code: 201, message: "Matrimonial form data saved successfully", payload: { data: newMatrimonial } });
  } catch (error) {
    _r.error({ req, res, error });
  }
};

/**
 * Post- upload photo pdf
 */

module.exports.uploadPDF = async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return _r.error({
        req,
        res,
        code: 400,
        message: "No PDF file uploaded!",
      });
    }
    // Extract file details
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    // Respond with success
    _r.success({
      req,
      res,
      code: 201,
      message: "PDF file uploaded successfully!",
      payload: {
        filePath,
        originalName,
      },
    });
  } catch (error) {
    // Handle any server errors
    _r.error({
      req,
      res,
      error,
      message: "Error during PDF upload",
    });
  }
};

/**
 * GET - Search matrimonial profiles
 */
module.exports.searchMatrimonial = async (req, res) => {
  try {
    const { gender, minAge, maxAge, location } = req.query;
    const query = {};

    if (gender) query.gender = gender.toLowerCase();

    if (minAge || maxAge) {
      const today = new Date();
      const minAgeDate = new Date(today);
      minAgeDate.setFullYear(today.getFullYear() - minAge);
      const maxAgeDate = new Date(today);
      maxAgeDate.setFullYear(today.getFullYear() - maxAge);
      query.dob = { $gte: maxAgeDate, $lte: minAgeDate };
    }

    if (location) query.district_city = { $regex: location, $options: "i" };

    const results = await Matrimonial.find(query);
    if (results.length === 0) return _r.error({ req, res, code: 404, message: 'No matching profiles found.' });
    
    _r.success({ req, res, code: 200, message: 'Search results found', payload: { data: results } });
  } catch (error) {
    _r.error({ req, res, error });
  }
};
