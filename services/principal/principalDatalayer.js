const model = require('../../models');
const {sequelize,Sequelize} = model;

const getPrincipal = async ({
    page,
    totalPage,
    search
}) => {
    try{
        return await sequelize.query(`sp_get_principal :search,:page,:totalPage`,{
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

const getAllPrincipal = async () => {
    try{
        return await sequelize.query(`
            Select * from principal_tbl where is_active = 1`,{
            type:Sequelize.QueryTypes.SELECT
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {getPrincipal,getAllPrincipal}