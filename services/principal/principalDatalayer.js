const models = require('../../models');
const {sequelize,Sequelize} = models;

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

const getAllPrincipal = async ({filters}) => {
    try{

        return await models.principal_tbl.findAll({
            ...filters
        })
        .then(result => JSON.parse(JSON.stringify(result)))
        // return await sequelize.query(`
        //     Select * from principal_tbl where is_active = 1`,{
        //     type:Sequelize.QueryTypes.SELECT
        // })
    }
    catch(e){
        throw e
    }
}

const bulkCreatePrincipal = async({data,options})=>{
    try{
        return await models.principal_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {
    getPrincipal,
    getAllPrincipal,
    bulkCreatePrincipal
}