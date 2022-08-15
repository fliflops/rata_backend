const jwt = require('jsonwebtoken');
const moment = require('moment');
const secret = process.env.TOKEN_SECRET;

exports.generateToken = async({
    id,
    email
}) => {
    try{
        const token = await jwt.sign({email,id},secret,{
            expiresIn:"24h"
        })
        const decode = await jwt.verify(token,secret)

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