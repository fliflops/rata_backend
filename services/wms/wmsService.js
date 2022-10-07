const dataLayer = require('./wmsDatalayer');
const _ = require('lodash');

exports.getWMSData = async({date,jobId}) => {
    try{
        const {gr,gi} = await dataLayer.transaction({
            date
        })
        
        const job_id = jobId || null

        const data = gr.concat(gi);
        //group data by headers
        const grouped = _.groupBy(data, item => item.service_type+item.location+item.principal_code+item.wms_reference_no+item.primary_ref_doc+item.vehicle_type)

        //convert data to nested array
        const format = Object.keys(grouped).map(x => {
            const {sku_code,uom,actual_qty,actual_cbm,class_of_store,...header} = grouped[x][0]
            const details = grouped[x]
            
            return {
                ...header,
                job_id: job_id,
                details:details.map(item => {
                    const {service_type,location,principal_code,vehicle_type,transaction_date,...newDetails} = item;
                    return newDetails
                })
            }
        })
        
        return format
    }
    catch(e){
        throw e
    }
}

exports.bulkCreateWMSDataHeader = async({data}) => {
    try{

        return await dataLayer.bulkCreateWMSDataHeader({
            data,
            options:{
                updateOnDuplicate:['updatedAt']
            }
        })

    }
    catch(e){
        throw e
    }
}

exports.updateWMSDateDetails = async({data,filters}) => {
    try{

        return await dataLayer.updateWMSDateDetails({
            data,
            filters
        })

    }
    catch(e){
        throw e
    }
}
