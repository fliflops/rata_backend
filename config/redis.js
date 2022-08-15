const redis = require('redis');

module.exports = process.env.NODE_ENV === 'development' ?redis.createClient() : redis.createClient({
        socket:{
            host:process.env.REDIS_URL,
            port:process.env.REDIS_PORT
        }
    })


// const redis = require('redis');
// const redisClient = process.env.NODE_ENV === 'development' ?redis.createClient() : redis.createClient({
//     url:process.env.REDIS_URL,
//     port:process.env.REDIS_PORT
// })

// createClient({
//     url: 'redis://alice:foobared@awesome.redis.server:6380'
//   });

// const Redis = require('redis')
// const redis = process.env.NODE_ENV === 'development' ?  Redis.createClient() :  Redis.createClient({
//         url:process.env.REDIS_URL,
//         port:process.env.REDIS_PORT
//     })

// module.exports = redis

// const redis = require('redis')
// const _ = require('lodash')

// const clients = {};
// let connectionTimeout;

// function instanceEventListeners({ conn }) {
//     conn.on('connect', () => {
//         console.log('CacheStore - Connection status: connected');
//     });

//     conn.on('end', () => {
//         console.log('CacheStore - Connection status: disconnected');
//     });

//     conn.on('reconnecting', () => {
//         console.log('CacheStore - Connection status: reconnecting');
//     });

//     conn.on('error', (err) => {
//         console.log('CacheStore - Connection status: error ', { err });
//         throwTimeoutError();
//     });

// }

// function throwTimeoutError() {
//     connectionTimeout = setTimeout(() => {
//         throw new Error('Redis connection failed');
//     }, 10000);
// }

// module.exports.init = () => {
//     const cacheInstance = redis.createClient();
//     clients.cacheInstance = cacheInstance;
//     instanceEventListeners({ conn: cacheInstance });
// };

// module.exports.getClients = () => clients;
// module.exports.closeConnections = () => _.forOwn(clients, (conn) => conn.quit());






