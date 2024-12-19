const { _r } = require("express-tools");
const Matrimonial = require("../../../models"); // Assuming the model exists
const mongoose = require("mongoose");
/**
 * Helper function to calculate age from date of birth
 */
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
/**
 * POST - Save matrimonial form data
 */
module.exports.saveMatrimonial = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      gotra,
      maritalStatus,
      height,
      weight,
      complexion,
      address,
      city,
      customCity,
      state,
      pinCode,
      mobileNumber,
      email,
      socialMediaHandle,
      qualification,
      stream,
      specialisation,
      occupation,
      employerName,
      employerDesignation,
      annualIncome,
      familyStatus,
      fatherName,
      fatherOccupation,
      motherName,
      motherOccupation,
      siblingsBrothers,
      siblingsSisters,
      declaration,
    } = req.body;
    // Validate input
    if (!fullName || !dateOfBirth || !mobileNumber || !email || !gender) {
      return _r.error({
        req,
        res,
        code: 400,
        message: "Full Name, Date of Birth, Mobile Number, Email, and Gender are required.",
      });
    }
    const age = calculateAge(dateOfBirth);
    const newMatrimonial = new Matrimonial({
      fullName,
      dateOfBirth,
      gender,
      gotra,
      maritalStatus,
      height,
      weight,
      complexion,
      address,
      city,
      customCity,
      state,
      pinCode,
      mobileNumber,
      email,
      socialMediaHandle,
      qualification,
      stream,
      specialisation,
      occupation,
      employerName,
      employerDesignation,
      annualIncome,
      familyStatus,
      fatherName,
      fatherOccupation,
      motherName,
      motherOccupation,
      siblingsBrothers,
      siblingsSisters,
      photo: req.files?.photo ? req.files.photo[0].path : null,  // Handle photo upload
      cv: req.files?.cv ? req.files.cv[0].path : null,  // Handle CV upload
      declaration,
      age,
    });
    await newMatrimonial.save();
    _r.success({
      req,
      res,
      code: 201,
      message: "Matrimonial form data saved successfully.",
      payload: { data: newMatrimonial },
    });
  } catch (error) {
    _r.error({
      req,
      res,
      error,
      message: "Error saving matrimonial data.",
    });
  }
};
/**
 * POST - Upload photo or CV
 */
module.exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return _r.error({
        req,
        res,
        code: 400,
        message: "No file uploaded! Please upload a valid file.",
      });
    }
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    _r.success({
      req,
      res,
      code: 201,
      message: "File uploaded successfully!",
      payload: {
        filePath,
        originalName,
      },
    });
  } catch (error) {
    _r.error({
      req,
      res,
      error,
      message: "Error during file upload.",
    });
  }
};
/**
 * GET - Search matrimonial profiles
 */
module.exports.searchMatrimonial = async (req, res) => {
  try {
    const {
      gender,
      minAge,
      maxAge,
      city,
      customCity,
      state,
      qualification,
      occupation,
      annualIncome,
    } = req.query;
    const query = {};
    if (gender) query.gender = gender.toLowerCase();
    if (minAge || maxAge) {
      const today = new Date();
      const minAgeDate = new Date(today);
      minAgeDate.setFullYear(today.getFullYear() - minAge);
      const maxAgeDate = new Date(today);
      maxAgeDate.setFullYear(today.getFullYear() - maxAge);
      query.dateOfBirth = { $gte: maxAgeDate, $lte: minAgeDate };
    }
    if (city) query.city = { $regex: city, $options: "i" };
    if (customCity) query.customCity = { $regex: customCity, $options: "i" };
    if (state) query.state = { $regex: state, $options: "i" };
    if (qualification) query.qualification = { $regex: qualification, $options: "i" };
    if (occupation) query.occupation = { $regex: occupation, $options: "i" };
    if (annualIncome) query.annualIncome = { $gte: annualIncome };
    const results = await Matrimonial.find(query);
    if (results.length === 0) {
      return _r.error({
        req,
        res,
        code: 404,
        message: "No matching profiles found.",
      });
    }
    _r.success({
      req,
      res,
      code: 200,
      message: "Search results found.",
      payload: { data: results },
    });
  } catch (error) {
    _r.error({
      req,
      res,
      error,
      message: "Error searching matrimonial profiles.",
    });
  }
};