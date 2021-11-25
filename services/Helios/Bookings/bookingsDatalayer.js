const {podDB} = require('../../../database');
const {sequelize,Sequelize} = podDB

const getInvoices = async({
    dateFrom,
    dateTo
}) => {
    try{
        return await sequelize.query('EXEC sp_get_rb_invoices :dateFrom, :dateTo',{
            type:Sequelize.QueryTypes.SELECT,
            replacements:{
                dateFrom,
                dateTo
            }
            
        })
    }
    catch(e){
        throw e
    }
}

const getInvoicesDtl = async({
    dateFrom,
    dateTo
}) => {
    try{
        return await sequelize.query('sp_get_rb_invoices_dtl :dateFrom, :dateTo',{
            type:Sequelize.QueryTypes.SELECT,
            replacements:{
                dateFrom,
                dateTo
            }
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {getInvoices,getInvoicesDtl}