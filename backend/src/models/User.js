const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [100, 'Street address cannot exceed 100 characters'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [50, 'City name cannot exceed 50 characters'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [50, 'State name cannot exceed 50 characters'],
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true,
        match: [/^[0-9]{5,6}$/, 'Please provide a valid zip code'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'India',
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

const User = mongoose.model('User', userSchema);

module.exports = User;
