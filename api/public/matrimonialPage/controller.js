const { _r } = require("express-tools");
const Matrimonial = require("../../../models").Matrimonial;
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { validateMatrimonialForm } = require("./validator"); 

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
 * Function to upload files to S3 (mock implementation, replace with actual logic)
 */
const uploadToS3 = async (fileName, file) => {
  console.log(`Uploading file: ${fileName}`);
  return `https://s3-bucket-url/${fileName}`;
};
 
/**
 * Function to save matrimonial data to the database
 */
const saveMatrimonialData = async (formData) => {
  const matrimonial = new Matrimonial(formData);
  return await matrimonial.save();
};

/**
 * Submit Matrimonial Form Handler
 */
module.exports.submitMatrimonialForm = async (req, res) => {
  try {
    const { name, email, address, gender, dob, contact } = req.body;
    let { photo } = req.files || {}; // Use req.files for file handling

    console.log('1. Starting form submission', name, email, address, gender, dob, contact, photo);

    // Basic validation
    if (!req.body) {
      console.log('4. No body found');
      return res.status(400).json({ error: "No form data provided" });
    }

    const alreadyExists = await Matrimonial.findOne({ contact: contact });
    if (alreadyExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    if (email) {
      const user = await Matrimonial.findOne({ email: email });
      if (user) return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Handle photo file upload
    let photoPath = '';
    if (photo) {
      // Ensure the photo is uploaded to a directory
      const uploadPath = `./uploads/${photo.name}`;
      await photo.mv(uploadPath);
      photoPath = uploadPath;  // Store the path to the photo
    }

    // Create basic form data without file handling first
    const formData = {
      name: name || '',
      email: email || '',
      gender: gender || '',
      address: address || '',
      dob: dob || '',
      contact: contact || '',
      photo: photoPath, // Store the photo path
      declaration: true
    };

    console.log('5. Processed form data:', formData);

    // Try to save to database
    console.log('6. Attempting to save to database');
    const matrimonial = new Matrimonial(formData);
    const savedData = await matrimonial.save();
    console.log('7. Save successful:', savedData._id);

    // Send the success response
    return res.status(200).json({
      success: true,
      message: "Profile created successfully",
      data: savedData
    });

  } catch (error) {
    console.error('Error in submitMatrimonialForm:', { message: error.message, stack: error.stack });

    // Ensure the response is only sent once in case of error
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error", message: error.message });
    }
  }
};

/**
 * Search Matrimonial Profiles Handler
 */
module.exports.searchMatrimonialProfiles = async (req, res) => {
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

    // Build query object
    const query = {};
    if (gender) query.gender = gender;
    if (minAge || maxAge) {
      const today = new Date();
      if (minAge) {
        query.dateOfBirth = { $lte: new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()) };
      }
      if (maxAge) {
        query.dateOfBirth = {
          ...query.dateOfBirth,
          $gte: new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate())
        };
      }
    }
    if (city || customCity) query.city = customCity || city;
    if (state) query.state = state;
    if (qualification) query.qualification = qualification;
    if (occupation) query.occupation = occupation;
    if (annualIncome) query.annualIncome = { $gte: annualIncome };

    const results = await Matrimonial.find(query);

    if (results.length === 0) {
      return res.status(404).json({ message: "No matching profiles found." });
    }

    return res.status(200).json({ message: "Search results found.", data: results });
  } catch (error) {
    console.error("Error searching profiles:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
