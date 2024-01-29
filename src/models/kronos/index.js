const Sequelize = require('sequelize');
const {kronosConfig} = require('../../../config');

const sequelize = new Sequelize({
    ...kronosConfig
})

const models = {
    vehicle_type: require('./vehicle_type').init(sequelize)
}

module.exports = {
    Sequelize,
    sequelize,
    ...models
}