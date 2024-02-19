const models  = require('../models');
const {podDB,scmdb} = require('../database');
const {redis,redisIndex} = require('../config')
const jobs = require('../src/jobs');
const kronos = require('../src/models/kronos');

module.exports = async() => {
    try{

        (async()=> {
            redis.on("error", (error) => console.error(`Error : ${error}`));
            await redis.connect(); 
            await redisIndex.userSessionIndex(redis);
            // await redisIndex.testIndex(redis);
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
        
        await kronos.sequelize.authenticate().then(() => {
            console.log('Connected to Kronos DB')
        })
    }
    catch(e){
        console.log(e)
    }
}