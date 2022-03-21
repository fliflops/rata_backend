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

router.get('/:role_id',async(req,res)=>{
    try{
        const {role_id} = req.params;

        const role = await roles.getAllRoles({
            filters:{
                role_id
            }
        })

        const rawModules = await roles.getRoleModule({
            filters:{
                role_id
            }
        }) 

        const modules = await roles.formatRoleModules({
            data:rawModules
        })

        if(role.length === 0){
            return res.status(400).json({
                message:'Role does not exists!'
            })
        }

        res.status(200).json({
            headers:role[0],
            modules
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


router.put('/:role_id',async(req,res)=> {
    try{
        const {data} = req.body;
        const {role_id} = req.params;

        // console.log(data)

        await roles.updateRoleTransaction({
            roles:data.role,
            modules:data.modules
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