"use strict";

const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
    required: true,
    ref: 'User', // Refers to the User model
  },
  type: {
    type: String,
    required: true,
    enum: ['photo', 'comment', 'register', 'login', 'logout'], // Valid activity types
  },
  photo: {
    file_name: {
      type: String,
      required: function () {
        return this.type === 'photo';
      }, // File name is required only for photo activities
    },
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set the current date/time
  },
});

/**
 * Create a Mongoose Model for an Activity using the activity Schema.
 */
const Activity = mongoose.model('Activity', activitySchema);

/**
 * Make this available to our application.
 */
module.exports = Activity;
