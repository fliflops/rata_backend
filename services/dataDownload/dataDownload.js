const {getAllDraftBills, getAllInvoices} = require('../draftBill');
const {getAllRevenueLeak} = require('../invoice')
const xlsx = require('xlsx');
const sequelize = require('sequelize')

const generateExcel = (data) => {
    try{
        //create work book        
        const wb = xlsx.utils.book_new();
      
        //get the object name 
        Object.keys(data).map(item => {
            const ws = xlsx.utils.json_to_sheet(data[item]);
            xlsx.utils.book_append_sheet(wb,ws,item);
        })

        return buf = xlsx.write(wb,{
            type:'buffer', bookType:"xlsx"
        })

    }
    catch(e){
        throw e
    }
}

exports.exportDraftBill = async({
    location,
    // delivery_date,
    from,
    to,
    contract_type
}) => {
    try{
        let draftBill = {}

        const headers = await getAllDraftBills({
            filters:{
                location,
                delivery_date:{
                    [sequelize.Op.between]:[from,to]
                },
                contract_type,
                
            }
        })

        const details = await getAllInvoices({
            filters:{
                draft_bill_no: headers.map(item => item.draft_bill_no)

            }
        })


        draftBill = {
            headers,
            details
        }

        const buffer = generateExcel(draftBill)
        return buffer
    }
    catch(e){
        throw e
    }
}

exports.exportRevenueLeak = async({
    location,
    from,
    to,
    contract_type
}) => {
    try {

        const data = await getAllRevenueLeak({
            filters:{
                draft_bill_type: contract_type,
                ['$invoice.location$']:location,
                // ['$invoice.rdd$']:delivery_date
                ['$invoice.rdd$']:{
                    [sequelize.Op.between]:[from,to]
                }
            }
        })

        const buffer = await generateExcel({
            invoices:data
        })

        return buffer
        
    } 
    catch (error) {
        throw error
    }
}