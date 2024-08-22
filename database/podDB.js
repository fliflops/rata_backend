const Sequelize = require('sequelize');
const {podConfig} = require('../config');

const db = {}
const sequelize = new Sequelize({
    ...podConfig,
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;



