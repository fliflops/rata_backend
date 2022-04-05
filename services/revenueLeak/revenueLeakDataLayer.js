const models = require('../../models');
const draftBillService = require('../draftBill');
const revenueLeakService = require('../revenueLeak');
const invoiceService = require('../invoice');
const {sequelize,Sequelize} = models;
const _ = require('lodash')

const createRevenueLeakTransaction = async({header,details,revenueLeak,contract_type,oldRevenueLeak}) => {
    try{


        const diff = _.differenceBy(revenueLeak.map(item => {
            return {
                ...item,
                diff_id: `${item.fk_invoice_id}-${item.draft_bill_type}-${item.reason}`
            }
        }),
        oldRevenueLeak.map(item => {
            return {
                ...item,
                diff_id: `${item.fk_invoice_id}-${item.draft_bill_type}-${item.reason}`
            }
        }),'diff_id')
        
        // console.log(diff)
        // const fk_invoice_id = details.map(item => item.fk_invoice_id).concat(revenueLeak.map(item => item.fk_invoice_id))
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

            await invoiceService.updateRevenueLeak({
              filters:{
                    draft_bill_type:contract_type,
                    fk_invoice_id: details.map(item => item.fk_invoice_id)
                },
                data:{
                    is_draft_bill:1
                },
                options:{
                    transaction:t
                }
            })

            for(const invoice of diff){
                await invoiceService.updateRevenueLeak({
                    filters:{
                        draft_bill_type:contract_type,
                        fk_invoice_id: invoice.fk_invoice_id
                    },
                    data:{
                        reason:invoice.reason
                    },
                    options:{
                        transaction:t
                    }
                })
            }
        })
    }   
    catch(e){
        throw e
    }
}

module.exports = {
    createRevenueLeakTransaction
}