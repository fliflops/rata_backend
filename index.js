const express       = require('express');
const helmet        = require('helmet');
const morgan        = require('morgan');
const cors          = require('cors');
const path          = require('path');
// const redis         = require('redis');
// const connectRedis = require('connect-redis');

// const cookieSession = require('cookie-session');
// const cookieParser = require("cookie-parser");
// const sessions = require('express-session');

const jwt           = require('jsonwebtoken')
const api           = require('./api');
const app           = express();
const {dbLoader,middleware}       = require('./loaders');
const oneDay = 1000 * 60 * 60 * 24;



global.appRoot = path.resolve(__dirname);

app.use(morgan('dev'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cors(
    // {
    // credentials:true,
    // origin: process.env.ORIGIN
    // }
));

app.use(helmet());
app.set('trust proxy',1)


// const redisStore = connectRedis(sessions)

// const redisClient = redis.createClient({
//     host:'localhost',
//     port:'6379'
// })

// redisClient.on('error', function (err) {
//     console.log('Could not establish a connection with redis. ' + err);
// });
// redisClient.on('connect', function (err) {
//     console.log('Connected to redis successfully');
// });



// app.use(sessions({
//     secret:process.env.TOKEN_SECRET,
//     saveUninitialized:true,
//     resave:false,
//     cookie:{
//         secure:false,
//         httpOnly:false,
//         //maxAge: oneDay
//     },
   
// }));

// app.use(cookieParser());

// app.use(middleware.sessionAuthentication);

app.use(api);
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
});

dbLoader();




