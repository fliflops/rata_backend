const models = require('../models/rata');
const path = require('path');
const mime = require('mime');
const fs = require('fs');
const asciiService = require('../services/asciiService')

const crUploadService = require('../services/crUploadService');
const { generateExcel } = require('../services/dataExportService')

const Sequelize = require('sequelize');

exports.downloadTemplate = async(req,res,next) => {
    try{
        const file = path.join(path.resolve(__dirname, '../../'),'/assets/templates/cr_upload_template.xlsx')
        const filename = path.basename(file);
        const mimeType = mime.lookup(file);

        res.set('Content-disposition', filename);
        res.set('Content-type', mimeType);

        const filestream = fs.createReadStream(file);
        filestream.pipe(res);

    }
    catch(e){
        next(e)
    }
}

exports.uploadCR = async(req,res,next) => {
    const stx = await models.sequelize.transaction();
    try{
        const user =  req.processor.id;
        const file = req.file
        const {
            data,
            details,
            errors,
            ascii_errors,
            ascii_success
        } = await crUploadService.uploadCR(file)

        await crUploadService.bulkCreateHeader(data.map(({CONFIRMATION_RECEIPT_DETAIL,...item}) => {
            return {
                ...item,
                created_by: user
            }
        }), stx)

        await crUploadService.bulkCreateDetails(details.map(item => {
            return {
                ...item,
                created_by: user
            }
        }), stx)

        await crUploadService.bulkCreateErrorLogs(errors.map(item => {
            return {
                ...item,
                created_by: user
            }
        }), stx)

        
        const xlsx = await asciiService.generateResult({
            success: ascii_success,
            errors: ascii_errors,
            data
        })

        await stx.commit();

        res.set('Content-disposition',`cr_upload_result.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    
        res.send(xlsx)
    }
    catch(e){
        await stx.rollback();
        next(e)
    }
}

exports.getPaginatedCr = async(req,res,next) => {
    try{
        const data = await crUploadService.getCR(req.query);

        res.status(200).json({
            data:      data.rows,
            rows:      data.count,
            pageCount: data.pageCount
        })

    }
    catch(e){
        next(e)
    }
}

exports.getCr = async(req,res,next) => {
    try{
        const {id} = req.params;

        const data = await crUploadService.getCrHeader({
            id
        })

        res.status(200).json(data)
    }
    catch(e){
        next(e)
    }
}

exports.getPaginatedDetails = async(req,res,next) => {
    try{
        const data = await crUploadService.getPaginatedCrDetails(req.query);

        res.status(200).json({
            data:      data.rows,
            rows:      data.count,
            pageCount: data.pageCount
        })
    }
    catch(e){
        next(e)
    }
}


exports.getPaginatedErrors = async(req,res,next) => {
    try{
        const data = await crUploadService.getPaginatedCrError(req.query);

        res.status(200).json({
            data:      data.rows,
            rows:      data.count,
            pageCount: data.pageCount
        })
    }
    catch(e){
        next(e)
    }
}

exports.exportCr = async(req,res,next)=>{
    try{
        const {
            type,
            from,
            to
        } = req.query;

        const getHeader = await crUploadService.getAllCRHeader({
            CR_DATE: {
                [Sequelize.Op.between]: [from,to]
            },
            STATUS: type
        })

        const getDetails = await crUploadService.getAllCRDetails({
            fk_header_id: getHeader.map(item => item.id)
        })

        const getErrors = await crUploadService.getAllCRErrors({
            fk_header_id: getHeader.map(item => item.id)
        })

        const xlsx = await generateExcel({
            header: getHeader,
            details: getDetails.map(({id,...item}) => item),
            errors: getErrors.map(({id,...item}) => item)
        })

        res.set('Content-disposition',`confirmtion_receipt.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    

        res.send(xlsx)
    }
    catch(e){
        next(e)
    }
}