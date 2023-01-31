const Redis = require('ioredis');

module.exports=new Redis(
    {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
    //     maxRetriesPerRequest: null,
    //     enableReadyCheck: false
    }   
)