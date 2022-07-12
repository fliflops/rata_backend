const models = require('../../models');
const {sequelize,Sequelize} = models;

const getAllQuickCode = async({type}) => {
    try{

      
        return await sequelize.query(`
            Select * from quick_code_tbl
            where is_active = 1 and qc_type = :type
        `,{
            replacements:{
                type
            },
            type:Sequelize.QueryTypes.SELECT
        })
    }   
    catch(e){
        throw e
    }
}

const getAllQuickCodes = async({filters})=>{
    try{

        return await models.quick_code_tbl.findAll({
           where:{
               ...filters
           }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}

module.exports = {getAllQuickCode,getAllQuickCodes}