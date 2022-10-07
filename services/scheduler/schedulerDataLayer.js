const models = require('../../models');
const {viewFilters} = require('../../helper');


const getAllSchedulers = async({filters}) => {
    try{
        return await models.scheduler_setup_tbl.findAll({
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

const getPaginatedJobsDetails = async({
    filters,
    page,
    totalPage,
    orderBy,
    scheduler_id
}) => {
    try{

        let newFilter=viewFilters.globalSearchFilter({
            model:models.tariff_wms_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        return await models.scheduler_auto_sync_trckr_tbl.findAndCountAll({
            where:{
                ...newFilter,
                scheduler_id
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
    catch(e){
        throw e
    }
}

const updateSchduler = async({data,filters}) => {
    try{
        return await models.scheduler_setup_tbl.update(
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

const createJobTracker = async ({data,options}) => {
    try {  

        return await models.scheduler_auto_sync_trckr_tbl.create({
            ...data
        },{
            ...options
        })
    } 
    catch (e) {
        throw e    
    }
}

const updateJobTracker = async ({data,filters,options}) => {
    try {
        return await models.scheduler_auto_sync_trckr_tbl.update({
            ...data
        },
        {
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

module.exports = {
    getAllSchedulers,
    updateSchduler,
    createJobTracker,
    updateJobTracker,
    getPaginatedJobsDetails
}
