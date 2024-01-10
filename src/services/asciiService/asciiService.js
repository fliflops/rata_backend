const _ = require('lodash')
const xlsx = require('xlsx');
const round = require('../../helpers/round');
const models = require('../../models/rata');

const useGlobalFilter = require('../../helpers/filters');
const moment = require('moment');

const {Sequelize} = models;

exports.asciiSalesOrder = async (data) => {
    try{
        return data.map(header => {
            let SALES_ORDER_DETAIL;
            const details = header.details
            //removed the standard rounding of numbers;
            const SO_AMT  = Number(header.total_charges)

            const quantity = ['2002','2003','2004','2008'].includes(details[0].service_type) ? 1 : round(_.sumBy(details,(i)=>{
                if(String(header.min_billable_unit).toLowerCase() === 'cbm'){
                    return Number(i.actual_cbm)
                }
                if(String(header.min_billable_unit).toLowerCase() === 'weight'){
                    return Number(i.actual_weight)
                }
                if(['CASE','PIECE'].includes(String(header.min_billable_unit).toUpperCase())){
                    return Number(i.actual_qty)
                }
            }),2)

            if(header.customer === '10005' && String(details[0].class_of_store).toUpperCase() === 'COLD') {
                SALES_ORDER_DETAIL=[
                        {
                            COMPANY_CODE:   '00001',
                            SO_CODE:        header.draft_bill_no,
                            ITEM_CODE:      header.ascii_item_code,
                            LINE_NO:        1,
                            LOCATION_CODE:  header.ascii_loc_code,
                            UM_CODE:        ['2002','2003','2004','2008'].includes(details[0].service_type) ? 'lot' : details[0].min_billable_unit,
                            QUANTITY:       1,
                            UNIT_PRICE:     SO_AMT,   
                            EXTENDED_AMT:   SO_AMT                    
                        }
                    ]
                }
            else if(header.customer === '10002' && details[0].service_type === '2001') {
                const isEqual = quantity * Number(header.rate) ===  SO_AMT;
                SALES_ORDER_DETAIL=[{
                    COMPANY_CODE:   '00001',
                    SO_CODE:        header.draft_bill_no,
                    ITEM_CODE:      header.ascii_item_code,
                    LINE_NO:        1,
                    LOCATION_CODE:  header.ascii_loc_code,
                    UM_CODE:        header.min_billable_unit,
                    QUANTITY:       isEqual ? quantity : 1,    
                    UNIT_PRICE:     isEqual ? Number(header.rate) : SO_AMT,   
                    EXTENDED_AMT:   SO_AMT
                }]
            }
            else{

                SALES_ORDER_DETAIL=[{
                    COMPANY_CODE:   '00001',
                    SO_CODE:        header.draft_bill_no,
                    ITEM_CODE:      header.ascii_item_code,
                    LINE_NO:        1,
                    LOCATION_CODE:  header.ascii_loc_code,
                    UM_CODE:        ['2002','2003','2004','2008'].includes(header.service_type) ? 'lot' : header.min_billable_unit,
                    QUANTITY:       quantity < Number(header.min_billable_value) ? Number(header.min_billable_value) : quantity,    
                    UNIT_PRICE:     Number(header.rate),   
                    EXTENDED_AMT:   SO_AMT//round(round(((Number(header.rate) * quantity )* 100),2) / 100,2)          
                }]
            }

            const mgvParticulars = quantity < Number(header.min_billable_value) ? `MGV=${Number(header.min_billable_value).toFixed(2)}${header.min_billable_unit};TotalActual${header.min_billable_unit}=${quantity}`: ''

            return {
                COMPANY_CODE:   '00001',
                SO_CODE:        header.draft_bill_no,
                ITEM_TYPE:      'S',
                SO_DATE:        header.draft_bill_date,
                CUSTOMER_CODE:  header.ascii_customer_code,
                PARTICULAR:     details.map(i => i.invoice_no).join(',')+mgvParticulars,
                REF_EUPO:       details[0].trip_plan,
                REF_CROSS:      header.contract_id,
                SO_AMT,
                SALES_ORDER_DETAIL
            }
        })

    }
    catch(e){
        throw e
    }
}

exports.asciiConfirmationReceipt = async(data) => {
    try{

        return data.map(header => {
            const details = header.details
            const amount = Number(header.total_charges);
            
            const CONFIRMATION_RECEIPT_DETAIL = [{
                COMPANY_CODE:       '00001',
                CR_CODE:            header.draft_bill_no,
                ITEM_CODE:          header.ascii_item_code,
                LINE_NO:            1,
                SERVICE_TYPE_CODE:  header.ascii_service_type,
                PRINCIPAL_CODE:     header.ascii_principal_code,
                LOCATION_CODE:      header.ascii_loc_code,
                UM_CODE:            details[0].vehicle_type,
                QUANTITY:           1,
                UNIT_PRICE:         amount,//_.round(header.total_charges,2),
                EXTENDED_AMT:       amount//_.round(header.total_charges,2)
            }]

            return {
                COMPANY_CODE:       '00001',
                CR_CODE:            header.draft_bill_no,
                REF_CODE:           details[0].trip_plan,
                CR_DATE:            header.draft_bill_date,
                DATE_CONFIRMED:     header.draft_bill_date,
                ITEM_TYPE:          'S',
                SUPPLIER_CODE:      header.ascii_vendor_code,
                DEPARTMENT_CODE:    header.ascii_service_type,
                PARTICULAR:         details.map(i => i.invoice_no).join(','),
                REF_SI_NO:          'n/a',
                REF_CROSS:          header.contract_id,
                CR_AMT:             amount,//_.round(header.total_charges,2),
                CONFIRMATION_RECEIPT_DETAIL
            }
        })

    }
    catch(e){
        throw e
    }
}

exports.generateResult = async({
    errors,
    success,
    data
}) => {
    try{

        const wb = xlsx.utils.book_new();

        let error_details = []
        let error_header = []

        Object.keys(errors).map(item => {
            const details = errors[item].DETAILS
            
            details.map(item => {
                Object.keys(item).map(key => {
                    item[key].map(data => {
                        error_details.push({
                            ...data
                        })
                    })
                })
            })
        })

        errors.map(item => {
            item.HEADER.map(item => {
                error_header.push({
                    ...item
                })
            })
        })
        
        const successWs = xlsx.utils.json_to_sheet(success)
        xlsx.utils.book_append_sheet(wb,successWs,'success');
     
        const errorDetails = xlsx.utils.json_to_sheet(error_details)
        xlsx.utils.book_append_sheet(wb,errorDetails,'error_details');

        const errorHeader = xlsx.utils.json_to_sheet(error_header)
        xlsx.utils.book_append_sheet(wb,errorHeader,'error_header');

        const transmittalData = xlsx.utils.json_to_sheet(data)
        xlsx.utils.book_append_sheet(wb,transmittalData,'data');

        return buf = xlsx.write(wb,{
            type:'buffer', bookType:"xlsx"
        })
    }
    catch(e){
        console.log(e)
        throw e
    }
}

exports.generateErrors = async(errors) => {
    let data = [];

    Object.keys(errors).map(item => {
        const details = errors[item].DETAILS
        details.map(item => {
            Object.keys(item).map(key => {
                item[key].map(data => {
                    data.push({
                        ref_code:data.REF_CODE,
                        field_name:data.FIELD_NAME,
                        field_value:data.FIELD_VALUE,
                        response_code:data.RESPONSE_CODE,
                        message:data.MESSAGE,
                        result_type:'DETAILS'
                    })
                })
            })
        })
    })

    errors.map(item => {
        item.HEADER.map(item => {
            data.push({
                ref_code:item.REF_CODE,
                field_name:item.FIELD_NAME,
                field_value:item.FIELD_VALUE,
                response_code:item.RESPONSE_CODE,
                message:item.MESSAGE,
                result_type:'HEADER'
            })
        })
    })

    return data
}

exports.getDraftBills = async(query) => {
    const {
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const where = {};

    Object.keys(filters).map(key =>  {
        if(key === 'draft_bill_type'){
            return where[key] = filters[key]   
        }
        if(key === 'trip_date'){
            const dates = filters.trip_date.split(',')
            const from = moment(dates[0]).isValid() ? dates[0] : null;
            const to = moment(dates[1]).isValid() ? dates[1] : null;
            
            if (from && to) {
                return where.trip_date = {
                    [Sequelize.Op.and]: {
                        [Sequelize.Op.gte] : from,
                        [Sequelize.Op.lte] : to
                    } 
                }
            }
        }
        if(key === 'draft_bill_date'){
            const dates = filters.draft_bill_date.split(',')
            const from = moment(dates[0]).isValid() ? dates[0] : null;
            const to = moment(dates[1]).isValid() ? dates[1] : null;
            
            if (from && to) {
                return where.draft_bill_date = {
                    [Sequelize.Op.and]: {
                        [Sequelize.Op.gte] : from,
                        [Sequelize.Op.lte] : to
                    } 
                }
            }

        }
        else{
            return where[key] = filters[key]
        }
    })

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.draft_bill_hdr_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count,rows} = await models.draft_bill_hdr_tbl.findAndCountAll({
        include:[
            {
                model: models.draft_bill_ascii_hdr_tbl,
                required:false,
                as:'attempts',
                include:[
                    {
                        model: models.user_tbl,
                        required:false
                    } 
                ],  
            },
            {
                model:models.draft_bill_details_tbl,
                required:false,
                as:'details'
            }
        ],
        attributes:[
            [
                Sequelize.literal(`(
                    Select MAX(createdAt)
                    from draft_bill_ascii_hdr_tbl
                    where draft_bill_ascii_hdr_tbl.draft_bill_no = draft_bill_hdr_tbl.draft_bill_no
                )`),
                'last_transmitted_date'
            ],
            [
                Sequelize.literal(`(
                    Select MIN(createdAt)
                    from draft_bill_ascii_hdr_tbl as attempts
                    where attempts.draft_bill_no = draft_bill_hdr_tbl.draft_bill_no
                )`),
                'first_transmitted_date'
            ],
        ].concat(Object.keys(models.draft_bill_hdr_tbl.getAttributes()).map(field => field)),
        where:{
            is_transmitted: 1,
            ...where,
            ...globalFilter

        },  
        
        order:[[Sequelize.literal('last_transmitted_date'),'DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage)        
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows: rows.map(item => {
            const {attempts,details,...data} = item;
            const lastAttempt = _.maxBy(attempts, (value) => moment(value.createdAt))
            const user = lastAttempt?.user_tbl;

            let actual_quantity = 0;

            // if(data.min_billable_unit === 'CBM') {
            //     actual_quantity = _.sumBy(details, item => Number(item.actual_cbm)).toFixed(2)
            // }
            // else{
            //     actual_quantity = _.sumBy(details, item => Number(item.actual_qty)).toFixed(2)
            // }

            return {
                ...data,
                transmittal_count: attempts.length,
                last_transmitted_by: user ? `${user?.first_name} ${user?.last_name}` : null,
                actual_quantity: _.sumBy(details, item => Number(item.actual_qty)).toFixed(2),
                actual_cbm: _.sumBy(details, item => Number(item.actual_cbm)).toFixed(2)
            }
        }),
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.getDraftBill = async(query) => {
    return await models.draft_bill_hdr_tbl.findOne({
        where:{
            ...query
        }
    })
    .then(result => result ?  JSON.parse(JSON.stringify(result)):null)
}

exports.getLogHeader = async(query) => {
    const {page,totalPage,search,...filters} = query;

    const searchFilter = useGlobalFilter.transmittalHeaderFilter(models.draft_bill_ascii_hdr_tbl.getAttributes(),search);

    const {count,rows} = await models.draft_bill_ascii_hdr_tbl.findAndCountAll({
        include:[
            {
                model: models.user_tbl,
                required:false
            }
        ],
        where:{
            ...filters,
            ...searchFilter
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage)    
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows: rows.map(item => {
            const {user_tbl,...data} = item;

            return {
                ...data,
                user: user_tbl ?  `${user_tbl.first_name} ${user_tbl.last_name}` : null
            }
        }),
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.getLogDetail = async(query) => {
    const {page,totalPage,search,...filters} = query;

    const searchFilter = useGlobalFilter.transmittalHeaderFilter(models.draft_bill_ascii_dtl_tbl.getAttributes(),search);

    const {count,rows} = await models.draft_bill_ascii_dtl_tbl.findAndCountAll({
        where:{
            ...filters,
            ...searchFilter
        },
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage)    
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.updateDraftBill = async (data,filter,stx=null) => {
    return await models.draft_bill_hdr_tbl.update({
        ...data
    },
    {
        where:{
            ...filter
        },
        transaction: stx
    })
}

exports.createTransmittalLogHeader=async(data = [],stx = null)=>{
    const result = await models.draft_bill_ascii_hdr_tbl.bulkCreate(data,{
        transaction: stx
    })

    return JSON.parse(JSON.stringify(result))
}

exports.createTransmittalLogDtl=async(data=[], stx = null) => {
    return await models.draft_bill_ascii_dtl_tbl.bulkCreate(data,{
        transaction: stx ?? null 
    })
}

