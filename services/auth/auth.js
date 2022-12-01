const jwt = require('jsonwebtoken');
const moment = require('moment');
const secret = process.env.TOKEN_SECRET;

exports.generateToken = async({
    id,
    email,
    modules,
    role
}) => {
    try{
        const token = jwt.sign({email,id,modules,role},secret,{
            expiresIn:"24h"
        })
       
       const decode =jwt.verify(token,secret)
        return {
            token,
            expiry:decode.exp
        }
    }
    catch(e){
        throw e
    }
}

exports.decodeToken = ({
    token 
}) => {
    try{
        return jwt.verify(token,secret)
    }
    catch(e){
        throw e
    }
}