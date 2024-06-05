const xlsx = require('exceljs');
const moment = require('moment');
const axios = require('axios').default;
const asciiService = require('../services/asciiService');
const models = require('../models/rata');
const {v4:uuidv4} = require('uuid');
const useGlobalFilter = require('../helpers/filters');
const Sequelize = require('sequelize');

const readUploadedCR = async(filename) => {
    const workbook = new xlsx.Workbook();
    await workbook.xlsx.readFile(filename);

    const headerWs = workbook.getWorksheet('header');
    const detailsWs = workbook.getWorksheet('details');

    let header = []
    let details = []

    const headerColumns = [
        'COMPANY_CODE',	
        'CR_CODE',	
        'REF_CODE',	
        'CR_DATE',	
        'DATE_CONFIRMED',	
        'ITEM_TYPE',	
        'SUPPLIER_CODE',	
        'DEPARTMENT_CODE',	
        'PARTICULAR',	
        'REF_SI_NO',	
        'REF_CROSS',	
        'CR_AMT'
    ]

    const detailColumns = [
        'COMPANY_CODE',	
        'CR_CODE',	
        'LINE_NO',
        'ITEM_CODE',	
        'SERVICE_TYPE_CODE',	
        'PRINCIPAL_CODE',	
        'LOCATION_CODE',	
        'UM_CODE',	
        'QUANTITY',	
        'UNIT_PRICE',	
        'EXTENDED_AMT',	
    ]

    headerWs.eachRow((row,rowNumber) => {
        let data = {}
        row.values.map((item,index) => {
            if(item instanceof Date){
                data[headerColumns[index-1]] = moment(item).format('YYYY-MM-DD')
            }
            else if(item instanceof Object) {
                data[headerColumns[index-1]] = item.result
            }
            else {
                data[headerColumns[index-1]] = item    
            }
        })

        header.push(data)
    })

    detailsWs.eachRow((row,rowNumber) => {
        let data = {}
        row.values.map((item,index) => {
            if(item instanceof Date){
                data[detailColumns[index-1]] = moment(item).format('YYYY-MM-DD')
            }
            else if(item instanceof Object) {
                data[detailColumns[index-1]] = item.result
            }
            else {
                data[detailColumns[index-1]] = item    
            }
        })

        details.push(data)
    })

    header = header.slice(2)
    details = details.slice(2)

    return header.map(item => {
        const id = uuidv4();
        const CONFIRMATION_RECEIPT_DETAIL = details.filter(a => a.CR_CODE === item.CR_CODE).map(a => {
            return {
                ...a,
                fk_header_id: id
            }
        })
        
        return {
            ...item,
            id,
            COMPANY_CODE:'00001',
            ITEM_TYPE:'S',
            CONFIRMATION_RECEIPT_DETAIL
        }
    })

}

const api = axios.create({
    baseURL:process.env.ASCII_API,
    headers:{
        [`Accept`]:'application/json'
    }
})

const login = async() => {
    try{

        const username = process.env.ASCII_USER_NAME
        const password = process.env.ASCII_PASSWORD
        const apiKey = process.env.ASCII_API_KEY

        const token = await api.post('/login',{
            username,
            password,
            api_key:apiKey
        })
        .then(result => {
            return result.data.access_token
        })

        return token
    } 
    catch(e){
       throw e
    }
}

exports.uploadCR = async(file) => {
    const token = await login();
    const cr_data = await readUploadedCR(file.path)
    let details = [];

    const result = await api.post('/get/confirm-receipt',cr_data,{
        headers:{
            ['Content-Type']: 'application/json',
            ['Authorization']: `Bearer ${token}`
        }
    })
    .then(res => {    
        return {
            errors:res.data?.ERROR || [],
            success:res.data?.SUMMARY || []
        }
    })

    const errorLogs = await asciiService.generateErrors(result.errors)
    
    const data = cr_data.map(item => {
        const hasError = errorLogs.find(a => a.ref_code === item.CR_CODE)
        details = details.concat(item.CONFIRMATION_RECEIPT_DETAIL)
        return {
            ...item,
            STATUS: hasError ? 'CR_FAILED' : 'CR_CREATED'
        }
    })

    return {
        data,
        details,
        ascii_success: result.success,
        ascii_errors: result.errors,
        errors: errorLogs.map(item => {
            const header = data.find(a => a.CR_CODE ===item.ref_code)
            return {
                ...item,
                fk_header_id: header.id
            }
        })
    }

}

exports.bulkCreateHeader = async(data= [], stx = null) => {
    return await models.cr_upload_header_tbl.bulkCreate(data, {
        transaction: stx
    })
}

exports.bulkCreateDetails = async(data = [], stx = null) => {
    return await models.cr_upload_details_tbl.bulkCreate(data, {
        transaction: stx
    })
}

exports.bulkCreateErrorLogs = async(data = [], stx = null) => {
    return await models.cr_upload_errors_tbl.bulkCreate(data, {
        transaction: stx
    })
}

exports.getCR = async (query) => {
    const {
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const where = {};

    Object.keys(filters).map(key => {
        
        if(key === 'CR_DATE'){
            const dates = filters.CR_DATE.split(',')
            const from = moment(dates[0]).isValid() ? dates[0] : null;
            const to = moment(dates[1]).isValid() ? dates[1] : null;
            
            if (from && to) {
                return where.CR_DATE = {
                    [Sequelize.Op.between]: [from,to]
                }
            }
        }
        return where[key] = filters[key]
    })

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.cr_upload_header_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count,rows} = await models.cr_upload_header_tbl.findAndCountAll({
        include:[
            {
                model: models.user_tbl,
                required:false
            }
        ],
        order: [['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),
        where:{
            ...filters,
            ...globalFilter   
        }
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows: rows.map(item => {
            const {user_tbl,...newItem} = item;
            return {
                ...newItem,
                uploaded_by: user_tbl.first_name+' '+user_tbl.last_name
            }
        }),
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.getCrHeader = async(filter) => {
    return await models.cr_upload_header_tbl.findOne({
        where:{
            ...filter
        }
    })
}

exports.getPaginatedCrDetails = async(query) => {
    const {
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.cr_upload_details_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count,rows} = await models.cr_upload_details_tbl.findAndCountAll({
        where:{
            ...filters,
            ...globalFilter
        },
        order: [['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),
    })

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.getPaginatedCrError = async(query) => {
    const {
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.cr_upload_errors_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count,rows} = await models.cr_upload_errors_tbl.findAndCountAll({
        include:[
            {
                model: models.user_tbl,
                required:false
            }
        ],
        where:{
            ...filters,
            ...globalFilter
        },
        order: [['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),
    })
    .then(result => JSON.parse(JSON.stringify(result)))
    
    return {
        count,
        rows: rows.map(item => {
            const {user_tbl,...newItem} = item;
            return {
                ...newItem,
                uploaded_by: user_tbl.first_name+' '+user_tbl.last_name
            }
        }),
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.getAllCRHeader = async(filter) => {
    return await models.cr_upload_header_tbl.findAll({
        where:{
            ...filter
        }
    })
    .then(res => JSON.parse(JSON.stringify(res)))
}

exports.getAllCRDetails = async(filter) => {
    return await models.cr_upload_details_tbl.findAll({
        where:{
            ...filter
        }
    })
    .then(res => JSON.parse(JSON.stringify(res)))
}

exports.getAllCRErrors = async(filter) => {
    return await models.cr_upload_errors_tbl.findAll({
        where:{
            ...filter
        }
    })
    .then(res => JSON.parse(JSON.stringify(res)))
}

