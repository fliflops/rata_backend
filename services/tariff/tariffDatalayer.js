const models = require('../../models');
const {sequelize,Sequelize} = models;
const moment = require('moment');
const {viewFilters} = require('../../helper');


const createTariffCondition = async({
    data,
    options
}) => {
    try{
        return await models.tariff_type_cond.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const getTariff = async({filter,options}) => {
    try{
        return await models.tariff_sell_hdr_tbl.findOne({
            where:{
                ...filter
            },
            include:[
                {
                    model:models.contract_tariff_dtl,
                    attributes:['tariff_id','contract_id'],
                    as:'contract'
                }
            ],
            // logging:false
        })
        .then(result => !result ? null : result.toJSON())
    }
    catch(e){
        throw e
    }
}


const updateTariff = async({filters,data,option}) => {
    try{
        return await models.tariff_sell_hdr_tbl.update(
            {
                ...data
            },
            {
                where:{
                    ...filters
                }
            }
        )
    }
    catch(e){
        throw e
    }
}

const createTariff = async({data,options}) => {
    try{
        const tariff = await getTariff({
            filter:{
                tariff_id: data.tariff_id
            }
        })

        if(!tariff){
            const {modified_by,approved_by,...newData} = data
            await models.tariff_sell_hdr_tbl.create(newData,
            {
                ...options
            })  
        }
        else{
            const {tariff_id,created_by,approved_by,...filteredData} = data
            
            let newData;

            if(data.tariff_status === 'APPROVED'){
                newData = {
                    ...filteredData,
                    approved_by:data.approved_by,
                    approved_date:moment().format("YYYY-MM-DD HH:mm:ss").toString()
                }
            }
            else{
                newData={
                    ...filteredData
                }
            }
            
            await updateTariff({
                filters:{
                    tariff_id: data.tariff_id
                },
                data:{
                    ...newData
                }
            })
        }
    }
    catch(e){
        throw e
    }
}

const bulkCreateTariff = async({data,options}) => {
    try{
        return await models.tariff_sell_hdr_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateWMSTariff = async({data,options})=>{
    try{

        return await models.tariff_wms_tbl.bulkCreate(data,{
            ...options
        })

    }
    catch(e){
        throw e
    }
}


const getPaginatedTariff = async({
    filters,
    page,
    totalPage
})=>{
    try{
        let newFilter=viewFilters.globalSearchFilter({
            model:models.tariff_sell_hdr_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        const {count,rows} = await models.tariff_sell_hdr_tbl.findAndCountAll({
            where:{
                ...newFilter
            },
            order:[['createdAt','DESC']],
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage)
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


const getAllTariff = async({filters}) => {
    try{
        // console.log(filters)
        return await models.tariff_sell_hdr_tbl.findAll({
            where:{
                ...filters
            },
            logging:false
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}


//wms tariff section
const createWMSTariff = async({data,options})=>{
    try{

        return await models.tariff_wms_tbl.create(data,{
            ...options
        })

    }
    catch(e){
        throw e
    }
}

const getAllWMSTariff = async({filters}) => {
    try{
        return await models.tariff_wms_tbl.findAll({
            where:{
                ...filters
            }
        })
    }
    catch(e){
        throw e
    }
}

const updateWMSTariff = async({filters,data,options})=>{
    try {

        return await models.tariff_wms_tbl.update({
            ...data
        },{
            where:{
                ...filters
            },
            ...options
        })

    } 
    catch (e) {
        throw e    
    }
}

const getPaginatedWMSTariff = async({
    filters,
    page,
    totalPage,
    orderBy
})=>{
    try {

        let newFilter=viewFilters.globalSearchFilter({
            model:models.tariff_wms_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        return await models.tariff_wms_tbl.findAndCountAll({
            where:{
                ...newFilter
            },
            offset:parseInt(page)*parseInt(totalPage),
            limit:parseInt(totalPage),
            order:orderBy
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })
        
    } 
    catch (e) {
        throw e
    }
}

module.exports = {
    createTariffCondition,
    // createTariffType,
    createTariff,
    bulkCreateTariff,
    bulkCreateWMSTariff,
    // getAllTariffTypes,
    getPaginatedTariff,
    updateTariff,
    getTariff,
    getAllTariff,
    createWMSTariff,
    getAllWMSTariff,
    updateWMSTariff,
    getPaginatedWMSTariff
}