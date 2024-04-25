const excelJs   = require('exceljs');
const moment = require('moment');
const path = require('path');

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
};

const footer = (ws) => {
    const foo1 = ws.getCell(getColumnLetter(ws.actualColumnCount - 1)+(ws.rowCount + 2))
    const date = moment();
    foo1.value = `Report Generation Date: ${date.format('MMMM DD, YYYY - h:mm:ss a')}`;
    foo1.alignment = {
        horizontal: 'right'
    }

    const foo2 = ws.getCell(getColumnLetter(ws.actualColumnCount - 1)+(ws.rowCount + 1))
    foo2.value = `Reported Printed By: RATA${date.format('MMDDYYYYHHmmSSsss')}`;
    foo2.alignment = {
        horizontal: 'right'
    }

    const foo3 = ws.getCell(getColumnLetter(ws.actualColumnCount - 1)+(ws.rowCount + 1))
    foo3.value = 'Source Systems: Data Warehouse, RATA';
    foo3.alignment = {
        horizontal: 'right'
    }

    const foo4 = ws.getCell(getColumnLetter(ws.actualColumnCount - 1)+(ws.rowCount + 1))
    foo4.value = 'Printed via: RATA - Rating and Billing';
    foo4.alignment = {
        horizontal: 'right'
    }
}

const expenseColumns = [
    {
        header:'Accrued Bill Number',
        key:'draft_bill_no'
    },
    {
        header:'Trip Date',
        key:'trip_date'
    },
    {
        header:'Contract Type',
        key:'contract_type'
    },
    {
        header:'TMS Service Type Code',
        key:'service_type'
    },
    {
        header:'Location',
        key:'location'
    },
    {
        header:'Trip Number',
        key:'trip_no'
    },
    {
        header:'Kronos Trucker ID',
        key:'vendor'
    },
    {
        header:'Vehicle Type',
        key:'vehicle_type'
    },
    {
        header:'Planned Vehicle Type',
        key:'planned_vehicle_type'
    },
    {
        header:'Plate Number',
        key:'vehicle_id'
    },
    {
        header:'Kronos Trip Status',
        key:'kronos_trip_status'
    },
    {
        header:'Total Actual Quantity',
        key:'total_qty'
    },
    {
        header:'Total Actual Weight',
        key:'total_weight'
    },
    {
        header:'Total Actual CBM',
        key:'total_cbm'
    },
    {
        header:'Contract ID',
        key:'contract_id'
    },
    {
        header:'Tariff ID',
        key:'tariff_id'
    },
    {
        header:'Condition',
        key:'condition'
    },
    {
        header:'Formula',
        key:'formula'
    },
    {
        header:'Contracted Rate',
        key:'rate'
    },
    {
        header:`Accrued Expense`,
        key:'total_charges'
    }
];

const revenueColumns = [
    {
        header:'Accrued Bill Number',
        key:'draft_bill_no'
    },
    {
        header:'Trip Date',
        key:'trip_date'
    },
    {
        header:'Contract Type',
        key:'contract_type'
    },
    {
        header:'Ship From',
        key:'stc_from'
    },
    {
        header:'Ship To',
        key:'stc_to'
    },
    {
        header:'Principal Code',
        key:'customer'
    },
    {
        header:'TMS Service Type Code',
        key:'service_type'
    },
    {
        header:'Location',
        key:'location'
    },
    {
        header:'Trip Number',
        key:'trip_no'
    },
    {
        header:'Kronos Trucker ID',
        key:'vendor'
    },
    {
        header:'Vehicle Type',
        key:'vehicle_type'
    },
    {
        header:'Planned Vehicle Type',
        key:'planned_vehicle_type'
    },
    {
        header:'Plate Number',
        key:'vehicle_id'
    },
    {
        header:'Kronos Trip Status',
        key:'kronos_trip_status'
    },
    {
        header:'Sub Service Type',
        key:'sub_service_type'
    },
    {
        header:'Total Actual Quantity',
        key:'total_qty'
    },
    {
        header:'Total Actual Weight',
        key:'total_weight'
    },
    {
        header:'Total Actual CBM',
        key:'total_cbm'
    },
    {
        header:'Contract ID',
        key:'contract_id'
    },
    {
        header:'Tariff ID',
        key:'tariff_id'
    },
    {
        header:'Condition',
        key:'condition'
    },
    {
        header:'Formula',
        key:'formula'
    },
    {
        header:'Min. Billable Value',
        key:'min_billable_value'
    },
    {
        header:'Max. Billable Value',
        key:'max_billable_value'
    },
    {
        header:'MBU',
        key:'min_billable_unit'
    },
    {
        header:'Minimum Rate',
        key:''
    },
    {
        header:'Contracted Rate',
        key:'rate'
    },
    {
        header:`Accrued Revenue`,
        key:'total_charges'
    }
];

const expenseDetailColumns = [
    {
        header: 'Accrued Bill Number',
        key:    'draft_bill_no'
    },
    {
        header: 'FK TMS Reference Number',
        key:    'fk_tms_reference_no'
    },
    {
        header: 'TMS Reference Number',
        key:    'tms_reference_no'
    },
    {
        header: 'Trip Number',
        key:    'trip_plan'
    },
    {
        header: 'RDD',
        key:    'delivery_date'
    },
    {
        header: 'Principal Code',
        key:'principal_code'
    },
    {
        header: 'DR No',
        key:    'dr_no'
    },
    {
        header: 'Customer Invoice Number',
        key:    'invoice_no'
    },
    {
        header: 'Shipment Manifest',
        key:    'shipment_manifest'
    },
    {
        header: 'From Geo Type',
        key:    'from_geo_type'
    },
    {
        header: 'Ship From',
        key:    'ship_from'
    },
    {
        header: 'To Geo Type',
        key:    'to_geo_type'
    },
    {
        header: 'Ship To',
        key:    'ship_to'
    },
    {
        header: 'Delivery Status',
        key:    'delivery_status'
    },
    {
        header: 'BR Status',
        key:    'br_status'
    },
    {
        header:'RUD Status',
        key:'rud_status'
    },
    {
        header: 'Planned Qty',
        key:    'planned_qty'
    },
    {
        header: 'Planned Weight',
        key:    'planned_weight'
    },
    {
        header: 'Planned CBM',
        key:    'planned_cbm'
    },
    {
        header: 'Actual Quantity',
        key:    'actual_qty'
    },
    {
        header: 'Quantity UOM',
        key:    'uom'
    },
    {
        header: 'Actual Weight',
        key:    'actual_weight'
    },
    {
        header: 'Actual CBM',
        key:    'actual_cbm'
    },
    {
        header: 'Return Qty',
        key:    'return_qty'
    },
    {
        header: 'Class Of Store',
        key:    'class_of_store'
    },
    {
        header: `Accrued Expense Breakdown`,
        key:    'billing'
    }
]

const revenueDetailColumns = [
    {
        header: 'Accrued Bill Number',
        key:    'draft_bill_no'
    },
    {
        header: 'FK TMS Reference Number',
        key:    'fk_tms_reference_no'
    },
    {
        header: 'TMS Reference Number',
        key:    'tms_reference_no'
    },
    {
        header: 'Trip Number',
        key:    'trip_plan'
    },
    {
        header: 'RDD',
        key:    'delivery_date'
    },
    {
        header: 'Principal Code',
        key:'principal_code'
    },
    {
        header: 'DR No',
        key:    'dr_no'
    },
    {
        header: 'Customer Invoice Number',
        key:    'invoice_no'
    },
    {
        header: 'Shipment Manifest',
        key:    'shipment_manifest'
    },
    {
        header: 'From Geo Type',
        key:    'from_geo_type'
    },
    {
        header: 'Ship From',
        key:    'ship_from'
    },
    {
        header: 'To Geo Type',
        key:    'to_geo_type'
    },
    {
        header: 'Ship To',
        key:    'ship_to'
    },
    {
        header: 'Delivery Status',
        key:    'delivery_status'
    },
    {
        header: 'BR Status',
        key:    'br_status'
    },
    {
        header:'RUD Status',
        key:'rud_status'
    },
    {
        header: 'Planned Qty',
        key:    'planned_qty'
    },
    {
        header: 'Planned Weight',
        key:    'planned_weight'
    },
    {
        header: 'Planned CBM',
        key:    'planned_cbm'
    },
    {
        header: 'Actual Quantity',
        key:    'actual_qty'
    },
    {
        header: 'Quantity UOM',
        key:    'uom'
    },
    {
        header: 'Actual Weight',
        key:    'actual_weight'
    },
    {
        header: 'Actual CBM',
        key:    'actual_cbm'
    },
    {
        header: 'Return Qty',
        key:    'return_qty'
    },
    {
        header: 'Class Of Store',
        key:    'class_of_store'
    },
    {
        header: `Accrued Revenue Breakdown`,
        key:    'billing'
    }
]

exports.podAccrualTemplate = async({
    header=[],details=[],leak_header=[],leak_details=[],filePath=null,type=null, from=null, to=null
}) => {
    const workbook = new excelJs.Workbook();
    const headerWs = workbook.addWorksheet(`Accrued ${type === 'BUY'? 'Expense' : 'Revenue'} Header`);

    const root = global.appRoot;
    const kliLogo = workbook.addImage({
        filename:path.join(root,'/assets/image/klilogo.png'),
        extension:'png'
    });

    headerWs.addImage(kliLogo, 'P2:R4');
    headerWs.getCell('A5').value = `Period Covered:`
    headerWs.getCell('B5').value = `From  ${from} to ${to}`

    headerWs.mergeCells('A7:AB7')
    headerWs.getCell('A7').value = `Monthly ${type==='BUY' ? 'Expense': 'Revenue'} Accrual for Delivered but Pending POD Clearance Report`
    headerWs.getCell('A7').alignment =  { vertical: 'middle', horizontal: 'center' };
    headerWs.getCell('A7').font = {
        bold:true,
        color:{
            argb: 'FFFFFF'
        }
    }

    headerWs.getCell('A7').fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'000000'},
    }
    
    const columns = type ==='BUY' ? expenseColumns: revenueColumns

    headerWs.getRow(8).values = columns.map(item => item.header);
    columns.forEach((item, index) => {
        headerWs.getColumn(getColumnLetter(index)).key = item.key
    })

    header.forEach(item => {
        headerWs.addRow({
            ...item
        })
    })

    footer(headerWs);

    const detailWs = workbook.addWorksheet(`Accrued ${type==='BUY' ? 'Expense': 'Revenue'} Detail`)   
    detailWs.addImage(kliLogo, 'K2:L4');
    detailWs.getCell('A5').value = 'Period Covered:'
    detailWs.getCell('B5').value = `From  ${from} to ${to}`

    detailWs.mergeCells('A7:X7')
    detailWs.getCell('A7').value = `Monthly ${type==='BUY' ? 'Expense': 'Revenue'} Accrual for Delivered but Pending POD Clearance Report`
    detailWs.getCell('A7').alignment =  { vertical: 'middle', horizontal: 'center' };
    detailWs.getCell('A7').font = {
        bold:true,
        color:{
            argb: 'FFFFFF'
        }
    }

    detailWs.getCell('A7').fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'000000'},
    }

    const detailColumns = type === 'BUY' ? expenseDetailColumns : revenueDetailColumns;

    detailWs.getRow(8).values = detailColumns.map(item => item.header);
    detailColumns.forEach((item, index) => {
        detailWs.getColumn(getColumnLetter(index)).key = item.key
    })

    details.forEach(item => {
        detailWs.addRow({
            ...item
        })
    })

    footer(detailWs);

    const leakHeader = workbook.addWorksheet(`${type==='BUY' ? 'Expense': 'Revenue'} Leak Header`);    
    leakHeader.columns = [
        {
            header:'TMS Reference Numbers',
            key:'tms_reference_no'
        },
        {
            header:'draft_bill_type',
            key:'draft_bill_type'
        },
        {
            header:'class_of_store',
            key:'class_of_store'
        },
        {
            header:'fk_tms_reference_no',
            key:'fk_tms_reference_no'
        },
        {
            header:'RDD',
            key:'rdd'
        },
        {
            header:'trip_date',
            key:'trip_date'
        },
        {
            header:'revenue_leak_reason',
            key:'revenue_leak_reason'
        },
        {
            header:'trip_no',
            key:'trip_no'
        },
        {
            header:'location',
            key:'location'
        },
        {
            header:'trip_status',
            key:'kronos_trip_status'
        },
        {
            header:'trucker_id',
            key:'trucker_id'
        },
        {
            header:'vehicle_type',
            key:'vehicle_type'
        },
        {
            header:'vehicle_id',
            key:'vehicle_id'
        },
        {
            header:'planned_trucker',
            key:'planned_trucker'
        },
        {
            header:'planned_vehicle_type',
            key:'planned_vehicle_type'
        },
        {
            header:'planned_vehicle_id',
            key:'planned_vehicle_id'
        },
        {
            header:'service_type',
            key:'service_type'
        },
        {
            header:'Subservice Type',
            key:'sub_service_type'
        },
        {
            header:'Customer Invoice Number',
            key:'invoice_no'
        },
        {
            header:'DR No',
            key:'dr_no'
        },
        {
            header:'shipment_manifest',
            key:'shipment_manifest'
        },
        {
            header:'principal_code',
            key:'principal_code'
        },
        {
            header:'stc_from',
            key:'stc_from'
        },
        {
            header:'stc_to',
            key:'stc_to'
        },
        {
            header:'BR Status',
            key:'br_status'
        },
        {
            header:'Delivery Status',
            key:'delivery_status'
        },
        {
            header:'RUD Status',
            key:'rud_status'
        },
        {
            header:'reason_code',
            key:'reason_code'
        },
        {
            header:'redel_remarks',
            key:'redel_remarks'
        }
    ]
    leakHeader.addRows(leak_header)

    const leakDetails = workbook.addWorksheet(`${type==='BUY' ? 'Expense': 'Revenue'} Leak Details`);
    leakDetails.columns = [
        {
            header:'draft_bill_type',
            key:'draft_bill_type'
        },
        {
            header:'trip_no',
            key:'trip_no'
        },
        {
            header:'br_no',
            key:'br_no'
        },
        {
            header:'Class Of Store',
            key:'class_of_store'
        },
        {
            header:'Quantity UOM',
            key:'uom'
        },
        {
            header:'RUD Status',
            key:'rud_status'
        },
        {
            header:'planned_qty',
            key:'planned_qty'
        },
        {
            header:'planned_weight',
            key:'planned_weight'
        },
        {
            header:'planned_cbm',
            key:'planned_cbm'
        },
        {
            header:'Actual Quantity',
            key:'actual_qty'
        },
        {
            header:'Actual Weight',
            key:'actual_weight'
        },
        {
            header:'Actual CBM',
            key:'actual_cbm'
        },
        {
            header:'return_qty',
            key:'return_qty'
        },
        
    ]

    leakDetails.addRows(leak_details)
    return await workbook.xlsx.writeFile(filePath);
}
