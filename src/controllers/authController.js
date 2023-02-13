const bcrypt = require('bcryptjs');
const models = require('../models/rata');
const _ = require('lodash');
const redis = require('../../config').redis;
const jwtSecret = require('../../config').jwtSecret;
const jwt = require('jsonwebtoken');

exports.login = async (req,res,next) => {
    try{
        const {
            email,
            password
        } = req.body;

        const errorMessage = {
            message: 'Invalid Username or password'
        }

        const getUser = await models.user_tbl.getOneData({
            where:{
                email: email
            },
            options:{
                include: [
                    {
                        model: models.role_tbl,
                        as:'role'
                    },
                    {
                        model: models.role_access_tbl,
                        as:'access'
                    }
                ]
            }
        })
        .then(result => {
            let {access,role,...user} = result;

            const accessHeaders = access.filter(item => item.is_header)
            access = accessHeaders.map(header => {
                const details = access.filter(item => !item.is_header && header.header_id === item.header_id)

                return {
                    ...header,
                    children: details
                }
            })

            return {
                email: user.email,
                id: user.id,
                password: user.password,
                first_name: user.first_name,
                last_name: user.last_name,
                role_name: role?.role_name,
                access
            }
        })

        if(!getUser) return res.status(400).json(errorMessage)

        if(!bcrypt.compareSync(password,getUser.password)) return res.status(400).json(errorMessage)
        
        //generate Token
        const token = jwt.sign({email}, jwtSecret,{
            expiresIn:'24h'
        })
        
        //insert into redis
        await redis.json.set(`rata:session:${token}`,'.', getUser)

        res.status(200).json({
            token
        })

    }
    catch(e){
        next(e)
    }


}

exports.logout = async(req,res,next) => {
    try{
        const token = req.headers['x-access-token'];
        
        if(token) {
            await redis.del(`rata:session:${token}`)
        }
        
        res.status(200).end()

    }
    catch(e){
        next(e)
    }
}

exports.authAccess=async(req,res,next) => {
    try{    
        const token = req.headers['x-access-token'];

        //get the modules
        const data = await redis.json.get(`rata:session:${token}`)
        if(!data) {
           return res.status(401).json({message:'Invalid Access!'})
        }

        res.status(200).json(data.access)
    }
    catch(e){
        next(e)
    }
}

exports.authMiddleWare = async() => {

}