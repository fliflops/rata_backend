const models = require('../models/rata');
const kronos = require('../models/kronos');
const useGlobalFilter = require('../helpers/filters')
const round = require('../helpers/round');

exports.syncVehicleTypes = async () => {
    const kronosVehicleTypes = await kronos.vehicle_type.findAll()
    .then(result => JSON.parse(JSON.stringify(result)))
    
    await models.vehicle_types_tbl.bulkCreate(kronosVehicleTypes.map(item => ({
        vehicle_type:   item.type,
        description:    item.description,
        overall_volume: round(Number(item.overall_volume),2),
        volume_uom:     item.volume_uom,
        status:         item.status
    })),
    {
        updateOnDuplicate: ['status','description','volume_uom','overall_volume']
    })

    return kronosVehicleTypes;
}

exports.paginated = async(query) => {
    const {page,totalPage,search,...filters} = query; 
    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.vehicle_types_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count,rows} = await models.vehicle_types_tbl.findAndCountAll({
        where:{
            ...globalFilter
        }
    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}
