const redis = require('redis');

module.exports = redis.createClient({
    socket:{
        host:process.env.REDIS_URL,
        port:process.env.REDIS_PORT,
        passphrase: process.env.REDIS_PASSWORD
    }
})



