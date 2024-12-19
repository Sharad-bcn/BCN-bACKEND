const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatrimonialSchema = new Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        address: { 
            type: String 
        },
        gender: { 
            type: String, 
            enum: ['male', 'female'],
            required: true 
        },
        dob: { 
            type: Date, 
            required: true 
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
            type: Number  // Changed to Number if you are storing income as a number
        },
        maritalStatus: { 
            type: String,
            enum: ['single', 'married', 'divorced', 'widowed'],  // Added enum for maritalStatus
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
            match: /^[0-9]{10}$/  // Optional: Regex for validating phone number (adjust based on format)
        },
        photo: { 
            type: String 
        },
        age: { 
            type: Number 
        }
    },
    { timestamps: true } // Optional: To automatically add createdAt and updatedAt timestamps
);

const Matrimonial = mongoose.model('MatrimonialPage', MatrimonialSchema);
module.exports = Matrimonial;
