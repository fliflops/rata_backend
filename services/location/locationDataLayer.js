const models = require('../../models');
const {sequelize,Sequelize} = models

const getAllLocation = async ({filters}) => {
    try{
        return await models.location_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))


        // return await sequelize.query(`
        //     Select * from location_tbl where loc_status = 'ACTIVE'`,{
        //     type:Sequelize.QueryTypes.SELECT
        // })
    }
    catch(e){
        throw e
    }
}

const bulkCreateLocation = async({data,options})=>{
    try{
        return await models.location_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {
    getAllLocation,
    bulkCreateLocation
}