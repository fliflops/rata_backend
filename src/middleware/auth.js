const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');

const APIError = require('../errors/api-error');
const {jwtSecret,redis} = require('../../config');

exports.authorize = async(req,res,next) => {
    const err = {
        message:'Invalid Access!',
        status: httpStatus.UNAUTHORIZED,
        isPublic: true
    };

    try{
        const token = req.headers['x-access-token'];
        if(!token){
            throw new Error('Invalid Token')
        }
        
        jwt.verify(token,jwtSecret,(error,result) => {
            if(error){
                //delete the redis session
                redis.del(`rata:session:${token}`)
                throw Error('Invalid Token')            
            }
            
            req.processor=result
            return next()
        })
    }
    catch(e){
        return next(new APIError(err))
    }
}