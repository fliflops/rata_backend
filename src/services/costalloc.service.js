const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');
const _ = require('lodash');
const round = require('../helpers/round')

exports.createCostAlloc = async(data) => {
    await models.cost_alloc_setup_tbl.create(data)
}

exports.isCostAllocExists = async ({service_type, draft_bill_type}) => {
    
    const isExist = await models.cost_alloc_setup_tbl.findOne({
        where:{
            service_type: service_type,
            draft_bill_type: draft_bill_type
        }
    })

    return isExist
}

exports.updateCostAlloc = async(data={},where={}) => {
    return await models.cost_alloc_setup_tbl.update({
        ...data   
    },
    {
        where
    })
}

exports.getPaginatedCostAlloc = async(query) => {
    const {page,totalPage,search,...filters} = query;

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.cost_alloc_setup_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count, rows} = await models.cost_alloc_setup_tbl.findAndCountAll({
        where:{
            ...globalFilter
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),

    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.getPaginatedCostAllocDetails = async(query) => {
    const {page,totalPage,search,draft_bill_no,...filters} = query;

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.draft_bill_cost_alloc_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count, rows} = await models.draft_bill_cost_alloc_tbl.findAndCountAll({
        include:[
            {
                model: models.draft_bill_hdr_tbl,   
            }
        ],
        where:{
            ...globalFilter,
            draft_bill_no
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows: rows.map(item => {
            const {draft_bill_hdr_tbl,...header} = item;
            return {
                ...header,
                vehicle_type: draft_bill_hdr_tbl.vehicle_type
            }
        }),
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.draftBillCostAlloc = async(draft_bills=[]) => {
    const vehicleTypes = await models.vehicle_types_tbl.findAll({
        where:{
            status:'ACTIVE'
        }
    }).then(result => JSON.parse(JSON.stringify(result)))

    const hasCostAlloc = await models.cost_alloc_setup_tbl.findAll({
        where:{
            is_active:1
        }
    }).then(result => JSON.parse(JSON.stringify(result)))

    return draft_bills.map(draft_bill => {
        const isCostAlloc = hasCostAlloc.find(item => draft_bill.contract_type === item.draft_bill_type && draft_bill.service_type === item.service_type)
        const vehicleType = vehicleTypes.find(item => item.vehicle_type === draft_bill.vehicle_type)
        let cost_allocation_details = [];
        
        if(isCostAlloc) {
            Object.keys(_.groupBy(draft_bill.details,'principal_code')).map(principal => {
                const detail         = draft_bill.details.filter(item => principal === item.principal_code);
                const total_cbm      = round(_.sum(detail.map(item => Number(item.actual_cbm))),2);
                const total_cost     = draft_bill.total_charges;
               
                cost_allocation_details.push({
                    draft_bill_no:      draft_bill.draft_bill_no,
                    trip_no:            draft_bill.trip_no,
                    service_type:       draft_bill.service_type,
                    vendor_id:          draft_bill.vendor_id,
                    principal_code:     principal,
                    vehicle_type:       draft_bill.vehicle_type,
                    vehicle_capacity:   vehicleType?.overall_volume,
                    vendor_id:          draft_bill.vendor,
                    total_cbm,
                    total_cost
                })
            })

            //CHECKING OF UTILIZATION SIZE
            //total utilization size of cost allocation details
            const totalCBM = _.sum(cost_allocation_details.map(item => item.total_cbm));
            if(totalCBM > vehicleType.overall_volume){
                cost_allocation_details     = cost_allocation_details.map(item => {
                    const allocation        = round((item.total_cbm / totalCBM) * 100, 2)
                    const allocated_cost    = round((item.total_cbm / totalCBM) * item.total_cost, 2)
                    return {
                        ...item,
                        allocation,
                        allocated_cost
                    }
                })
            }
            else{
                cost_allocation_details     = cost_allocation_details.map(item => {
                    const allocation        = round((item.total_cbm / item.vehicle_capacity) * 100, 2)
                    const allocated_cost    = round((item.total_cbm / item.vehicle_capacity) * item.total_cost, 2)
                    return {
                        ...item,
                        allocation,
                        allocated_cost
                    }
                })

                //computation for default principal
                const total_cbm  = vehicleType?.overall_volume - totalCBM;
                const allocation = round((total_cbm / vehicleType?.overall_volume * 100), 2);
                const allocated_cost = round((total_cbm / vehicleType?.overall_volume) * draft_bill.total_charges);
                cost_allocation_details = cost_allocation_details.concat([
                        {
                            draft_bill_no:      draft_bill.draft_bill_no,
                            trip_no:            draft_bill.trip_no,
                            service_type:       draft_bill.service_type,
                            vendor_id:          draft_bill.vendor_id,
                            principal_code:     '000',
                            vehicle_type:       draft_bill.vehicle_type,
                            vehicle_capacity:   vehicleType?.overall_volume,
                            vendor_id:          draft_bill.vendor,
                            total_cbm,          
                            allocation,
                            allocated_cost,
                            total_cost:         draft_bill.total_charges
                        }
                    ])
                }
        }

        return {
            ...draft_bill,
            cost_allocation_details 
        }
    })
}

