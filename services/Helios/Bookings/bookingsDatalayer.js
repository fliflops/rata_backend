const {podDB} = require('../../../database');
const {sequelize,Sequelize} = podDB

const getInvoices = async({
    rdd,
    location
}) => {
    try{
        return await sequelize.query('sp_get_rb_invoices :rdd, :location',{
            type:Sequelize.QueryTypes.SELECT,
            replacements:{
                rdd,
                location
            }
        })
    }
    catch(e){
        throw e
    }
}

const getInvoicesDtl = async({
    rdd,
    location
}) => {
    try{
        return await sequelize.query('sp_get_rb_invoices_dtl :rdd, :location',{
            type:Sequelize.QueryTypes.SELECT,
            replacements:{
                rdd,
                location
            }
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {getInvoices,getInvoicesDtl}