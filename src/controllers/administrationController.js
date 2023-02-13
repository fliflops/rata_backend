const models = require('../models/rata')
const useGlobalFilter = require('../helpers/filters');

exports.getRoles = async(req,res,next) => {
    try{ 
        const {
            page,
            totalPage,
            search,
            ...filters
        } = req.query;

    const globalFilter = useGlobalFilter.defaultFilter({
            model:models.role_tbl.rawAttributes,
            filters:{
                search
            }
        })

        const {count,rows} = await models.role_tbl.paginated({
            filters:{
                ...globalFilter,
                ...filters
            },
            order: [['createdAt','DESC']],
            page,
            totalPage
        })

        res.status(200).json({
            data:rows,
            rows:count,
            pageCount: Math.ceil(count/totalPage)
        })

    }
    catch(e){
        next(e)
    }
}

exports.getRoleDetails = async(req,res,next) => {
    try{
        const {id} = req.params;

        const getRoles = await models.role_tbl.getOneData({
            where:{
                role_id: id
            },
            options:{
                include: [
                    {
                        model: models.role_access_tbl,
                        required: false,
                        as:'access'
                    }
                ]  
            }
        })
        .then(result => {
            return {
                ...result,
                isHeader: result.is_header
            }
        })

        res.status(200).send(getRoles)
    }
    catch(e){
        next(e)
    }
}

exports.postRoleAccess = async(req,res,next) => {
    try{
        const {id} = req.params;
        const {data}  = req.body;

        await models.role_access_tbl.bulkCreateData({
            data:data.map(item => {
                const {isHeader,...header} = item
                return {
                    ...header,
                    role_id: id,
                    is_header: isHeader,
                    createdBy: req.processor.id,
                    updatedBy: req.processor.id
                }
            }),
            options: {
                updateOnDuplicate: ['view','create','edit','export','updatedBy']
            }
        })

        res.status(200).end()
    }
    catch(e){
        next(e)
    }
}

exports.postRole = async(req,res,next) => {
    try{
        const {data} = req.body;

        const getRole = await models.role_tbl.getOneData({
            where: {
                role_name: data.role_name
            }
        })

        if(getRole) return res.status(400).json({
            message:'Role already exists!'
        })

        await models.role_tbl.createData({
            data:{
                ...data,
                role_status: 'INACTIVE',
                createdBy: req.processor.id, 
                updatedBy: req.processor.id
            }
        })

        res.status(200).end()
    }
    catch(e){
        next(e)
    }
}

exports.activateRole = async(req,res,next) => {
    try{
        const {id} = req.params;
        const {status} = req.query;

        const getRole = await models.role_tbl.getOneData({
            where: {
                role_id: id
            },
            options: {
                include: [
                    {
                        model: models.role_access_tbl,
                        required: false,
                        as:'access'
                    }
                ]
            }
        })

        if(status === 'ACTIVE'){
            if(getRole.access.length === 0){
                return res.status(400).json({
                    message:'Assign Access first!'
                })
            }
        }
        else{    
            const getUsers = await models.user_tbl.getAllData({
                where: {
                    user_role_id: id,
                    status:'ACTIVE'
                }
            })

            if(getRole.role_name==='Administrator'){
                return res.status(400).json({
                    message:'Administrator account cannot be de-activated!'
                }) 
            }

            if(getUsers.length > 0){
                return res.status(400).json({
                    message:'Role is in used by active users!'
                }) 
            }
        }

        await models.role_tbl.updateData({
            where:{
                role_id: id
            },
            data:{
                role_status: status
            }
        })

        res.status(200).end()
    }
    catch(e){
        next(e)
    }
}

