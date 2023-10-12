const models = require('../models/rata');
const {Sequelize:{Op}} = models;

const dataExportService = require('../services/dataExportService');

exports.exportInvoice = async(req,res,next) => {
    try{
        const {from,to} = req.query;

        const headers= []
        let details = []

        const getInvoices = await models.helios_invoices_hdr_tbl.getData({
            where:{
                rdd: {
                    [Op.between]: [from,to]
                }
            },
            options: {
                include: [
                    {
                        model: models.helios_invoices_dtl_tbl,
                        required: false
                    }
                ]
            }
        })

        getInvoices.map(item => {
            const {helios_invoices_dtl_tbls,...header} = item;
       
            headers.push({
                ...header
            })

            details = details.concat(helios_invoices_dtl_tbls)
        })

        const xlsx = await dataExportService.generateExcel({
            headers,
            details
        })

        res.set('Content-disposition',`transport_invoice.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
     
    }
    catch(e){
        next(e)
    }
}

exports.exportDraftBill = async(req,res,next) => {
    try{
        const {
            from,
            to
        } = req.query;

        const headers=[];
        let db_details=[];

        const getDraftBills = await models.draft_bill_hdr_tbl.getData({
            where:{
                draft_bill_date:{
                    [Op.between] : [from,to]
                }
            },
            options:{
                include: [
                    {
                        model: models.draft_bill_details_tbl,
                        required: false,
                        as:'details'
                    }
                ]
            }
        })

        getDraftBills.map(item => {
            const {details,...header} = item

            headers.push({
                ...header
            })

            db_details = db_details.concat(details)
        })


        const xlsx = await dataExportService.generateExcel({
            headers,
            details: db_details
        })

        res.set('Content-disposition',`transport_draft_bill.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
     
        
    }
    catch(e){
        next(e)
    }
}

exports.exportRevenueLeak = async(req,res,next) => {
    try{
        const {from,to} = req.query;
        const headers = [];
        let details = [];
        const getRevenueLeaks = await models.transport_rev_leak_hdr_tbl.getData({
            where:{
                rdd: {
                    [Op.between] : [from,to]
                }
            },
            options:{
                include: [
                    {
                        model:models.helios_invoices_hdr_tbl,
                        required:false
                    },
                    {
                        model:models.tranport_rev_leak_dtl_tbl,
                        required: false
                    }
                ]
            }
        })

        getRevenueLeaks.map(item => {
            const {helios_invoices_hdr_tbl,tranport_rev_leak_dtl_tbls,...header} = item;
            
            headers.push({
                draft_bill_type: header.draft_bill_type,
                class_of_store: header.class_of_store,
                revenue_leak_reason: header.revenue_leak_reason,
                is_draft_bill: header.is_draft_bill === 1 ? 'true' : 'false',
                ...helios_invoices_hdr_tbl,
            })

            details = details.concat(tranport_rev_leak_dtl_tbls)

        })

        const xlsx = await dataExportService.generateExcel({
            headers,
            details
        })

        res.set('Content-disposition',`transport_revenue_leak.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    
        res.send(xlsx)

    }
    catch(e){
        next(e)
    }
}

exports.exportContract = async(req,res,next) => {
    try{
        const {contract_id, from, to,service_type} = req.query;
        const contracts = [];
        let tariffs = [];
        let filter = {};
        let serviceTypeFilter = {};

        if(from && to) {    
            filter = {
                [Op.and] : {
                    valid_from: {
                        [Op.gte]:from
                    },
                    valid_to: {
                        [Op.lte]:to
                    }
                }   
            }
        }

        if(service_type) {
            serviceTypeFilter.service_type = service_type;
        }

        const getContracts = await models.contract_hdr_tbl.getContracts({   
            where:{
                contract_id,
            },
            options:{
                include: [
                    {
                        model: models.contract_tariff_dtl,
                        include: [
                            {
                                model: models.tariff_sell_hdr_tbl,
                                required: true,
                                where:{
                                    ...serviceTypeFilter
                                }
                            }
                        ],
                        where: {
                            status: 'ACTIVE',
                            ...filter
                        },
                        required: false
                    }
                ]
            }
        })

        getContracts.map(item => {
            const {contract_tariff_dtls,...header} = item;
            contracts.push(header)
            tariffs = tariffs.concat(contract_tariff_dtls)
        })

        const xlsx = await dataExportService.generateExcel({
            contracts,
            tariffs
        })

        res.set('Content-disposition',  `transport_contract.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)

    }
    catch(e){
        next(e)
    }
}

exports.exportTariff = async(req,res,next) => {
    try{
        const {location} = req.query;
        
        const getTariffs = await models.tariff_sell_hdr_tbl.getData({
            where:{
                location
            }
        })
        const xlsx = await dataExportService.generateExcel({
            tariff: getTariffs
        })

        res.set('Content-disposition',`transport_tariff.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}

exports.exportGeography = async(req,res,next) => {
    try{
        
        const country = await models.geo_country_tbl.getData({})
        const regions = await models.geo_region_tbl.getData({})
        const province = await models.geo_province_tbl.getData({})
        const city = await models.geo_city_tbl.getData({})
        const brgy = await models.geo_barangay_tbl.getData({})

        const xlsx = await dataExportService.generateExcel({
            country,
            regions,
            province,
            city,
            brgy
        })

        res.set('Content-disposition',  `geography.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}

exports.exportVendor = async(req,res,next) => {
    try{
        const vendors = await models.vendor_tbl.getData({})
        const vendor_groups = await models.vendor_group_tbl.getData({})
        const vendor_group_detail = await models.vendor_group_dtl_tbl.getData({})
        
        
        const xlsx = await dataExportService.generateExcel({
            vendors,
            vendor_groups,
            vendor_group_detail
        })

        res.set('Content-disposition',  `vendors.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}

exports.exportPrincipal = async(req,res,next) => {
    try{
        const principals = await models.principal_tbl.getData({})
        
        const xlsx = await dataExportService.generateExcel({
            principals
        })

        res.set('Content-disposition',  `principals.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}

exports.exportShipPoint = async(req,res,next) => {
    try{
        const ship_points = await models.ship_point_tbl.getData({})
        
        const xlsx = await dataExportService.generateExcel({
            ship_points
        })

        res.set('Content-disposition',  `ship_points.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}

exports.exportLocation = async(req,res,next) => {
    try{
        const locations = await models.location_tbl.getData({})
        
        const xlsx = await dataExportService.generateExcel({
            locations
        })

        res.set('Content-disposition',  `location.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}

exports.exportQuickCode = async (req,res,next) => {
    try{
        const quickCodes = await models.quick_code_tbl.getData({})

        const xlsx = await dataExportService.generateExcel({
            'quick-code':quickCodes
        })

        res.set('Content-disposition',  `quick-codes.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}

exports.exportAlgorithm = async(req,res,next) => {
    try{
        const algorithm = await models.agg_tbl.getData({})
        const details = await models.agg_conditions_tbl.getData({})

        const xlsx = await dataExportService.generateExcel({
            algorithm,
            details
        })

        res.set('Content-disposition',  `algorithm.xlsx`);
        res.set('Content-type',         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}