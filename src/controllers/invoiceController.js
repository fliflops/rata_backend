const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');
const {helios} = require('../../services');

const {Sequelize}= models;

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
            if(key === 'rdd'){
                return where.rdd = {
                    [Sequelize.Op.between]: filters.rdd.split(',')
                }
            }
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

exports.getTmsInvoices = async(req,res,next) => {
    try{
        const {rdd} = req.query;
        const data = await helios.bookings.getBookingRequest({
            rdd
        })

        //delivery_status
        //rud_status

        res.json({
            details: data.details.splice(0,100)
        })

    }
    catch(e){
        next(e)
    }
}