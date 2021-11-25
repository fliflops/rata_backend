const jwt = require('jsonwebtoken');
const moment = require('moment');
const secret = process.env.TOKEN_SECRET;

exports.generateToken = async({
    email
}) => {
    try{
        const token = await jwt.sign({email:email},secret,{
            expiresIn:"2h"
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