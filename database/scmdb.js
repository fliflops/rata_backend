const Sequelize = require('sequelize');
const {scmdbConfig} = require('../config')

const db = {}
const sequelize = new Sequelize({
    ...scmdbConfig
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;