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