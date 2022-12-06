const express       = require('express');
const helmet        = require('helmet');
const morgan        = require('morgan');
const cors          = require('cors');
const path          = require('path');
const methodOverride = require('method-override');
const compress = require('compression')

const api           = require('./api');
const v2            = require('./src/api');
const error         = require('./src/middleware/error');

const app           = express();

const {dbLoader}       = require('./loaders');
const oneDay = 1000 * 60 * 60 * 24;
const allowedOrigins = [
    'http://localhost:3003',
    'http://localhost:3002',
    'https://tmsuat.automoto.ph:60001',
    'https://tmsuat.automoto.ph:60000',
    'https://tmsdev.automoto.ph:60001',
    'https://tmsdev.automoto.ph:60000',
]

global.appRoot = path.resolve(__dirname);

app.use(morgan('dev'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

app.use(helmet());

app.use(cors({
    credentials:true,
    origin: (origin,callback) => {
        if(allowedOrigins.indexOf(origin) !== -1){
            callback(null,true)
        }
        else{
            callback(new Error('Not allowed by CORS'))
        }
    }
}));

app.set('trust proxy',1)

app.use(api);

app.use('/v2',v2)

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

app.listen(process.env.PORT, () => {
    console.log(`${process.env.NODE_ENV} instance!`)
    console.log(`Server running on port ${process.env.PORT}`)
});

dbLoader();





