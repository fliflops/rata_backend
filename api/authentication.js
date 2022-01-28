const router = require('express').Router();
const bcrypt = require('bcryptjs');
const {users,auth,roles} = require('../services');

 
router.post('/sign-out',(req,res) => {
    console.log(req.session)
    req.session.destroy(err => {
        if(err){
            return res.status(400).end()
        }
        res.status(200).end();
    });
   
})

router.post('/connection',async(req,res) => {
    try{

        req.session.save()
        // console.log(req.session)
        if(!req.session.userId){
            return res.status(400).json({
                message:'Session Expired!'
            })
        }

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
            email
        })

        const rawModules = await roles.getRoleModule({
            filters:{
                role_id:getUsers.user_role_id,
                has_access:1
            }
        })

       const modules = await roles.formatRoleModules({data:rawModules})
        // console.log(modules)

        req.session.userId = getUsers.id
        req.session.token_expiry = token.expiry
        
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