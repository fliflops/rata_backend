const redisClient = require('../config').redis;

exports.SET = async({key,value}) => {
    try{
        // await redisClient.connect();
        await redisClient.SETEX(key,Number(process.env.REDIS_SESSION_EXPIRE),JSON.stringify(value))
        // await redisClient.quit();
    }
    catch(e){
        throw e
    }
}

exports.EXIST = async({key}) => {
    try{
        //const isExist = redisClient.EXISTS(key)
    }
    catch(e){
        throw e
    }
}

exports.GET = async({key})=>{
    try{
        // await redisClient.connect()
        const data = await redisClient.get(key)
        // await redisClient.quit();

        if(!data){
            return null
        }

        return JSON.parse(data)
       
    }
    catch(e){
        throw e
    }
}

exports.DELETE = async({key}) => {
    try{
        await redisClient.del(key)
    }
    catch(e){
        throw e
    }
}

exports.HSET = async({key,values})=>{
    console.log(key,values)
    try{
        await  redisClient.HSET(key,values);
          
    }
    catch(e){
        throw e
    }
}


const validateRedisConnection = async() => {
    try{

    }
    catch(e){
        throw  e
    }
}

