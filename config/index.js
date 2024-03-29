
const redis = require('./redis');
const ioredis = require('./ioredis');
const vars = require('./vars');
const redisIndex = require('./redisIndex');

const podConfig = {
    username:       process.env.POD_DB_USER_NAME,
    password:       process.env.POD_DB_PASSWORD,
    host:           process.env.POD_DB_HOST,
    database:       process.env.POD_DB,
    dialect:        'mssql',
    dialectOptions : {
        options:{
            requestTimeout: 3600000
        }
    },
    pool: { 
        max: 1000000,
        min: 0,
        idle: 2000000,
        acquire: 2000000,
        idleTimeoutMillis: 50,
        evictionRunIntervalMillis: 5,
        softIdleTimeoutMillis: 5,
        logging: false
    }
}

const dbConfig = {
    host:       process.env.DB_HOST,
    username:   process.env.DB_USER,
    password:   process.env.DB_PASSWORD,
    dialect:    'mysql',
    database:   process.env.DB,
    // logging: false,
    pool:{
        max: 10,
        min: 1,
        idle: 2000000,
        acquire: 2000000
    },
    dialectOptions: {
		//useUTC: false, //for reading from database
		dateStrings: true,
		typeCast: true
	},
	timezone: '+08:00' /**for writing to database**/,
    // define:{
    //     version:true
    // }

}

const scmdbConfig = {
    username:       process.env.SCMDB_DB_USER,
    password:       process.env.SCMDB_DB_PASSWORD,
    host:           process.env.SCMDB_DB_HOST,
    database:       process.env.SCMDB_DB,
    dialect:        'mssql',
    dialectOptions : {
        options:{
            requestTimeout: 3600000
        }
    },
    pool: { 
        max: 1000000,
        min: 0,
        idle: 2000000,
        acquire: 2000000,
        idleTimeoutMillis: 50,
        evictionRunIntervalMillis: 5,
        softIdleTimeoutMillis: 5,
        logging: false
    }
}

const redisConfig = {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT
}

const kronosConfig = {
    host:       process.env.KRONOS_DB_HOST,
    username:   process.env.KRONOS_DB_USER,
    password:   process.env.KRONOS_DB_PASSWORD,
    dialect:    'mysql',
    database:   process.env.KRONOS_DB,
    // logging: false,
    pool:{
        max: 10,
        min: 1,
        idle: 2000000,
        acquire: 2000000
    },
    dialectOptions: {
		//useUTC: false, //for reading from database
		dateStrings: true,
		typeCast: true
	},
	timezone: '+08:00' /**for writing to database**/,
    // define:{
    //     version:true
    // }

}

module.exports = {
    dbConfig,
    podConfig,
    scmdbConfig,
    redisConfig,
    redis,
    ioredis,
    redisIndex, 
    kronosConfig,
    ...vars,

}