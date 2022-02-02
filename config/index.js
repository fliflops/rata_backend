


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
    pool:{
        max: 10,
        min: 1,
        idle: 2000000,
        acquire: 2000000
    }
}

module.exports = {
    dbConfig,
    podConfig
}