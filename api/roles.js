const router = require('express').Router();
const {roles} = require('../services');


router.post('/',async(req,res)=>{
    try{
        const {data} = req.body;
        const userId=req.session.userId
        await roles.createRole({
            data,
            userId
        })

        res.status(200).end()
    }
    catch(e){
        throw e
    }
})


module.exports = router