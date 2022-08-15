const models  = require('../models');
const {podDB,scmdb} = require('../database');
const redis = require('../config').redis
const {redisIndex} = require('../helper');


module.exports = async() => {
    const {searchHashes} = redisIndex;
    try{

        (async()=> {
            redis.on("error", (error) => console.error(`Error : ${error}`));
            await redis.connect();
            await searchHashes()
        })();

       
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