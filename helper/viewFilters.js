const Sequelize = require('sequelize');

exports.globalSearchFilter = ({
    model,
    filters
}) => {
    try{
        
        let formattedFilters = filters;
        const attributes = Object.keys(model)
        Object.keys(filters).map(field => {
            if(field==='search'){
                let fields = []

                for(const attribute of attributes){
                    fields.push({
                        [attribute]:{
                            [Sequelize.Op.like]:'%'+filters.search+'%'
                        }
                    })
                }

                formattedFilters={
                    ...formattedFilters,
                    [Sequelize.Op.or]:fields
                }

                delete formattedFilters["search"]
            }
        })

        return formattedFilters
    }
    catch(e){
        throw e
    }
}