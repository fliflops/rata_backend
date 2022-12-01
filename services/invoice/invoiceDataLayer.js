const models = require('../../models');
const {sequelize,Sequelize} = models;
const {Op} = Sequelize;
const {useFormatFilters,viewFilters} = require('../../helper')


//Helios Invoice Table

const bulkCreateHeliosInvoices = async ({
    data,
    options
}) => {
    try{
        return await models.helios_invoices_hdr_tbl.bulkCreate(data,{
            ...options,
            updateOnDuplicate: ['updatedAt','vehicle_type','vehicle_id','trip_no'],
            include:[
                {
                    model:models.helios_invoices_dtl_tbl,
                    as:'details'
                }
            ]
        })
    }
    catch(e){
        throw e
    }
}


const createInvoice = async({
    data,
    options
}) => {
    try{    
        return await models.invoices_cleared_hdr.bulkCreate(
            data
        ,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const createInvoiceDtl = async ({
    data,
    options
}) => {
    try{    
        return await models.invoices_dtl_tbl.bulkCreate(
            data,
        {
            ...options
        })

    }
    catch(e){
        throw e
    }
}

const createInvoiceTransaction = async({
    invoices,
    details
}) => {
    try{
        return await sequelize.transaction(async t => {
            await createInvoice({
                data:invoices,
                options:{
                    transaction: t,
                    updateOnDuplicate:['updatedAt','cleared_date','remarks'],
                    logging:false
                }
            })

            await createInvoiceDtl({
                data:details,
                options:{
                    transaction: t,
                    updateOnDuplicate:['updatedAt'],
                    logging:false
                }
            })
        })
        
    }
    catch(e){
        throw e
    }
}   

const getLatestInvoice = async() => {
    try{
        return await models.invoices_tbl.findOne({
            where:{},
            order:[['createdAt','DESC']]
        })
    }
    catch(e){
        throw e
    }
}

const getAllInvoice = async({filters}) => {
    try{
        
        return await models.invoices_cleared_hdr.findAll({
            include:[
                {
                    model:models.invoices_dtl_tbl,
                    attributes:['trip_no','br_no','class_of_store','uom','planned_qty','planned_weight','planned_cbm','actual_qty','actual_weight','actual_cbm','return_qty'],
                    required:false,
                    as:"details"
                },
                {
                    model:models.contract_hdr_tbl,
                    attributes:["contract_id","contract_type"],
                    where:{
                        contract_status:'APPROVED',
                        contract_type: typeof filters.is_processed_sell !== 'undefined' ? 'SELL' : 'BUY' 
                    },
                    required:false,
                    as:"contract"
                },
                {
                    model:models.ship_point_tbl,
                    attributes:['stc_code','stc_description','stc_name','stc_address','country','region','province','city','barangay'],
                    required:false,
                    as:'ship_point_from'
                },
                {
                    model:models.ship_point_tbl,
                    attributes:['stc_code','stc_description','stc_name','stc_address','country','region','province','city','barangay'],
                    required:false,
                    as:'ship_point_to'
                },
                {
                    model:models.vendor_group_dtl_tbl,
                    attributes:['vg_code'],
                    required:false, 
                    where:{
                        [Op.and]:[
                            sequelize.where(sequelize.col('vendor_group.location'),sequelize.col('invoices_cleared_hdr.location'))
                        ]
                    },
                    as:'vendor_group'
                }
            ],
            where:{
                ...filters,
            },
            // logging:false
        })
        .then(result => JSON.parse(JSON.stringify(result)))
        
    }
    catch(e){
        throw e
    }
}

const updateInvoice = async({data,options,filters}) => {
    try{
        return await models.invoices_cleared_hdr.update(
            {   
                ...data
            },
            {
                where:{
                    ...filters
                },
                ...options
            }
        )
    }
    catch(e){
        throw e
    }
}

const updateRevenueLeak = async({
    filters,data,options
}) => {
    try{
        return await models.invoices_rev_leak_tbl.update({   
            ...data
        },
        {
            where:{
                ...filters
            },
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const createRevenueLeak = async({
    data,
    options
}) => {
    try{    
        return await models.invoices_rev_leak_tbl.bulkCreate(
            data
        ,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const getPaginatedRevenueLeak = async({
    filters,
    orderBy,
    page,
    totalPage
})=>{
    try{
        const attributes = Object.keys(models.invoices_cleared_hdr.rawAttributes)
        let where = useFormatFilters.revenueLeakFilter({
            model:models.invoices_cleared_hdr.rawAttributes,
            filters
        })
        
        const {count,rows} = await models.invoices_rev_leak_tbl.findAndCountAll({
            include:[
                {
                    model:models.invoices_cleared_hdr,
                    attributes:attributes.filter(item => !['id','invoice_no','is_processed_sell','is_processed_buy','created_by','updated_by','createdAt','updatedAt'].includes(item)),
                    as:"invoice"
                }
            ],
            where:{
                ...where,
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            //order: [[orderBy,desc]]
            order:[orderBy]
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })

        return {
            count,
            rows
        }
    }
    catch(e){
        throw e
    }
}

const getAllRevenueLeak = async({filters}) => {
    try{
        // console.log(filters)
        const attributes = Object.keys(models.invoices_cleared_hdr.rawAttributes)
        
        return await models.invoices_rev_leak_tbl.findAll({
            include:[
                {
                    model:models.invoices_cleared_hdr,
                    attributes:attributes.filter(item => !['id','invoice_no','is_processed_sell','is_processed_buy','created_by','updated_by','createdAt','updatedAt','principal_name','trucker_name','stc_from_name','stc_to_name'].includes(item)),
                    include:[
                        {
                            model:models.contract_hdr_tbl,
                            attributes:["contract_id","contract_type"],
                            where:{
                                contract_status:'APPROVED',
                                contract_type:filters.draft_bill_type
                            },
                            required:false,
                            as:"contract"
                        },
                        {
                            model:models.ship_point_tbl,
                            attributes:['stc_code','stc_description','stc_name','stc_address','country','region','province','city','barangay'],
                            required:false,
                            as:'ship_point_from'
                        },
                        {
                            model:models.ship_point_tbl,
                            attributes:['stc_code','stc_description','stc_name','stc_address','country','region','province','city','barangay'],
                            required:false,
                            as:'ship_point_to'
                        },
                        {
                            model:models.invoices_dtl_tbl,
                            attributes:['trip_no','br_no','class_of_store','uom','planned_qty','planned_weight','planned_cbm','actual_qty','actual_weight','actual_cbm','return_qty'],
                            required:false,
                            as:"details"
                        },
                        {
                            model:models.vendor_group_dtl_tbl,
                            attributes:['vg_code'],
                            required:false, 
                            where:{
                                [Op.and]:[
                                    sequelize.where(sequelize.col('invoice.vendor_group.location'),sequelize.col('invoice.location'))
                                ]
                            },
                            as:'vendor_group'
                        },
                        {
                            model:models.principal_tbl,
                            attributes:['principal_name'],
                            as:'principal_tbl'
                        }
                    ],
                    as:"invoice"
                }
            ],
            where:{
                ...filters  
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}

const getPaginatedInvoices = async({
    filters,
    orderBy,
    page,
    totalPage
})=>{
    try{
        const filter = viewFilters.globalSearchFilter({
            model:models.invoices_cleared_hdr.rawAttributes,
            filters
        })

        return await models.invoices_cleared_hdr.findAndCountAll({
            //include:[
                // {
                //     model:models.invoices_dtl_tbl,
                //     attributes:['trip_no','br_no','class_of_store','uom','planned_qty','planned_weight','planned_cbm','actual_qty','actual_weight','actual_cbm','return_qty'],
                //     required:false,
                //     as:"details"
                // },
                // {
                //     model:models.contract_hdr_tbl,
                //     attributes:["contract_id","contract_type"],
                //     where:{
                //         contract_status:'APPROVED',
                //         contract_type:'SELL'
                //     },
                //     required:false,
                //     as:"contract"
                // },
                // {
                //     model:models.ship_point_tbl,
                //     attributes:['stc_code','stc_description','stc_name','stc_address','country','region','province','city','barangay'],
                //     required:false,
                //     as:'ship_point_from'
                // },
                // {
                //     model:models.ship_point_tbl,
                //     attributes:['stc_code','stc_description','stc_name','stc_address','country','region','province','city','barangay'],
                //     required:false,
                //     as:'ship_point_to'
                // },
                // {
                //     model:models.vendor_group_dtl_tbl,
                //     attributes:['vg_code'],
                //     required:false,
                //     as:'vendor_group'
                // }
            //],
            where:{
                ...filter 
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            //order: [[orderBy,desc]]
            order:[orderBy],
            logging:false
        })
        .then(result => {
           return {count,rows} = JSON.parse(JSON.stringify(result))
        })

    }
    catch(e){
        throw e
    }
}

const getInvoiceDetails = async({filters})=>{
    try{
        return await models.invoices_dtl_tbl.findAll({
            include:[
                {
                    model:models.invoices_cleared_hdr,
                    as:'invoices_cleared'
                },
                {
                    model:models.invoices_rev_leak_tbl,
                    as:'invoices_rev_leak'
                }
            ],
            where:{
                ...filters
            }
        })
        .then(result=> JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}

module.exports={
    createInvoice,
    createInvoiceDtl,
    createInvoiceTransaction,
    getLatestInvoice,
    getAllInvoice,
    updateInvoice,
    updateRevenueLeak,
    createRevenueLeak,
    getPaginatedRevenueLeak,
    getAllRevenueLeak,
    getPaginatedRevenueLeak,
    getPaginatedInvoices,
    getInvoiceDetails,
    bulkCreateHeliosInvoices
}