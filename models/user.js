"use strict";

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    
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
    age: DataTypes.INTEGER,
    occupation: DataTypes.STRING,
    address_1: DataTypes.STRING,
    address_2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    phone: DataTypes.STRING,
    height: DataTypes.STRING,
    weight: DataTypes.STRING
  }, 

  {
    instanceMethods: {
      checkPassword: function(password) {
        return bcrypt.compareSync(password, this.passwordDigest);
      }
    },

    classMethods: {
      associate: function(models) {
        // associations can be defined here
       // this.hasMany(models.Daily);
        this.belongsTo(models.Specialist);
      },
      encryptPassword: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
      },
      createSecure: function(email, password) {
        if(password.length < 6) {
          throw new Error("Password too short");
        }
        return this.create({
          email: email,
          passwordDigest: this.encryptPassword(password)
        });
      },
      authenticate: function(email, password) {
        return this.find({
          where: { email: email }
        })
        .then(function(user) {
          if (user === null) {
            throw new Error("Username does not exist");
          }
          else if (user.checkPassword(password)) {
            return user;
          } else {
            return false;
          }

        });
      }

    }  
  });
  return User;
};




























