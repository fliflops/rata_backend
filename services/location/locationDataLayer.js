const model = require('../../models');
const {sequelize,Sequelize} = model
const getAllLocation = async () => {
    try{
        return await sequelize.query(`
            Select * from wh_location_tbl where is_active = 1`,{
            type:Sequelize.QueryTypes.SELECT
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {getAllLocation}