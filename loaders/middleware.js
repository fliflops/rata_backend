const jwt = require('jsonwebtoken');
const secret = process.env.TOKEN_SECRET;

exports.sessionAuthentication = async(req,res,next) => {
    try{    
        const path = req.originalUrl
        if(!['/auth/token','/auth/sign-out'].includes(path))
        {
            // console.log(req.headers)
            // console.log(req.session)
            const token = req.headers['x-access-token']
            
            if(!token){
                throw Error('Token is Required')
            }

            if(!req.session.user_email){
                throw Error('Invalid Session')
            }

            const decode = jwt.verify(token,secret);
            const session = {
                email:req.session.user_email,
                exp: req.session.token_expiry
            }

            if(decode.email !== session.email || decode.exp !== session.exp){
                return res.status(403).json({
                    message:'The session is Invalid!'
                })
            }           
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