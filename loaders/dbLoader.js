const models  = require('../models');
const {podDB,scmdb} = require('../database');

module.exports = async() => {
    try{
        await models.sequelize.authenticate().then(() => {
            console.log('Connected to RB DB')
        });
        await podDB.sequelize.authenticate().then(()=> {
            console.log('Connected to POD DB')
        });

        await scmdb.sequelize.authenticate().then(()=>{
            console.log('Connected to SCMDB')
        })
    }
    catch(e){
        console.log(e)
    }
}