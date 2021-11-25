const models = require('../../models');
const {sequelize,Sequelize} = models;
// const moment = require('moment');

exports.getUser = async({
    filter
}) => {
    try{
       return await models.user_tbl.findOne({
            where:{
                ...filter
            }
       })
       .then(result => result.toJSON())

    }   
    catch(e){
        throw e
    }
}

exports.createUser = async({data}) => {
    try{
        return await models.user_tbl.create({
            ...data
        }).then(result => result)
    }
    catch(e){
        throw e
    }

}

// exports.getAllUser = async()