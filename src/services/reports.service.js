const excelJs = require('exceljs');
const models = require('../models/rata')
const sequelize = require('sequelize');
const moment = require('moment');
const _ = require('lodash');
const round = require('../helpers/round');
const {Op} = sequelize

const  borderStyles = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" }
};

const getColumnLetter = (index) => {
    let dividend = index + 1;
    let columnName = '';
    let modulo;

    while (dividend > 0) {
        modulo = (dividend - 1) % 26;
        columnName = String.fromCharCode(65 + modulo) + columnName;
        dividend = Math.floor((dividend - modulo) / 26);
    }

    return columnName;
}

const getSubTotals = async (invoice = []) => {
    const grouped =  _.groupBy(invoice, 'group_key')
    const totals = []

    Object.keys(grouped).map(key => {
        const data = grouped[key];
        
        // const freightCost = _sum(data.map(item => item.total_charges))

        totals.push({
            group_key: key,
            total_actual_qty_pc:    _.sum(data.map(item => item.actual_qty_pc)),
            total_actual_qty_cs:    _.sum(data.map(item => item.actual_qty_cs)),
            total_weight:           _.sum(data.map(item => item.actual_weight)),
            total_cbm_ambient:      _.sum(data.map(item => item.cbm_ambient)),
            total_cbm_cold:         _.sum(data.map(item => item.cbm_cold)),
            total_cbm:              _.sum(data.map(item => item.cbm_ambient)) + _.sum(data.map(item => item.outer_cbm)),
            charges_wo_mgv:         _.sum(data.map(item => item.ambient_charges)) + _.sum(data.map(item => item.cold_charges)),
            
        })
    })

    return totals

}

const getTotals = async(data = []) => {
    const freight_cost_vatex    = _.sum(data.map(item => Number(item.total_charges)));
    const freight_cost_vat      = freight_cost_vatex * 0.12
    const freight_total_vat_inc = freight_cost_vat + freight_cost_vatex
    const total_vatex           = freight_cost_vatex
    const total_vat             = freight_cost_vat
    const total_vat_inc         = freight_total_vat_inc
    const less_wtax_vatex       = total_vatex * 0.02
    const less_wtx_vat_inc      = less_wtax_vatex
    const net_vatex             = total_vatex - less_wtax_vatex
    const net_vat               = total_vatex
    const net_vat_inc           = total_vat_inc - less_wtx_vat_inc
    return {
        freight_cost_vatex,
        freight_cost_vat,
        freight_total_vat_inc,
        total_vatex,
        total_vat,
        total_vat_inc,
        less_wtax_vatex,
        less_wtx_vat_inc,
        net_vatex,
        net_vat,
        net_vat_inc
    }
}

exports.getDraftBill = async(filters={}) => {
    let reportData = [];
    const data = await models.draft_bill_hdr_tbl.findAll({
        include:[
            {
                model:models.draft_bill_details_tbl,
                as:'details',
                include:[
                    {
                        model:models.helios_invoices_hdr_tbl,
                        as:'invoice',
                        include:[
                            {
                                model: models.ship_point_tbl,
                                as:'ship_point_from'
                            },
                            {
                                model: models.ship_point_tbl,
                                as:'ship_point_to'
                            },
                            {
                                model: models.helios_invoices_dtl_tbl,
                            }
                        ]
                    }
                ]
            }
        ],
        where:{
            [sequelize.Op.and]:[
                {
                    ...filters,
                    is_transmitted:1,
                    status:'DRAFT_BILL_POSTED',
                }
            ]
        },
        limit: 100
    })
    .then(data => JSON.parse(JSON.stringify(data)))

    
    data.forEach(({details,...draftBill}) => {
        reportData = reportData.concat(details.map(({invoice,...item}) => {
            const invoiceDetails = invoice.helios_invoices_dtl_tbls.filter(value => value.class_of_store === item.class_of_store)
            const actual_qty_pc = _.sum(invoiceDetails.filter(value => value.uom === 'PIECE').map(value => Number(value.actual_qty)))
            const actual_qty_cs = _.sum(invoiceDetails.filter(value => value.uom === 'CASE').map(value => Number(value.actual_qty)))
            const actual_weight = _.sum(invoiceDetails.map(value => Number(value.actual_weight)));
            const cbm =           _.sum(invoiceDetails.map(value => Number(value.actual_cbm)));

            const cbm_ambient =  item.class_of_store === 'AMBIENT' ? cbm : null;
            const cbm_cold =     item.class_of_store === 'COLD' ? cbm :null;
            const inner_cbm =    cbm_cold ? (cbm_cold / 0.16) : null;
            const round_up =     inner_cbm ? round(inner_cbm,2) : null;
            const outer_cbm =    round_up ? (round_up * 0.18) : null;
            const rate_ambient = item.class_of_store === 'AMBIENT' ? draftBill.rate : null;
            const rate_cold =    item.class_of_store === 'COLD' ? draftBill.rate : null;
            const ambient_charges = item.class_of_store === 'AMBIENT' ? Number(item.billing) : null;
            const cold_charges = item.class_of_store ==='COLD' ? Number(item.billing) : null;
            const tons =        Number(item.actual_weight / 100);
            
            return {
                draft_bill_no:      item.draft_bill_no,
                delivery_date:      item.delivery_date,
                invoice_date:       moment(item.delivery_date).subtract(2,'days').format('YYYY-MM-DD'),
                trip_date:          draftBill.trip_date,
                dr_no:              String(item.dr_no).indexOf('|') !== -1 ? String(item.dr_no).slice(0,String(item.dr_no).indexOf('|')) : item.dr_no,
                so_no:              String(item.dr_no).indexOf('|') !== -1 ? String(item.dr_no).slice(String(item.dr_no).indexOf('|') + 1) : '',
                invoice_no:         item.invoice_no,
                shipment_manifest:  item.shipment_manifest,
                trip_plan:          item.trip_plan,
                principal:          invoice.principal_code,
                location:           item.location,
                service_type:       invoice.service_type,
                sub_service_type:   invoice.sub_service_type,
                ship_from:          invoice.stc_from,
                customer_code:      null,
                customer_name:      invoice.ship_point_to.stc_name,
                area_code:          null,
                remarks:            null,
                province:           invoice.ship_point_to.province,
                vehicle_type:       invoice.vehicle_type,
                vehicle_id:         invoice.vehicle_id,
                class_of_store:     item.class_of_store,
                actual_qty_pc:      actual_qty_pc === 0 ? null : actual_qty_pc,
                total_actual_qty_pc:null,
                actual_qty_cs:      actual_qty_cs === 0 ? null : actual_qty_cs,
                total_actual_qty_cs:null,
                actual_weight,
                total_weight:       null,
                cbm_ambient,
                total_cbm_ambient:  null,
                cbm_cold,
                total_cbm_cold:     null,
                actual_cbm:         cbm,
                total_actual_cbm:   null,
                inner_cbm,
                round_up,
                outer_cbm,
                total_cbm:          null,
                rate_ambient,
                rate_cold,
                rate:               draftBill.rate,
                min_value:          draftBill.min_billable_value,
                mbu:                draftBill.min_billable_unit,
                mgv_rate:           null,
                charges_wo_mgv:     null,
                ambient_charges,
                cold_charges,
                draft_bill_charge:       item.billing,
                total_draft_bill_charge: draftBill.total_charges,
                additional_manos:   null,
                demurrage:          null,
                other_charges:      null,
                total_charges:      item.billing,
                ftl_rate:           draftBill.rate,
                utilization:        null,
                tons:               isNaN(tons) ? null : tons,
                group_key: `${draftBill.trip_date}-${invoice.principal_code}-${item.trip_plan}-${invoice.ship_point_to.stc_name}`
            }
        }))
    });

    const subTotals = await getSubTotals(reportData);

    reportData = reportData.map(item => {
        const subTotal = subTotals.find(i => item.group_key === i.group_key)
        return {
            ...item,
            ...subTotal
        }
    })
    
    return _.orderBy(reportData,['group_key'],'asc')
}

exports.crossDockSecondary = async({
    filePath=null,
    data=[],
    dates={}
}) => {
    const workbook = new excelJs.Workbook();
    const ws = await workbook.addWorksheet('Crossdock Secondary');
    const totals = await getTotals(data);

    ws.getCell('A6').value = 'Billed by:'
    ws.getCell('B6').value = 'Kerry Logistikus Philippines, Inc.'

    ws.getCell('AK6').value = 'Billed to:'
    ws.getCell('AL6').value = ''
   
    
    ws.getCell('A7').value = 'Address:'
    ws.getCell('B7').value = '268 C. Raymundo Ave., Maybunga, Pasig City'
    ws.getCell('AK7').value = 'Address:'
    ws.getCell('AL7').value = ''

    ws.getCell('A8').value = 'Email Add:'
    ws.getCell('B8').value = 'customer.experience@logistikus.com'
    
    ws.getCell('A10').value = 'Contact No:'
    ws.getCell('B10').value = '+632 232-4550'
    
    ws.getCell('A11').value = 'TIN:'
    ws.getCell('B11').value = '009-883-590-000'

    ws.getCell('A13').value = 'Invoice No:'

    ws.getCell('A15').value = 'Period Covered:'
    ws.getCell('B15').value = `${moment(dates.from).format('YYYY-MM-DD')} to ${moment(dates.to).format('YYYY-MM-DD')}`
    

    ws.mergeCells('A17:BB17')
    ws.getCell('A17').value = 'PRE-BILLING SUMMARY FOR SECONDARY CROSSDOCK';
    ws.getCell('A17').alignment =  { vertical: 'middle', horizontal: 'center' };
    ws.getCell('A17').font = {
        bold:true,
        color:{
            argb: 'FFFFFF'
        }
    }
    ws.getCell('A17').fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'000000'},
    }

    const columns = [
        {
            header:'Draft Bill No',
            key:'draft_bill_no'
        },
        {
            header:'Delivery Date',
            key:'delivery_date'
        },
        {
            header:'Invoice Date',
            key:'invoice_date'
        },
        {
            header:'Trip Date',
            key:'trip_date'
        },
        {
            header:'DR Number',
            key:'dr_no'
        },
        {
            header:'SI Number',
            key:'invoice_no'
        },
        {
            header:'FO Reference',
            key:'shipment_manifest'
        },
        {
            header:'Trip Number',
            key:'trip_plan'
        },
        {
            header:'Principal',
            key: 'principal'
        },
        {
            header:'Warehouse Location',
            key:'location'
        },
        {
            header:'Service Type',
            key:'service_type'
        },
        {
            header:'Subservice Type',
            key:'sub_service_type'
        },
        {
            header:'Ship From',
            key:'ship_from'
        },
        {
            header: 'Customer Code',
            key:'customer_code'
        },
        {
            header:'Customer Name',
            key: 'customer_name'
        },
        {
            header:'Area Code',
            key:'area_code'
        },
        {
            header:'Remarks',
            key:'remarks'
        },
        {
            header:'Area',
            key:'province'
        },
        {
            header:'Truck Type',
            key: 'vehicle_type'
        },
        {
            header:'Plate No',
            key:'vehicle_id'
        },
        {
            header:'Item Category',
            key:'class_of_store'
        },
        {
            header:'Quantity (pc)',
            key:'actual_qty_pc'
        },
        {
            header:'Subtotal Quantity (pc)',
            key:'total_actual_qty_pc'
        },
        {
            header:'Quantity (cs)',
            key:'actual_qty_cs'
        },
        {
            header:'Subtotal Quantity (cs)',
            key:'total_actual_qty_cs'
        },
        {
            header:'Weight (kg)',
            key: 'actual_weight'
        },
        {
            header:'Subtotal Weight (kg)',
            key:'total_weight'
        },
        {
            header:'Shipment CBM (Ambient)',
            key:'cbm_ambient'
        },
        {
            header:'Subtotal Shipment CBM (Ambient)',
            key:'total_cbm_ambient'
        },
        {
            header: 'Shipment CBM (COLD)',
            key:'cbm_cold'
        },
        {
            header:'Subtotal Shipment CBM (Cold)',
            key: 'total_cbm_cold'
        },
        {
            header:'Volume CBM',
            key: 'actual_cbm'
        },
        {
            header:'Total Volume CBM',
            key: 'total_actual_cbm'
        },
        {
            header:'Inner CBM',
            key:'inner_cbm'
        },
        {
            header:'Round Up',
            key:'round_up'
        },
        {
            header:'Outer CBM',
            key:'outer_cbm'
        },
        {
            header:'Total CBM',
            key:'total_cbm'
        },
        {
            header:'Rate (Ambient)',
            key: 'rate_ambient'
        },
        {
            header:'Rate (Cold)',
            key:'rate_cold'
        },
        {
            header:'Rate',
            key:'rate'
        },
        {
            header:'Minimum Billable Value',
            key:'min_value'
        },
        {
            header:'Minimum Billable Unit',
            key:'mbu'
        },
        {
            header:'MGV Rate',
            key:'mgv_rate'
        },
        {
            header:'Charges (Without MGV)',
            key:'charges_wo_mgv'
        },
        {
            header:'Charges (With MGV)',
            key:'charges_w_mgv'
        },
        {
            header:'Ambient Charges',
            key:'ambient_charges'
        },
        {
            header:'Cold Charges',
            key:'cold_charges'
        },
        
        {
            header:'Draft Bill Charge',
            key: 'draft_bill_charge'
        },
        {
            header:'Total Draft Bill Charge',
            key:'total_draft_bill_charge'
        },
        {
            header:'Additional Manos',
            key:'additional_manos'
        },
        {
            header:'Demurrage',
            key:'demurrage'
        },
        {
            header:'Other Charges',
            key:'other_charges'
        },
        {
            header:'Total Charges',
            key:'total_charges'
        },
        {
            header:'% Utilization Vs The Target 1 CBM',
            key:'utilization'
        }
    ];

    ws.getRow(18).values = columns.map(item => item.header);
    ws.columns = columns.map(item => item.key);

    columns.forEach((item,index) => {
        ws.getColumn(getColumnLetter(index)).key = item.key
    })

    data.forEach((item) => {
        ws.addRow({
            ...item
        })
    })
    const lastRow = (18+data.length)
    ws.getCell('A'+String(lastRow+3)).value = 'Prepared By:'
    ws.getCell('A'+String(lastRow+7)).value = 'Approved By:'

    ws.getCell('BA'+String(lastRow+1)).value = totals.freight_cost_vatex
    ws.getCell('BA'+String(lastRow+1)).numFmt = '#,##0.00';
    ws.getCell('BB'+String(lastRow+1)).value = '';

    ws.getCell('AZ'+String(lastRow+3)).value = 'VAt Ex'
    ws.getCell('BA'+String(lastRow+3)).value = 'VAt'
    ws.getCell('BB'+String(lastRow+3)).value = 'TOTAL, VAT Inc'

    ws.getCell('AY'+String(lastRow+5)).value = 'Freight Cost'
    ws.getCell('AZ'+String(lastRow+5)).value = totals.freight_cost_vatex
    ws.getCell('AZ'+String(lastRow+5)).numFmt= '#,##0.00'
    ws.getCell('BA'+String(lastRow+5)).value = totals.freight_cost_vat
    ws.getCell('BA'+String(lastRow+5)).numFmt= '#,##0.00'
    ws.getCell('BB'+String(lastRow+5)).value = totals.freight_total_vat_inc
    ws.getCell('BB'+String(lastRow+5)).numFmt = '#,##0.00'

    ws.getCell('AY'+String(lastRow+6)).value = 'Miscellaneous Expenses'
    ws.getCell('AZ'+String(lastRow+6)).value = ''
    ws.getCell('BA'+String(lastRow+6)).value = ''
    ws.getCell('BB'+String(lastRow+6)).value = ''

    ws.getCell('AY'+String(lastRow+7)).value = 'Total'
    ws.getCell('AZ'+String(lastRow+7)).value = totals.total_vatex
    ws.getCell('AZ'+String(lastRow+7)).numFmt= '#,##0.00'
    ws.getCell('BA'+String(lastRow+7)).value = totals.total_vat
    ws.getCell('BA'+String(lastRow+7)).numFmt= '#,##0.00'
    ws.getCell('BB'+String(lastRow+7)).value = totals.total_vat_inc
    ws.getCell('BB'+String(lastRow+7)).numFmt= '#,##0.00'

    ws.getCell('AY'+String(lastRow+8)).value = 'Less:  Withholding Tax (2%)'
    ws.getCell('AZ'+String(lastRow+8)).value = totals.less_wtax_vatex
    ws.getCell('AZ'+String(lastRow+8)).numFmt=  '#,##0.00'
    // ws.getCell('BA'+String(lastRow+8)).value = 
    // ws.getCell('BA'+String(lastRow+8)).numFmt= ''
    ws.getCell('BB'+String(lastRow+8)).value = totals.less_wtx_vat_inc
    ws.getCell('BB'+String(lastRow+8)).numFmt=  '#,##0.00'

    ws.getCell('AY'+String(lastRow+9)).value = 'Net'
    ws.getCell('AZ'+String(lastRow+9)).value = totals.net_vatex 
    ws.getCell('AZ'+String(lastRow+9)).numFmt ='#,##0.00'
    ws.getCell('BA'+String(lastRow+9)).value = totals.net_vat
    ws.getCell('BA'+String(lastRow+9)).numFmt= '#,##0.00'
    ws.getCell('BB'+String(lastRow+9)).value = totals.net_vat_inc
    ws.getCell('BB'+String(lastRow+9)).numFmt= '#,##0.00'
    
    ws.getCell('BB'+String(lastRow+12)).value = 'Report Generation Date: '+moment().format('YYYY-MM-DD hh:mm:ss A')
    ws.getCell('BB'+String(lastRow+12)).style = {
        alignment:{
            horizontal:'right'
        }
    }
    ws.getCell('BB'+String(lastRow+13)).value = 'Reported Printed By: RATA'+moment().format('MMDDYYYYHHmmsss')
    ws.getCell('BB'+String(lastRow+13)).style = {
        alignment:{
            horizontal:'right'
        }
    }
    ws.getCell('BB'+String(lastRow+14)).value = 'Printed via: RATA - Rating and Billing'
    ws.getCell('BB'+String(lastRow+14)).style = {
        alignment:{
            horizontal:'right'
        }
    }
    ws.getCell('BB'+String(lastRow+15)).value = 'Source Systems: RATA and ASCII'
    ws.getCell('BB'+String(lastRow+15)).style = {
        alignment:{
            horizontal:'right'
        }
    }

    ws.eachRow({includeEmpty:true}, (row,Number) => {
        if(Number >= 18 && Number <= lastRow+1) {
            row.eachCell({includeEmpty:true}, (cell, colNumber) => {
                cell.border = borderStyles
            })

            if(Number === lastRow+1) {
                row.eachCell({includeEmpty:true}, (cell, colNumber) => {
                    cell.border = {
                        top:{
                            style:'thick'
                        },
                        bottom:{
                            style:'thick'
                        },
                    }

                    cell.fill={
                        type:'pattern',
                        pattern:'solid',
                        fgColor:{
                            argb:'FFE699'
                        }
                    }
                })
            }
        }

        if(Number >= lastRow+1 && Number <= lastRow+9){
            row.eachCell({includeEmpty:true}, (cell, colNumber) => {
                if(colNumber >= 51)
                cell.border = borderStyles
            })
        }
    })    

    return await workbook.xlsx.writeFile(filePath);
}

exports.p2p = async({data=[], filePath=null, dates={}}) => {
    const workbook = new excelJs.Workbook();
    const ws = workbook.addWorksheet('P2P');
    const totals = await getTotals(data);

    ws.getCell('A6').value = 'Billed by:'
    ws.getCell('B6').value = 'Kerry Logistikus Philippines, Inc.'

    ws.getCell('AK6').value = 'Billed to:'
    ws.getCell('AK6').value = 'Mondelez Philippines, Inc.'
    
    ws.getCell('A7').value = 'Address:'
    ws.getCell('B7').value = '268 C. Raymundo Ave., Maybunga, Pasig City'
    ws.getCell('AK7').value = 'Address:'
    ws.getCell('AL7').value = 'MANUFACTURING 8378 DR.A SANTOS AVE,. PARANAQUE CITY'

    ws.getCell('A8').value = 'Email Add:'
    ws.getCell('B8').value = 'customer.experience@logistikus.com'

    ws.getCell('A10').value = 'Contact No:'
    ws.getCell('B10').value = '+632 232-4550'
    
    ws.getCell('A11').value = 'TIN:'
    ws.getCell('B11').value = '009-883-590-000'

    ws.getCell('A13').value = 'Invoice No:'

    ws.getCell('A15').value = 'Period Covered:'
    ws.getCell('B15').value = `${moment(dates.from).format('YYYY-MM-DD')} to ${moment(dates.to).format('YYYY-MM-DD')}`
    
    ws.mergeCells('A17:AO17')
    ws.getCell('A17').value = 'PRE-BILLING SUMMARY FOR MONDELEZ POINT TO POINT';
    ws.getCell('A17').alignment =  { vertical: 'middle', horizontal: 'center' };
    ws.getCell('A17').font = {
        bold:true,
        color:{
            argb: 'FFFFFF'
        }
    }
    ws.getCell('A17').fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'000000'},
    }

    const columns = [
        {
            header:'Draft Bill No',
            key:'draft_bill_no'
        },
        {
            header:'Delivery Date',
            key:'delivery_date'
        },
        {
            header:'Trip Date',
            key:'trip_date'
        },
        {
            header:'Sales Order No',
            key:'so_no'
        },
        {
            header:'Delivery Order No',
            key:'dr_no'
        },
        {
            header:'Sales Invoice No',
            key:'invoice_no'
        },
        {
            header:'Trip Number',
            key:'trip_plan'
        },
        {
            header:'Principal',
            key: 'principal'
        },
        {
            header:'Warehouse Location',
            key:'location'
        },
        {
            header:'Service Type',
            key:'service_type'
        },
        {
            header:'Ship From',
            key:'ship_from'
        },
        {
            header: 'Customer Code',
            key:'customer_code'
        },
        {
            header:'Customer Name',
            key: 'customer_name'
        },
        {
            header:'Area Code',
            key:'area_code'
        },
        {
            header:'Item Category',
            key:'class_of_store'
        },
        {
            header:'Weight (kg)',
            key: 'actual_weight'
        },
        {
            header:'Subtotal Weight (kg)',
            key:'total_weight'
        },
        {
            header:'Tons',
            key:'tons'
        },
        {
            header:'Subtotal Tons',
            key: 'total_tons'
        },
        {
            header:'Shipment CBM (Ambient)',
            key:'cbm_ambient'
        },
        {
            header:'Subtotal Shipment CBM (Ambient)',
            key:'total_cbm_ambient'
        },
        {
            header: 'Shipment CBM (COLD)',
            key:'cbm_cold'
        },
        {
            header:'Subtotal Shipment CBM (Cold)',
            key: 'total_cbm_cold'
        },
        {
            header:'Inner CBM',
            key:'inner_cbm'
        },
        {
            header:'Round Up',
            key:'round_up'
        },
        {
            header:'Outer CBM',
            key:'outer_cbm'
        },
        {
            header:'Total CBM',
            key:'total_cbm'
        },
        {
            header:'Truck Type',
            key: 'vehicle_type'
        },
        {
            header:'Plate No',
            key:'vehicle_id'
        },
        {
            header: 'No. of Truck',
            key: 'truck_count'
        },
        {
            header: 'FTL Rate',
            key:'ftl_rate'
        },
        {
            header:'Secondary Rate(Ambient)',
            key: 'secondary_rate_ambient'
        },
        {
            header:'Secondary Rate(Cold)',
            key: 'secondary_rate_cold'
        },
        {
            header:'Cooling Mats Rate',
            key:'cooling_mats_rate'
        },
        {
            header:'Cooling Mats Charges',
            key:'cooling_mats_charges'
        },
        {
            header:'Manos Charges',
            key:'manos_charges'
        },
        {
            header:'Demurrage Charges',
            key:'demurrage_charges'
        },
        {
            header:'Other Charges',
            key:'other_charges'
        },
        {
            header:'Total Charges',
            key:'total_charges'
        },
        {
            header:'KLI Remarks',
            key: 'kli_remarks'
        },
        {
            header:'KLI Remarks 2',
            key:'kli_remarks_2'
        }
    ]

    ws.getRow(18).values = columns.map(item => item.header);
    ws.columns = columns.map(item => item.key);

    columns.forEach((item, index) => {
        ws.getColumn(getColumnLetter(index)).key = item.key
    })

    data.forEach((item) => {
        ws.addRow({
            ...item,
            kli_remarks: '',
            kli_remarks_2:''
        })
    })

    const lastRow = (18+data.length)
    ws.getCell('AM'+String(lastRow+1)).value = totals.freight_cost_vatex
    ws.getCell('AM'+String(lastRow+1)).numFmt = '#,##0.00';
    
    ws.getCell('A'+String(lastRow+3)).value = 'Prepared By:'
    ws.getCell('A'+String(lastRow+7)).value = 'Approved By:'

    ws.getCell('AM'+String(lastRow+3)).value = 'VAt Ex';
    ws.getCell('AN'+String(lastRow+3)).value = 'VAt';
    ws.getCell('AO'+String(lastRow+3)).value = 'TOTAL, VAT Inc';

    ws.getCell('AL'+String(lastRow+4)).value = 'Freight Cost'
    ws.getCell('AM'+String(lastRow+4)).value = totals.freight_cost_vatex
    ws.getCell('AM'+String(lastRow+4)).numFmt= '#,##0.00'
    ws.getCell('AN'+String(lastRow+4)).value = totals.freight_cost_vat
    ws.getCell('AN'+String(lastRow+4)).numFmt= '#,##0.00'
    ws.getCell('AO'+String(lastRow+4)).value = totals.freight_total_vat_inc
    ws.getCell('AO'+String(lastRow+4)).numFmt = '#,##0.00'

    ws.getCell('AL'+String(lastRow+5)).value = 'Miscellaneous Expenses'
    ws.getCell('AM'+String(lastRow+5)).value = ''
    ws.getCell('AN'+String(lastRow+5)).value = ''
    ws.getCell('AO'+String(lastRow+5)).value = ''

    ws.getCell('AL'+String(lastRow+6)).value = 'Total'
    ws.getCell('AM'+String(lastRow+6)).value = totals.total_vatex
    ws.getCell('AM'+String(lastRow+6)).numFmt= '#,##0.00'
    ws.getCell('AN'+String(lastRow+6)).value = totals.total_vat
    ws.getCell('AN'+String(lastRow+6)).numFmt= '#,##0.00'
    ws.getCell('AO'+String(lastRow+6)).value = totals.total_vat_inc
    ws.getCell('AO'+String(lastRow+6)).numFmt= '#,##0.00'

    ws.getCell('AL'+String(lastRow+7)).value = 'Less:  Withholding Tax (2%)'
    ws.getCell('AM'+String(lastRow+7)).value = totals.less_wtax_vatex
    ws.getCell('AM'+String(lastRow+7)).numFmt= '#,##0.00'
    ws.getCell('AN'+String(lastRow+7)).value = ''
    //ws.getCell('AN'+String(lastRow+7)).numFmt= '#,##0.00'
    ws.getCell('AO'+String(lastRow+7)).value = totals.less_wtx_vat_inc
    ws.getCell('AO'+String(lastRow+7)).numFmt= '#,##0.00'

    ws.getCell('AL'+String(lastRow+8)).value = 'Net'
    ws.getCell('AM'+String(lastRow+8)).value = totals.net_vatex
    ws.getCell('AM'+String(lastRow+8)).numFmt= '#,##0.00'
    ws.getCell('AN'+String(lastRow+8)).value = totals.net_vat
    ws.getCell('AN'+String(lastRow+8)).numFmt= '#,##0.00'
    ws.getCell('AO'+String(lastRow+8)).value = totals.net_vat_inc
    ws.getCell('AO'+String(lastRow+8)).numFmt= '#,##0.00'

    ws.getCell('AO'+String(lastRow+12)).value = 'Report Generation Date: '+moment().format('YYYY-MM-DD hh:mm:ss A')
    ws.getCell('AO'+String(lastRow+12)).style = {
        alignment:{
            horizontal:'right'
        }
    }
    ws.getCell('AO'+String(lastRow+13)).value = 'Reported Printed By: RATA'+moment().format('MMDDYYYYHHmmsss')
    ws.getCell('AO'+String(lastRow+13)).style = {
        alignment:{
            horizontal:'right'
        }
    }
    ws.getCell('AO'+String(lastRow+14)).value = 'Printed via: RATA - Rating and Billing'
    ws.getCell('AO'+String(lastRow+14)).style = {
        alignment:{
            horizontal:'right'
        }
    }
    ws.getCell('AO'+String(lastRow+15)).value = 'Source Systems: RATA and ASCII'
    ws.getCell('AO'+String(lastRow+15)).style = {
        alignment:{
            horizontal:'right'
        }
    }

    ws.eachRow({includeEmpty:true}, (row,Number) => {
        if(Number >= 18 && Number <= lastRow+1) {
            row.eachCell({includeEmpty:true}, (cell, colNumber) => {
                cell.border = borderStyles
            })

            if(Number === lastRow+1) {
                row.eachCell({includeEmpty:true}, (cell, colNumber) => {
                    cell.border = {
                        top:{
                            style:'thick'
                        },
                        bottom:{
                            style:'thick'
                        },
                    }

                    cell.fill={
                        type:'pattern',
                        pattern:'solid',
                        fgColor:{
                            argb:'FFE699'
                        }
                    }
                })
            }
        }

        if(Number >= lastRow+1 && Number <= lastRow+9){
            row.eachCell({includeEmpty:true}, (cell, colNumber) => {
                if(colNumber >= 51)
                cell.border = borderStyles
            })
        }
    })    

    return await workbook.xlsx.writeFile(filePath)
}

exports.getReporHeader = async(query) => {
    const {
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const where = {};

    const {count,rows} = await models.report_schedule_tbl.findAndCountAll({
        where:{
            ...filters
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage)
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.findReport = async(filter) => {
    return await models.report_schedule_tbl.findOne({
        where:{
            ...filter
        }
    })
}

exports.getReportLogs = async(query, report_id) => {
    const {
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const {count,rows} = await models.report_tbl.findAndCountAll({
        where:{
            ...filters,
            '$report_schedule_tbl.report_name$':report_id
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),
        include:[
            {
                model:models.report_schedule_tbl,
            }
        ]
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.updateReport = async({
    filter,
    data
}) => {
    return await models.report_schedule_tbl.update({
        ...data   
    },
    {
        where:{
            ...filter
        }
    })
}

exports.createReportLog = async(data) => {
    await models.report_tbl.create({
        ...data
    })
}

exports.updateReportLog = async({filter,data}) => {
    await models.report_tbl.update({
        ...data
    },
    {
        where:{
            ...filter
        }
    })
}

exports.generateFilter = () => {
    let filter = {}
    const today = moment();

    if(today.date() <= 10){
        filter = {
            from: moment().subtract(33,'days').format('YYYY-MM-DD HH:mm:ss'), 
            to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
        }
    }
    else if(today.date() <= 17){
        filter = {
            from: moment().subtract(33,'days').format('YYYY-MM-DD HH:mm:ss'), 
            to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
        }
    }
    else if(today.date() <= 23){
        filter = {
            from: moment().subtract(33,'days').format('YYYY-MM-DD HH:mm:ss'), 
            to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
        }
    }
    else{
        filter = {
            from: moment().subtract(33,'days').format('YYYY-MM-DD HH:mm:ss'), 
            to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
        }
    }
    return filter
}