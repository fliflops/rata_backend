const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');

exports.getVendor = async (req,res,next) => {
    try{

        const {
            page,
            totalPage,
            search,
            ...filters
        } = req.query;

        const where = {};

        const globalFilter = useGlobalFilter.defaultFilter({
            model:models.vendor_tbl.rawAttributes,
            filters:{
                search
            }
        })
        
        const {count,rows} = await models.vendor_tbl.paginated({
            filters:{
                ...globalFilter
            },
            order:[['createdAt','DESC']],
            page,
            totalPage,
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

exports.updateVendor = async(req,res,next) => {
    try{
        const {vendor_id} = req.query;
        const data = req.body;

        await models.vendor_tbl.updateData({
            data: {
                ...data
            },
            where:{
                vendor_id
            }
        })


        res.status(200).json({
            message:'Success'
        })
    }
    catch(e){
        next(e)
    }
}