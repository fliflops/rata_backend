const Sequelize = require('sequelize');
const {dwConfig}    = require('../../../config')

const kronos = new Sequelize({
    ...dwConfig,
    database: process.env.DW_KRONOS_DB
})

module.exports = {
    kronos
}