const model = require('../../models');
const {sequelize,Sequelize} = model
const getAllLocation = async () => {
    try{
        return await sequelize.query(`
            Select * from location_tbl where loc_status = 'ACTIVE'`,{
            type:Sequelize.QueryTypes.SELECT
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {getAllLocation}