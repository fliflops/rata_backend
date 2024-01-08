const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');
const moment = require('moment');

const contractService = require('../services/contract.service');

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
        const {rows,count,pageCount} = await contractService.getContractDetails(req.query)
        res.status(200).json({
            data:rows,
            rows:count,
            pageCount
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
        const {id} = req.query;
        
        await models.contract_tariff_dtl.updateData({
            where:{
                id
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

exports.updateContractValidity = async(req,res,next) => {
    const transaction = await models.sequelize.transaction();
    try{
        const data = req.body;
        const {contract_id} = req.params;
        const user = req.processor.id;

        const contract = await contractService.getContract({
            contract_id
        });

        if(!contract) throw 'No contract found!';
        
        await contractService.updateContract({
            ...data,
            contract_id,
            updated_by: user
        },transaction);

        await contractService.createContractHistory({
            ...data,
            contract_id,
            created_by: user
        },transaction)

        await transaction.commit();
        res.end();
    }
    catch(e){
        console.log(e)
        await  transaction.rollback();
        next(e)
    }
}