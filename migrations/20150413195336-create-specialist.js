"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Specialists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      email: {
        type: DataTypes.STRING
      },
      passwordDigest: {
        type: DataTypes.STRING
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      age: {
        type: DataTypes.INTEGER
      },
      occupation: {
        type: DataTypes.STRING
      },
      address_1: {
        type: DataTypes.STRING
      },
      address_2: {
        type: DataTypes.STRING
      },
      city: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      zip: {
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING
      },
      certs: {
        type: DataTypes.TEXT
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
    migration.dropTable("Specialists").done(done);
  }
};