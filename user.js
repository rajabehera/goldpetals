const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('family_tree', 'root', 'Seatech@123', {
  host: '192.168.1.97',
  dialect: 'mysql',
  logging: console.log, 
});

const User = sequelize.define('users', {
  prefix: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  middle_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  display_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING(10),  // Limited to 10 characters
    allowNull: true,
    validate: {
      isNumeric: true,
      len: [10, 10],  // Ensure it's a 10-digit phone number
    },
  },
  email_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  area: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  pin: {
    type: DataTypes.STRING(6),  // Assuming a 6-digit PIN code
    allowNull: true,
    validate: {
      isNumeric: true,
      len: [6, 6],  // Ensure it's a 6-digit PIN code
    },
  },
  otp: {
    type: DataTypes.STRING(6),  // Assuming OTPs are 6 digits
    allowNull: true,
  },
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields
});

module.exports = User;
// Sync the model with the database (creating the table if it doesn't exist)
sequelize.sync();
