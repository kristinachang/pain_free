"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Dailies", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      date: {
        type: DataTypes.STRING
      },
      time: {
        type: DataTypes.STRING
      },
      pain_area_1: {
        type: DataTypes.STRING
      },
      pain_area_2: {
        type: DataTypes.STRING
      },
      pain_area_3: {
        type: DataTypes.STRING
      },
      pain_area_4: {
        type: DataTypes.STRING
      },
      pain_area_5: {
        type: DataTypes.STRING
      },
      pain_scale: {
        type: DataTypes.INTEGER
      },
      comment: {
        type: DataTypes.TEXT
      },
      client_id: {
        type: DataTypes.INTEGER
      },
      first_name: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("Dailies").done(done);
  }
};