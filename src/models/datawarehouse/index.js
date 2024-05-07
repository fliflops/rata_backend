const Sequelize = require('sequelize');
const {dwConfig,dwPodConfig}    = require('../../../config')

const kronos = new Sequelize({
    ...dwConfig,
    database: process.env.DW_KRONOS_DB
})

const pod = new Sequelize({
    ...dwPodConfig
})

module.exports = {
    kronos,
    pod
}