const router = require('express').Router();
const {roles} = require('../services');


router.get('/',async(req,res)=>{
    try{
        const {page,totalPage,...filters} = req.query
        const {count,rows} = await roles.getPaginatedRoles({
            filters,
            page,
            totalPage
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });
    }
})

router.post('/',async(req,res)=>{
    try{
        const {data} = req.body;
        // const userId=req.session.userId
        await roles.createRole({
            data,
            userId
        })

        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });
    }
})


module.exports = router