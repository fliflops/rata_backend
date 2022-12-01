const jwt = require('jsonwebtoken');
const {redisActions} = require('../helper');
const secret = process.env.TOKEN_SECRET;

exports.sessionAuthentication = async(req,res,next) => {
    try{    
        const path = req.originalUrl
        if(!['/auth/token','/auth/sign-out'].includes(path))
        {
            const token = req.headers['x-access-token']
            
            if(token === null || typeof token === 'undefined'){
                throw Error('Token is Required')
            }

            const decode = jwt.verify(token,secret);
            const redisSession = await redisActions.GET({key:`session:${decode.id}`})

            if(!redisSession){
                return res.status(440).json({
                    message:'No active session!'
                })
            }
            
            if(token !== redisSession.token){
                return res.status(403).json({
                    message:'The session is Invalid!'
                })
            } 
            
            req.processor = decode
        }

        if(path === '/auth/sign-out'){
            const token = req.headers['x-access-token']

            if(!token) {
                req.processor = null
                return next()
            }

            const decode = jwt.verify(token,secret,(err,data)=>{
                if(err) {
                    req.processor = null
                    return next()
                }

                return data
            });
            
            //const redisSession = await redisActions.GET({key:`session:${decode.id}`})

            req.processor = decode
        }
        
        next()        
    }
    catch(e){
        console.log(e)
        return res.status(403).json({
            message:`${e}`
        })
    }
}