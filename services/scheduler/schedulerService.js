const dataLayer = require('./schedulerDataLayer');
const redis = require('../../config/redis');

exports.getAllSchedulers = async({filters})=>{
    try{
        return await dataLayer.getAllSchedulers({
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.updateScheduler = async({filters,data})=>{
    try{
        return await dataLayer.updateSchduler({
            filters,
            data
        })
    }
    catch(e){
        throw e
    }
}

exports.createJobTracker = async({data})=>{
    try {

        return await dataLayer.createJobTracker({
            data
        })
        
    } catch (e) {
        throw e
    }
}

exports.updateJobTracker = async({filters,data})=>{
    try {
        return await dataLayer.updateJobTracker({
            data,
            filters
        })
        
    } catch (e) {
        throw e
    }
}

exports.setRedisScheduler = async()=>{
    try{

        const data = await dataLayer.getAllSchedulers({})

        for(const rows of data){
            await redis.json.set(rows.redis_key,'.',rows)
        }
        
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedJobsDetails = async({filters})=>{
    try{
        let {orderBy,order,page,totalPage,scheduler_id,...newFilters} = filters;

        if(!orderBy){
            orderBy=[]
        }
        else{
            orderBy=[orderBy]
        }

        return await dataLayer.getPaginatedJobsDetails({
            filters:newFilters,
            orderBy,
            page,
            totalPage,
            scheduler_id
        })
    }
    catch(e){
        throw e
    }
}


