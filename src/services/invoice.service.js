const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters')
const {Sequelize} = models;

exports.getPaginatedInvoice = async(query) => {
    const {
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const where = {};

    Object.keys(filters).map(key => {
        if(key === 'rdd'){
            return where.rdd = {
                [Sequelize.Op.between]: filters.rdd.split(',')
            }
        }
        if(key === 'trip_date'){
            return where.trip_date = {
                [Sequelize.Op.between]: filters.trip_date.split(',')
            }
        }
        
        return where[key] = filters[key]
    })

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.helios_invoices_hdr_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count,rows} = await models.helios_invoices_hdr_tbl.findAndCountAll({
        include:[
            {
                model: models.service_type_tbl,
                required:false
            }
        ],
        where:{
            ...where,
            ...globalFilter
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage)
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows: rows.map(({service_type_tbl,...invoices})=> {
            return {
                ...invoices,
                ascii_service_type: service_type_tbl?.ascii_service_type
            }
        }),
        pageCount: Math.ceil(count/totalPage)
    }
    
}