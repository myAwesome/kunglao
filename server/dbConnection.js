'use strict';
const { Sequelize } = require('sequelize');

//LOCAL CONNECTION
const sequelize = new Sequelize('mysql://root:vova@127.0.0.1:3307/eng');

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

checkConnection();

module.exports = sequelize;

