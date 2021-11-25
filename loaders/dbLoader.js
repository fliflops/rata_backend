const models  = require('../models');
const {podDB} = require('../database');

module.exports = async() => {
    try{
        await models.sequelize.authenticate().then(() => {
            console.log('Connected to RB DB')
        });
        await podDB.sequelize.authenticate().then(()=> {
            console.log('Connected to POD DB')
        });
    }
    catch(e){
        console.log(e)
    }
}