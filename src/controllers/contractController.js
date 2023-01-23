const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');
const moment = require('moment')

exports.getContracts = async(req,res,next) => {
    try{
        const {
            page,
            totalPage,
            search,
            ...filters
        } = req.query;

        const where={};

        const globalFilter = useGlobalFilter.defaultFilter({
            model:models.contract_hdr_tbl.rawAttributes,
            filters:{
                search
            }
        })
        
        const {count,rows} = await models.contract_hdr_tbl.paginated({
            filters:{
                ...globalFilter,
                ...filters
            },
            order: [],
            page,
            totalPage
        })

        res.status(200).json({
            data:rows,
            rows:count,
            pageCount: Math.ceil(count/totalPage)
        })
    }
    catch(e){
        next(e)
    }
} 

exports.getContractTariff = async(req,res,next) => {
    try{
        const {
            contract_id,
            page,
            totalPage,
            search,
            ...filters
        } = req.query;
        

        const globalFilter = useGlobalFilter.defaultFilter({
            model:models.contract_tariff_dtl.rawAttributes,
            filters:{
                search
            }
        })
        
        const {count,rows} = await models.contract_tariff_dtl.paginated({
            filters:{
                contract_id,
                ...globalFilter,
                ...filters,
            },
            order: [],
            page,
            totalPage
        })

        res.status(200).json({
            data:rows,
            rows:count,
            pageCount: Math.ceil(count/totalPage)
        })

    }
    catch(e){
        next(e)
    }
}

exports.getContractHeader = async(req,res,next)=> {
    try{
        const {contract_id} = req.params;

        const data = await models.contract_hdr_tbl.getContracts({
            where:{
                contract_id
            }
        })

        if(data.length === 0) return res.status(200).json({contract: null})

        res.status(200).json({
            ...data[0]
        })
    }
    catch(e){
        next(e)
    }
}

exports.updateContract = async(req,res,next) => {
    try{
        const {contract_id} = req.params;

        const data = await models.contract_hdr_tbl.getContract({
            where:{
                contract_id
            }
        })

        if(!data) {
            return res.status(400).json({
                message:'Invalid Contract ID!'
            })
        }

        await models.contract_hdr_tbl.updateContract({
            data:{
                contract_status: 'APPROVED',
                approved_by: req.processor.id,
                approvedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            where:{
                contract_id
            }
        })

        res.end()
    }
    catch(e){
        next(e)
    }
}

exports.updateContractTariff = async(req,res,next) => {
    try{
        const {contract_id,tariff_id} = req.query;
        
        await models.contract_tariff_dtl.updateData({
            where:{
                tariff_id,
                contract_id
            },
            data:{
                status:'INACTIVE',
                cancelled_by: req.processor.id
            }
        })

        res.end()

    }
    catch(e){
        next(e)
    }
}