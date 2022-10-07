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

            if(field === 'draft_bill_date'){

                formattedFilters={
                    ...formattedFilters,
                    draft_bill_date : {
                        [Sequelize.Op.between]: filters.draft_bill_date.split(',')
                    }
                }
            }

            if(field === 'transaction_date'){
                formattedFilters={
                    ...formattedFilters,
                    transaction_date : {
                        [Sequelize.Op.between]: filters.transaction_date.split(',')
                    }
                }
            }
        })

        return formattedFilters
    }
    catch(e){
        throw e
    }
}