const bcrypt = require('bcryptjs');
const dataLayer = require('./usersDataLayer');

exports.getUser = async({
    filters
}) => {
    try{

        return await dataLayer.getUser({
            filter:filters
        })

    }
    catch(e){
        throw e
    }
}


exports.createUser = async({data}) => {
    try {
        const hashPassword = await bcrypt.hashSync(data.password,10)
        return await dataLayer.createUser({
            data:{
                ...data,
                password:hashPassword
            }
        })
    } 
    catch (e) {
        throw e    
    }
}

exports.getPaginatedUser = async({
    filters,
    page,
    totalPage
})=>{
    try{

       

        const {count,rows} =await dataLayer.getPaginatedUser({
            filters,
            page,
            totalPage
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

exports.updateUser = async({filters,data,options}) => {
    try{
        const {password,...user} = data
        let hashPassword;
        
        if(password) {
            hashPassword = await bcrypt.hashSync(password,10)
        }
        
        return await dataLayer.updateUser({
            data:{
                ...user,
                password:hashPassword
            },
            filters,
            options
        })
    }
    catch(e){
        throw e
    }
}