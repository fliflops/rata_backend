const model = require('../../models');
const {sequelize,Sequelize} = model;

const getShipPoint = async({
    page,
    totalPage,
    search
}) => {
    try{
        return await sequelize.query(`sp_get_ship_point :search,:page,:totalPage`,{
            replacements:{
                page:page,
                totalPage:totalPage,
                search:search
            },
            type:Sequelize.QueryTypes.SELECT
        })
    }
    catch(e){
        throw e
    }
}

module.exports={
    getShipPoint
}