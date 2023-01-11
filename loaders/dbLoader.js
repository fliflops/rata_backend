const models  = require('../models');
const {podDB,scmdb} = require('../database');
const redis = require('../config').redis
const {redisIndex} = require('../helper');
const jobs = require('../src/jobs')

module.exports = async() => {
    try{

        (async()=> {
            redis.on("error", (error) => console.error(`Error : ${error}`));
            await redis.connect(); 
        })();
 
        //background worker v2
        jobs();

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