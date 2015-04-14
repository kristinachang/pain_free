"use strict";

module.exports = function(sequelize, DataTypes) {
  var Specialist = sequelize.define("Specialist", {
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: [6, 30],
      }
    },
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }  
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    occupation: DataTypes.STRING,
    address_1: DataTypes.STRING,
    address_2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    phone: DataTypes.STRING,
    certs: DataTypes.TEXT
  }, 

  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        this.hasMany(models.User);
      },
    }
  });
  return Specialist;
};