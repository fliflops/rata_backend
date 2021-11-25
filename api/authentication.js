const router = require('express').Router();
const bcrypt = require('bcryptjs');
const {users,auth} = require('../services');
 
router.post('/sign-out',(req,res) => {
    console.log(req.session)
    req.session = null;
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
        

        req.session.userId = getUsers.id
        req.session.token_expiry = token.expiry
        console.log(req.session.userId)
        res.status(200).json(token)
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})

module.exports = router;