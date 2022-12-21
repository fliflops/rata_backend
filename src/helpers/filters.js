const Sequelize = require('sequelize')

exports.defaultFilter = ({
    model,
    filters
}) => {

    let formattedFilters = filters;
        const attributes = Object.keys(model)
        Object.keys(filters).map(field => {
            if(field === 'delivery_date'){
                formattedFilters={
                    ...formattedFilters,
                    delivery_date: {
                        [Sequelize.Op.between]:filters.delivery_date.split(',')
                    }
                }
            }
            if(field==='search'){
                let fields = {}
                attributes.map(item => (fields[item] = {
                    [Sequelize.Op.like]:`%${filters.search}%`
                }))
                formattedFilters={
                    ...formattedFilters,
                    [Sequelize.Op.or]:fields
                }

                delete formattedFilters["search"]
            }
        })

        return formattedFilters
}