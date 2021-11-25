const model = require('../../models');
const {sequelize,Sequelize} = model;

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

module.exports = {getAllQuickCode}