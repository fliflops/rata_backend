const Sequelize  = require('sequelize');
const {kronos} = require('../models/datawarehouse');

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