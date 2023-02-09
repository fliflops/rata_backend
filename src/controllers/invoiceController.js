const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');

exports.getInvoices = async(req,res,next) => {
    try{
        const {
            page,
            totalPage,
            search,
            ...filters
        } = req.query;

        const where = {};

        Object.keys(filters).map(key => {
            return where[key] = filters[key]
        })

        const globalFilter = useGlobalFilter.defaultFilter({
            model: models.helios_invoices_hdr_tbl.rawAttributes,
            filters:{
                search
            }
        })

        const {count,rows} = await models.helios_invoices_hdr_tbl.paginated({
            filters:{
                ...where,
                ...globalFilter
            },
            order:[['createdAt','DESC']],
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