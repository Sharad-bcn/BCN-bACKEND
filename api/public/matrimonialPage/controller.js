const { _r } = require("express-tools");
const Matrimonial = require("../../../models")
const { uploadFile } = require("../../../helpers/./utils/s3");
const mongoose = require("mongoose");
//const ObjectId = mongoose.Types.ObjectId;
const { validateMatrimonialForm } = require("./validator");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
/**
 * Helper function to calculate age from date of birth
 */
const s3Client = new S3Client({
  region: process.env.REACT_APP_S3_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  }
});
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

const uploadToS3 = async (file, folder = 'matrimonial') => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const command = new PutObjectCommand({
      Bucket: process.env.REACT_APP_S3_BUCKET,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: 'public-read'
    });
    await s3Client.send(command);
    
    return `https://${process.env.REACT_APP_S3_BUCKET}.s3.${process.env.REACT_APP_S3_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};
/**
 * Function to upload files to S3 (mock implementation, replace with actual logic)
 */
/**
 * Function to save matrimonial data to the database
 */
const saveMatrimonialData = async (formData) => {
  const matrimonial = new Matrimonial(formData);
  return await matrimonial.save();
};
// ... existing imports ...
const fileUpload = require('express-fileupload');
/**
 * Submit Matrimonial Form Handler
 */
module.exports.submitMatrimonialForm = async (req, res) => {
  try {
    // Debug log to see what's coming in
    console.log('Files received:', {
      hasFiles: !!req.files,
      fileKeys: req.files ? Object.keys(req.files) : [],
      photoDetails: req.files?.photo ? {
        name: req.files.photo.name,
        size: req.files.photo.size,
        mimetype: req.files.photo.mimetype
      } : 'No photo',
      cvDetails: req.files?.cv ? {
        name: req.files.cv.name,
        size: req.files.cv.size,
        mimetype: req.files.cv.mimetype
      } : 'No cv'
    });

    // Check if files exist
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files were uploaded'
      });
    }

    // Check specific files
    if (!req.files.photo || !req.files.cv) {
      return res.status(400).json({
        status: 'error',
        message: 'Both photo and CV are required',
        receivedFiles: Object.keys(req.files)
      });
    }

    const { photo, cv } = req.files;

    // Upload photo
    let photoUrl = null;
    try {
      const photoResult = await uploadFile(photo, 'photos');
      photoUrl = photoResult.Location;
      console.log('Photo uploaded:', photoUrl);
    } catch (error) {
      console.error('Photo upload error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload photo'
      });
    }

    // Upload CV
    let cvUrl = null;
    try {
      const cvResult = await uploadFile(cv, 'cvs');
      cvUrl = cvResult.Location;
      console.log('CV uploaded:', cvUrl);
    } catch (error) {
      console.error('CV upload error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload CV'
      });
    }

    // Create form data
    const formData = {
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      gender: req.body.gender,
      dob: req.body.dob,
      contact: req.body.contact,
      photo: photoUrl,
      cv: cvUrl,
      declaration: req.body.declaration === 'true'
    };

    // Save to database
    const matrimonial = new Matrimonial(formData);
    const savedData = await matrimonial.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile created successfully',
      data: savedData
    });

  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
// Update the uploadToS3 function

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






