"use strict";
module.exports = function(sequelize, DataTypes) {
  var Daily = sequelize.define("Daily", {
    date: DataTypes.STRING,
    time: DataTypes.STRING,
    pain_area_1: DataTypes.STRING,
    pain_area_2: DataTypes.STRING,
    pain_area_3: DataTypes.STRING,
    pain_area_4: DataTypes.STRING,
    pain_area_5: DataTypes.STRING,
    pain_scale: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    UserId: DataTypes.INTEGER,
    first_name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        this.belongsTo(models.User);
      }
    }
  });
  return Daily;
};