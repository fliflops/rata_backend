const Sequelize  = require('sequelize');
const {kronos, pod} = require('../models/datawarehouse');

exports.getKronosTrips = async(trips=[]) => {
    await kronos.query(`    
        Select 
        a.trip_log_id,
        a.vehicle_type,
        a.trip_status,
        b.vehicle_id,
        c.trucker_id
        from trip_header a
        left join vehicle b on a.fk_assigned_vehicle_id = b.id
        left join trucker c on b.trucker_id = c.id
        where trip_status in ('EXECUTED','INITIATED')
        limit 1
    `,{
       type: Sequelize.QueryTypes.SELECT,
       replacements:{
            trips: trips
       }
    })
}

exports.getPodInvoices = async({from,to}) => {
    return await pod.query(`               
        Select     
        c.bookingRequestNo	    'tms_reference_no',    
        b.tripPlanNo			'trip_no',    
        b.trip_date			    'trip_date',    
        b.locationCode		    'location',    
        b.tripStatus			'trip_status',    
        b.actual_vendor		    'trucker_id',    
        b.actual_vehicle_type   'vehicle_type',    
        b.actual_vehicle_id	    'vehicle_id',    
        b.vendorId			    'planned_trucker',    
        b.truckType			    'planned_vehicle_type',    
        b.plateNo				'planned_vehicle_id',    
        c.serviceType			'service_type',    
        c.sub_service_type	    'sub_service_type',  
        c.invoiceNo             'invoice_no',    
        c.deliveryDate		    'rdd',    
        c.drNo				    'dr_no',    
        c.shipmentManifest	    'shipment_manifest',    
        c.customerCode		    'principal_code',    
        c.ship_from			    'stc_from',    
        c.shipToCode			'stc_to',    
        c.brStatus			    'br_status', 
        c.deliveryStatus		'delivery_status',    
        c.rudStatus			    'rud_status',    
        c.reasonCode			'reason_code',    
        d.is_billable			'is_billable',    
        c.date_cleared		    'cleared_date'    
        from trip_br_dtl_tbl a    
        left join trip_plan_hdr_tbl b on a.tripPlan = b.tripPlanNo    
        left join booking_request_hdr_tbl c on a.brNo = c.bookingRequestNo    
        left join reason_codes_tbl d on c.reasonCode = d.code    
        where cast(b.trip_date as date) between '2024-03-01' and '2024-03-10' 
        and c.deliveryStatus in ('DELIVERED_FULL','DELIVERED_PARTIAL')
        and c.rudStatus in (null,'CLEARED','NONE','PARTIAL')
        and c.brStatus in ('VERIFIED_COMPLETE', 'RETURNED_BY_TRUCKER')
        and b.tripStatus <> 'SHORT_CLOSED'
        and a.isDeleted <> 1
    `,{
        type: Sequelize.QueryTypes.SELECT,
       replacements:{
           from,
           to
       }
    })
}

exports.reportData = async() => {
    
}