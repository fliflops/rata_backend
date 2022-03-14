const router = require('express').Router();
const {users} = require('../services');
 
router.post('/',async(req,res) => {
    try{
        const {data} = req.body;
        //const {email,first_name,last_name,status,remarks,role_id} = req.body
        const created = await users.createUser({
            data:{
                ...data,
                password:'secret',
                // created_by:req.session.userId
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
        const {page,totalPage,...filters} = req.query
        
        const {count,rows} = await users.getPaginatedUser({
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

router.get('/:email',async(req,res)=>{
    try{
        const {email}=req.params;

        const user = await users.getUser({
            filters:{
                email:email
            }
        })

        res.status(200).json({
            user
        })
        
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });
    }
})


router.put('/:user_id',async(req,res)=>{
    try{
        const {user_id}=req.params;
        const {data} = req.body;

        await users.updateUser({
            filters:{
                id:user_id
            },
            data:{
                ...data
            }
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

module.exports = router;