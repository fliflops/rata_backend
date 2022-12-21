const Redis = require('ioredis');

module.exports=new Redis(process.env.REDIS_PORT,process.env.REDIS_URL,{
    maxRetriesPerRequest: null,
    enableReadyCheck: false
})