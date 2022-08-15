const router = require('express').Router();
const bcrypt = require('bcryptjs');
const {users,auth,roles} = require('../services');
const {redisActions} = require('../helper'); 

router.post('/sign-out',async (req,res) => {
   
    if(!req.processor) {
        return  res.status(200).end();
    }

    await redisActions.DELETE({
        key:`session:${req.processor.id}`
    })

    res.status(200).end();
   
})

router.post('/connection',async(req,res) => {
    try{
        res.status(200).end()
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.post('/token', async(req,res) => {
    try{
        const {email,password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        }
        
        const getUsers = await users.getUser({
            filters:{
                email
            }
        })

        if(getUsers.length === 0){
            return res.status(404).json({
                message:'Invalid Username or Password'
            })
        }

        if(!bcrypt.compareSync(password,getUsers.password)){
            return res.status(400).json({
                message:'Invalid Username or Password'
            })
        }

        const token = await auth.generateToken({
            email,
            id:getUsers.id
        })

        const rawModules = await roles.getRoleModule({
            filters:{
                role_id:getUsers.user_role_id,
                has_access:1
            }
        })

        const modules = await roles.formatRoleModules({data:rawModules})
        await redisActions.SET({
            key:`session:${getUsers.id}`,
            value:{ 
                ...token,
                id:getUsers.id,
                email:email   
            }
        })
 
        res.status(200).json({
            token,
            modules
        })
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})

module.exports = router;