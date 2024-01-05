const xlsx = require('xlsx');
const models = require('../../models/rata');
const _ = require('lodash');
const moment = require('moment/moment');
const {Sequelize} = models;

exports.generateExcel = (data) => {
    try{
        const wb=xlsx.utils.book_new();

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

exports.exportTransmittal = async(query) => {
    const {
        from,
        to,
        ...filters
    } = query;

    let exportData = [];

    const data = await models.draft_bill_hdr_tbl.findAll({
        include:[
            {
                model: models.draft_bill_ascii_hdr_tbl,
                required: false,
                as:'attempts',
                include:[
                    {
                        model: models.draft_bill_ascii_dtl_tbl,
                        required:false
                    },
                    {
                        model: models.user_tbl,
                        required:false
                    }
                ]
            }
        ],
        attributes:[
            [
                Sequelize.literal(`(
                    Select MAX(createdAt)
                    from draft_bill_ascii_hdr_tbl
                    where draft_bill_ascii_hdr_tbl.draft_bill_no = draft_bill_hdr_tbl.draft_bill_no
                )`),
                'last_transmitted_date'
            ],
            [
                Sequelize.literal(`(
                    Select MIN(createdAt)
                    from draft_bill_ascii_hdr_tbl as attempts
                    where attempts.draft_bill_no = draft_bill_hdr_tbl.draft_bill_no
                )`),
                'first_transmitted_date'
            ],
            [
                Sequelize.literal(`(
                    Select SUM(actual_qty) from draft_bill_detail_tbl
                    where draft_bill_detail_tbl.draft_bill_no = draft_bill_hdr_tbl.draft_bill_no
                )`),'actual_qty'
            ]

        ].concat(Object.keys(models.draft_bill_hdr_tbl.getAttributes()).map(field => field)),
        where:{
            is_transmitted: 1,
            status: 'DRAFT_BILL',
            trip_date: {
                [Sequelize.Op.between]:[from,to]
            },
            ...filters
        }
    })
    .then(result => JSON.parse(JSON.stringify(result)))
    .then(result => result.map(item => {
        return {
            ...item,
            attempts: _.maxBy(item.attempts,(a) => {
                return moment(a.createdAt)
            })
        }
    }))
    .then(result => result.map(item => {
        const {attempts,...draft_bill} = item;
        exportData = exportData.concat(attempts.draft_bill_ascii_dtl_tbls.map(e => ({
            'Draft Bill Number':        draft_bill.draft_bill_no, 	
            'Contract Type':            draft_bill.contract_type,	
            'Location':                 draft_bill.location,	
            'Draft Bill Date':          draft_bill.draft_bill_date,	
            'Trip Date':                draft_bill.trip_date,	
            'Principal':                draft_bill.customer,
            'Vendor':                   draft_bill.vendor,
            'TMS Service Type':         draft_bill.service_type,	
            'Trip Number':              draft_bill.trip_plan,	
            'MGV':                      draft_bill.min_billable_value,	
            'MBU':                      draft_bill.min_billable_unit,	
            'Actual Quantity':          draft_bill.actual_qty,	
            'Rate':                     draft_bill.rate,	
            'Total Charges':            draft_bill.total_charges,
            'Status':                   draft_bill.status,	
            'First Transmitted Date':	draft_bill.first_transmitted_date,
            'Last Transmitted Date':	draft_bill.last_transmitted_date,
            'Last Transmitted By':      attempts?.user_tbl ? `${attempts.user_tbl.first_name} ${attempts.user_tbl.last_name}` : null,
            'Result Type':              e.result_type,
            'Field Name':               e.field_name,
            'Fiel Value':               e.field_value,
            'Response Code':            e.response_code,
            'Message':                  e.message,
            'Age from Draft Bill Creation': moment().diff(draft_bill.draft_bill_date,'days')
        })))

        return item
    }))

    return exportData
}