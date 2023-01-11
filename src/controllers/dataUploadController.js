const {tariff,geography,shipPoint,principal,contract} = require('../../services');
const locationService = require('../../services/location')

const models = require('../models/rata');

const path = require('path');
const mime = require('mime');
const fs = require('fs');
const _ =require('lodash');

const {sequelize} = models

exports.uploadWMSContractTariff = async(req,res,next) => {
    try{
        const {data}    = req.body;
        const contracts   = data.contracts;
        const details     = data.contract_details;

        // validation variables
        let contract_header = []
        let contract_details = []

        if(typeof data.contracts === 'undefined' || typeof data.contract_details === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }
        
        //Validate if the principal is valid
        const principals = await principal.getAllPrincipal({
            filters:{
                //principal_code:contracts.map(item => item.principal_code)
            }
        })

        const getContracts = await contract.getAllWMSContracts({
            filters:{
                //contract_id: contracts.map(item => item.contract_id)
            }
        })

        const getCustomers = await contract.getAllWMSContracts({
            filters:{
                principal_code: contracts.map(item => item.principal_code)
            }
        })

        for(let i in contracts){
            const contractData = contracts[i];

            const dbContract = _.find(getContracts,(value)=>{
                return value.contract_id === contractData.contract_id
            })

            if(dbContract?.contract_status === 'CANCELLED'){
                contract_header.push({
                    contract_id:contractData.contract_id,
                    reason:'Cancelled Contract'
                })
            }

            const isPrincipal = _.find(principals,(value)=> {
                return String(value.principal_code).toLowerCase() == String(contractData.principal_code).toLowerCase()
            })

            if(!isPrincipal){
                contract_header.push({
                    contract_id:contractData.contract_id,
                    reason: `Principal Code ${contractData.principal_code} is not maintained`
                })
            }

            const isCustomerExists = _.find(getCustomers,(value)=>{
                return value.principal_code == contractData.principal_code
            }) 

            if(isCustomerExists && isCustomerExists?.contract_status === 'APPROVED'){
                contract_header.push({
                    contract_id:contractData.contract_id,
                    reason:'Principal is already mapped to a contract'
                })
            }   
        }

        //Contract Details Validation
        const getTariffs = await tariff.getAllWMSTariff({
            filters:{
                tariff_id:_.uniq(details.map(item => item.tariff_id))
            }
        })

        for(let i in details){
            const contract_tariff = details[i]
    
            const tariff = _.find(getTariffs,(value)=>{
                return String(value.tariff_id).toLowerCase()=== String(contract_tariff.tariff_id).toLowerCase()
            })

            if(!tariff){
                contract_details.push({
                    contract_id:contract_tariff.contract_id,
                    tariff_id:contract_tariff.tariff_id,
                    reason:'Tariff does not exists!'
                })

                continue;
            }

            const dbContract = _.find(getContracts,(value)=>{
                return value.contract_id === contract_tariff.contract_id
            })

            if(!dbContract){
                contract_details.push({
                    contract_id:contract_tariff.contract_id,
                    tariff_id:contract_tariff.tariff_id,
                    reason:'Contract does not exists!'
                })
            }
        }

        await contract.bulkCreateWMSContractDetails({
            contract:contracts.filter(item => !contract_header.map(x => x.contract_id).includes(item.contract_id)).map(item => {
                return {
                    ...item,
                    created_by:req.processor.id,
                    updated_by:req.processor.id
                }
            }),
            details: details.filter(item => {
                const isInvalid = _.some(contract_details,{
                    contract_id:item.contract_id,
                    tariff_id:item.tariff_id
                })
    
                return !isInvalid
            })
            .map(item => {
                return{
                    ...item,
                    created_by:req.processor.id,
                    updated_by:req.processor.id
                }
            })
        })

        res.status(200).json({contract_header,
            contract_details
        })

    }
    catch(e){
        next(e)
    }
}

exports.uploadWMSTariff = async(req,res,next) => {
    try{
        let {data} = req.body;
        let tariff_header = [];

        const tariffs = await tariff.getAllWMSTariff({
            filters:{
                tariff_id: data.tariff.map(item => item.tariff_id)
            }
        })

        const locations = await locationService.getAllLocation({
            filters:{}
        })

        for(let i in data.tariff){
            const tariff=data.tariff[i]
            const isExists=_.find(tariffs,(value)=>{
                return value.tariff_id === tariff.tariff_id
            }) 

            const isLocation = _.find(locations,(value) => {
                return String(value.loc_code).toLowerCase() === String(tariff.location).toLowerCase()
            }) 

            if(isExists){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Tariff Already Exists!'
                })
            }

            if(!tariff.service_type || tariff.service_type===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Service Type is required'
                })
            }

            if(!tariff.location || tariff.location===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Location is required'
                })
            }

            if(!isLocation) {
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:`Location ${tariff.location} is not maintained`
                })
            }
        }

        await tariff.bulkCreateWMSTariff({
            data:data.tariff.filter(item => !_.uniq(tariff_header.map(item => item.tariff_id)).includes(item.tariff_id)).map(item => {
                return {
                    ...item,
                    tariff_id:String(item.tariff_id).trim(),
                    location:String(item.location).toLowerCase(),
                    created_by:req.processor.id,
                    updated_by:req.processor.id
                }
            })
        })

        res.status(200).json({tariff_header})

    }   
    catch(e){
        next(e)
    }
}

exports.uploadTariff = async (req,res,next) => {  
    try{
        let {data} = req.body;

        let tariff_header = [];
        let tariff_ic = [];

        if(typeof data.tariff === 'undefined' || typeof data.tariff_ic === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        const getRegion =   await geography.getGeoRegion({
            filters:{is_active:true}
        });
        const getProvince=  await geography.getGeoProvince({
            filters:{is_active:true}
        });
        const getCity=      await geography.getGeoCity({
            filters:{is_active:true}
        });
        const getBrgy =     await geography.getGeoBrgy({
            filters:{is_active:true}
        });
        const getShipPoint =   await shipPoint.getAllShipPoint({
            filters:{is_active:true}
        })

        const {results} = await tariff.isTariffExists({
            tariff_ids:data.tariff.map(item => item.tariff_id)
        })

        for(let i in data.tariff){
            const tariff=data.tariff[i]
            const isExists=_.find(results,(value)=>{
                return value.tariff_id === tariff.tariff_id
            }) 

            if(isExists){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Tariff Already Exists!'
                })
            }

            if(!tariff.service_type || tariff.service_type===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Service Type is required'
                })
            }

            if(!tariff.location || tariff.location===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Location is required'
                })
            }

            if(!tariff.from_geo_type || tariff.from_geo_type===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'From Geo Type is Required'
                })
            }

            if(!tariff.from_geo || tariff.from_geo===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'From Geo is Required'
                })
            }

            if(!tariff.to_geo_type || tariff.to_geo_type===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'To Geo Type is Required'
                })
            }

            if(!tariff.to_geo || tariff.to_geo===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'To Geo is Required'
                })
            }

            if(tariff.from_geo_type){
                let isFromGeoExist;
                if(String(tariff.from_geo_type).toLowerCase() === 'region'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getRegion,{region_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'province'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getProvince,{province_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'city'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getCity,{city_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'barangay'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getBrgy,{barangay_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'stc_code'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getShipPoint,  {stc_code:tariff.from_geo})
                }

                if(!isFromGeoExist){
                    tariff_header.push({
                        tariff_id:tariff.tariff_id,
                        reason:`Geo Type From ${tariff.from_geo_type}: ${tariff.from_geo} does not exists!`
                    })
                }
            }

            if(tariff.to_geo_type){
                let isToGeoExist;
                if(String(tariff.to_geo_type).toLowerCase() === 'region'){
                    isToGeoExist  = _.find(getRegion,{region_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'province'){
                    isToGeoExist  = _.find(getProvince,{province_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'city'){
                    isToGeoExist  = _.find(getCity,{city_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'barangay'){
                    isToGeoExist  = _.find(getBrgy,{barangay_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'stc_code'){
                    isToGeoExist  = _.find(getShipPoint,{stc_code:tariff.to_geo})
                    
                }

                if(!isToGeoExist){
                    tariff_header.push({
                        tariff_id:tariff.tariff_id,
                        reason:`Geo Type To ${tariff.to_geo_type}: ${tariff.to_geo} does not exists!`
                    })
                }
            }
        }

        
        await sequelize.transaction(async t => {
            await models.tariff_sell_hdr_tbl.bulkCreateData({
                data: data.tariff.filter(item => !_.uniq(tariff_header.map(item => item.tariff_id)).includes(item.tariff_id)).map(item => {
                    return {
                        ...item,
                        tariff_id:String(item.tariff_id).trim(),
                        from_geo:String(item.from_geo).trim(),
                        to_geo:String(item.to_geo).trim(),
                        created_by:req.processor.id,
                        updated_by:req.processor.id
                    }
                }),
                options: {
                    transaction: t
                }
            })

            const tariffData = await models.tariff_sell_hdr_tbl.getData({
                options:{
                    transaction:t
                },
                where:{
                    tariff_id: _.uniq(data.tariff_ic.map(item => item.tariff_id))
                }
            })

            let ic_data = []

            tariffData.map(tariff => {
                const ic = data.tariff_ic.filter( item => item.tariff_id === tariff.tariff_id)
            
                //invalid uom
                const invalid_uom = ic.filter(item => String(item.uom).toLowerCase() !== String(tariff.min_billable_unit).toLowerCase())
                    
                tariff_ic = tariff_ic.concat(invalid_uom.map(item => {
                    return {
                        ...item,
                        reason:'Invalid UOM'
                    }
                }))

                if(invalid_uom.length === 0){
                    ic_data = ic_data.concat(ic)
                }
            })

            const invalidTariff = data.tariff_ic.filter(ic => !tariffData.map(item => item.tariff_id).includes(ic.tariff_id))
            tariff_ic = tariff_ic.concat(invalidTariff.map(item => {
                return {
                    ...item,
                    reason:'Invalid Tariff ID'
                }
            }))

            await models.tariff_ic_algo_tbl.bulkCreateData({
                data: ic_data,
                options:{
                    transaction:t
                }
            })

        })

        res.status(200).json({
            tariff_header,
            tariff_ic
        })

    }
    catch(e){
        next(e)
    }
}

exports.getTemplate = (req,res,next) => {
    try{
        const {type} = req.body;    

        if(type === '' || type === null || typeof type === 'undefined' ){
            return res.status(400).json({
                message:'Invalid Template Type'
            })
        }   

        const file = path.join(path.resolve(__dirname,'../../'),`/assets/templates/${type}_upload_template.xlsx`)
        const filename = path.basename(file);
        const mimeType = mime.lookup(file);

        res.set('Content-disposition',filename);
        res.set('Content-type', mimeType);    

        const filestream = fs.createReadStream(file);
        filestream.pipe(res);
    }
    catch(e){
        next(e)
    }
}
