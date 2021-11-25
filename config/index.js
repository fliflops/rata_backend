const podConfig = {
    username:'sa',
    password:'R@mc02019!',
    host:'13.250.206.211',
    database:'heliosDB',
    dialect:'mssql',
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
    host:'chronos-rds.cy2ay0l1hcaz.ap-southeast-1.rds.amazonaws.com',
    username:'rb_app',
    password:'R@t3NB1lling',
    dialect:'mysql',
    database:'rbDB',
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