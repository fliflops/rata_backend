const dataLayer = require('./wmsDatalayer');
const _ = require('lodash');

exports.getWMSData = async({date,jobId}) => {
    try{
        let header = [];
        let details = [];
        const {gr,gi} = await dataLayer.transaction({
            date
        })

        const data = gr.concat(gi)
        
        const job_id = jobId || null;

        const grouped = _.groupBy(data, item => item.wms_reference_no)
        const wms = Object.keys(grouped).map(x => {
            const {sku_code,uom,actual_qty,actual_cbm,class_of_store,...wms_header} = grouped[x][0]
            const wms_details = grouped[x];            

            header.push({
                ...wms_header,
                job_id: job_id
            })

            wms_details.map(item => {
                const {service_type,location,principal_code,vehicle_type,transaction_date,...newDetails} = item;
                details.push({
                    ...newDetails,
                })
            })

            return {
                ...wms_header,
                job_id: job_id,
                details:details.map(item => {
                    const {service_type,location,principal_code,vehicle_type,transaction_date,...newDetails} = item;
                    return newDetails
                })
            }


        })

        

        return {
            wms,
            header,
            details
        }
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
