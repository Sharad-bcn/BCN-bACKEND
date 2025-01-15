const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatrimonialSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
          },
          email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
          },
          gender: {
            type: String,
            required: true,
            enum: ['male', 'female', 'other'],
            lowercase: true
          },
          contact: {
            type: String,
            required: true,
            match: [/^\d{10}$/, 'Please enter a valid 10-digit contact number']
          },
          address: {
            type: String,
            trim: true
          },
          dob: {
            type: Date
          }, 
        
        gotra: { 
            type: String 
        },
        district_city: { 
            type: String 
        },
        education: { 
            type: String 
        },
        jobProfile: {
            type: String 
        },
        income: { 
            type: Number  // Changed to Number if you're storing income as a number
        },
        maritalStatus: { 
            type: String,
            enum: ['single', 'married', 'divorced', 'widowed'],  // Enum for maritalStatus
        },
        fatherName: { 
            type: String 
        },
        fatherProfession: { 
            type: String
        },
        motherName: { 
            type: String
        },
        motherProfession: { 
            type: String
        },
        contact: { 
            type: String, 
            unique: true, 
            required: true, 
            match: /^[0-9]{10}$/  // Regex for validating phone number (10 digits)
        },
        photo: { 
            type: String,  // Store the file path or URL of the uploaded photo
        },
        cv: { 
            type: String,  // Store the file path or URL of the uploaded CV
        },
        declaration: { type: Boolean, required: true, default: '' },
        // Age is now dynamically calculated based on dob
        age: { 
            type: Number
        }
    },
    { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);
MatrimonialSchema.index({ email: 1, contact: 1 });
const Matrimonial = mongoose.model('MatrimonialPage', MatrimonialSchema);
module.exports = Matrimonial;
