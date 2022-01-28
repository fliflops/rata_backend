const router = require('express').Router();
const {users} = require('../services');
 
router.post('/',async(req,res) => {
    try{
        const {data} = req.body
        //const {email,first_name,last_name,status,remarks,role_id} = req.body
        const created = await users.createUser({
            data:{
                ...data,
                password:'secret',
                created_by:req.session.userId
            }
        })

        res.status(200).json(created)
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });
    }
})

router.get('/',async(req,res)=>{
    try{
        
        // const getUsers = await users.getUser({})

        // res.status(200).json({
        //     users:getUsers.
        // })

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });
    }
})


module.exports = router;