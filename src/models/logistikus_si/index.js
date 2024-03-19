const Sequelize = require('sequelize');
const {asciiConfig} = require('../../../config');

const sequelize = new Sequelize({
    ...asciiConfig
})

console.log(asciiConfig)

module.exports = {
    sequelize,
    Sequelize
}
