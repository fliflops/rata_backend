const models = require('../../models');
const {sequelize,Sequelize} = models;
// const moment = require('moment');
const {viewFilters} = require('../../helper')

const getUser = async({
    filter
}) => {
    try{
       return await models.user_tbl.findOne({
           include:[
                {
                    model:models.role_tbl,
                    attributes:['role_name'],
                    required:false,
                    as:'role'
                }
            ],
            where:{
                ...filter
            }
       })
       .then(result => {
          const {role,...user} = result.toJSON()

          return {
              ...user,
              role_name:role.role_name
          }
        })
    }   
    catch(e){
        throw e
    }
}

const createUser = async({data}) => {
    try{
        return await models.user_tbl.create({
            ...data
        }).then(result => result)
    }
    catch(e){
        throw e
    }
}

const getPaginatedUser = async({
    filters,
    page,
    totalPage
}) => {
    try{
        
        const filter = viewFilters.globalSearchFilter({
            model:models.user_tbl.rawAttributes,
            filters
        })

        const {count,rows} = await models.user_tbl.findAndCountAll({
            include:[
                {
                    model:models.role_tbl,
                    attributes:['role_name'],
                    required:false,
                    as:'role'

                }
            ],
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            where:{
                ...filter
            }
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows: rows.map(item => {
                    const {password,role,...newItem} = item
                    return {
                        ...newItem,
                        role_name:role?.role_name
                    }
                })
            }
        })

        return {
            count,
            rows    
        }

    }
    catch(e){
        throw e
    }
}

const updateUser = async({
    filters,
    data,
    options
}) => {
    try{
        return await models.user_tbl.update({
            ...data
        },{
            where:{
                ...filters
            },
            ...options
        })

    }
    catch(e){
        throw e
    }
}


module.exports = {
    createUser,
    getUser,
    getPaginatedUser,
    updateUser
}






// exports.getAllUser = async()