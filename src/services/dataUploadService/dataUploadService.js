const _ = require('lodash');
const models = require('../../models/rata');
exports.tariffICUpload = async (data) => {
    try{
        let ic_data = [];
        
        const grouped_data = _.groupBy(data,item => item.tariff_id)

        const tariffData = await models.tariff_sell_hdr_tbl.getData({
            where:{
                tariff_id: _.uniq(data.map(item => item.tariff_id))
            },
            options:{
                include:[
                    {
                        model:models.tariff_ic_algo_tbl,
                        required:false,
                        as:'ic_data'
                    }
                ]
            }
        })

        const vendorGroupData = await models.vendor_group_tbl.getData({
            where: {
                vg_code: _.uniq(data.map(item => item.vendor_group))
            }
        })

        Object.keys(grouped_data).map(tariff_id => {
            const ic = _.sortBy(grouped_data[tariff_id],item => Number(item.min_value))
            const tariff = tariffData.find(item => item.tariff_id === tariff_id)
            const vendorGroup = vendorGroupData.filter(item => String(tariff.location).toLowerCase() === String(item.location).toLowerCase())

            if(tariff.ic_data.length > 0){
                return ic_data.push({
                    tariff_id,
                    min_value:null,
                    max_value:null,
                    rate:null,
                    uom:null,
                    vehicle_type:null,
                    vendor_group:null,
                    reason:'Tariff already has an ic matrix'
                })
            }

            //1. Matrix Validation
            ic.reduce((acc,cur,index,arr) => {
                if(acc) {
                    if(Number(acc.max_value + 1) !== Number(cur.min_value)) {
                        ic_data.push({
                            tariff_id:tariff_id,
                            ...cur,
                            reason:'Invalid matrix sequence'
                        })
                        arr.splice(1)
                    }
                }
                return cur
            },null)

            //2. Tariff Data Validation            
            if(tariff) {
                //2.1 tariff status validation
                if(tariff.tariff_status !== 'DRAFT') {
                    ic_data.push({
                        tariff_id,
                        min_value:null,
                        max_value:null,
                        rate:null,
                        uom:null,
                        vehicle_type:null,
                        vendor_group:null,
                        reason:'Tariff status must be draft!'
                    })
                }

                //2.2 MBU Validation
                if(ic.filter(item => String(item.uom).toLowerCase() !== String(tariff.min_billable_unit).toLowerCase()).length > 0) {
                    ic_data.push({
                        tariff_id,
                        min_value:null,
                        max_value:null,
                        rate:null,
                        uom:null,
                        vehicle_type:null,
                        vendor_group:null,
                        reason:'Invalid UOM'
                    })
                }   

                //2.3 Vehicle Type Validation
                if(ic.filter(item => String(item.vehicle_type).toLowerCase() !== String(tariff.vehicle_type).toLowerCase()).length > 0){
                    ic_data.push({
                        tariff_id,
                        min_value:null,
                        max_value:null,
                        rate:null,
                        uom:null,
                        vehicle_type:null,
                        vendor_group:null,
                        reason:'Invalid Vehicle Type'
                    })
                }

                //2.4 Vendor Group Validation
                if(vendorGroup.length > 0) {
                    const isVendorGroupMapped = _.uniq(ic.map(item => item.vendor_group)).filter(item => !vendorGroup.map(x => x.vg_code).includes(item)) 
                    if(isVendorGroupMapped.length > 0){
                        ic_data.push({
                            tariff_id,
                            min_value:null,
                            max_value:null,
                            rate:null,
                            uom:null,
                            vehicle_type:null,
                            vendor_group: isVendorGroupMapped.join(','),
                            reason:'Vendor Group is not mapped to Tariff Location!'
                        })
                    }
                }   
                else {
                    ic_data.push({
                        tariff_id,
                        min_value:null,
                        max_value:null,
                        rate:null,
                        uom:null,
                        vehicle_type:null,
                        vendor_group:_.uniq(ic.map(item => item.vendor_group)).join(','),
                        reason:'Vendor Group does not exist!'
                    })
                }
               
            }
            else {
                ic_data.push({
                    tariff_id,
                    min_value:null,
                    max_value:null,
                    rate:null,
                    uom:null,
                    vehicle_type:null,
                    vendor_group:null,
                    reason:'Tariff ID does not exists!'
                })
            }
        })

        return ic_data
    }
    catch(e){
        throw e
    }
}