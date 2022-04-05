const models = require('../../models');
const draftBillService = require('../draftBill');
const revenueLeakService = require('../revenueLeak');
const invoiceService = require('../invoice');
const {sequelize,Sequelize} = models;

const createDraftBillTransaction = async({header,details,revenueLeak,contract_type})=>{
    try{

        const fk_invoice_id = details.map(item => item.fk_invoice_id).concat(revenueLeak.map(item => item.fk_invoice_id))
        // console.log(fk_invoice_id)
        return await sequelize.transaction(async t => {
            await draftBillService.createDraftBillHeader({
                data:header,
                options:{
                    transaction: t
                }
            })

            await draftBillService.createDraftBillInvoice({
                data:details,
                options:{
                    transaction: t
                }
            })

            await invoiceService.createRevenueLeak({
                data:revenueLeak,
                options:{
                    transaction: t
                }
            })

            let data = {}

            if(String(contract_type).toUpperCase() === 'SELL'){
                data = {
                    is_processed_sell:true
                }
            }
            else{
                data = {
                    is_processed_buy:true
                }
            }

            await invoiceService.updateInvoice({
                data,
                filters:{
                    id:fk_invoice_id
                },
                options:{
                    transaction:t
                }
                
            })
        })
    }
    catch(e){
        throw e
    }
}
 
module.exports={
    createDraftBillTransaction
}