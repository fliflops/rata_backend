const dataLayer = require('./rolesDataLayer');
const _ = require('lodash');

exports.createRole = async({data,userId}) => {
    try{
        let roleData = [];
        const roleHeader = {
            role_name:data.role_name,
            role_status:data.status ? 'ACTIVE':'INACTIVE',
            created_by:userId
        }

        // console.log(data)

        for(let i in data.modules){
            let modules = data.modules[i]
            let sub_modules = modules.sub_modules
        
            roleData = roleData.concat(sub_modules.map(i => {
                return {
                    module_name:modules.name,
                    module_label:modules.label,
                    route:modules.route,
                    sub_module_name: i.name,
                    sub_module_label:i.label,
                    sub_module_route: i.route,
                    has_access: i.has_access ? 1 : 0
                }
            }))
        }

        await dataLayer.createModuleTransaction({
            header:roleHeader,
            details:roleData
        })

    }
    catch(e){
        throw e
    }
}

exports.getAllRoles = async({filters})=> {
    try{
        return await dataLayer.getAllRoles({
            ...filters
        })
    }
    catch(e){
        throw e
    }
}

exports.getRoleModule = async({filters})=>{
    try{
        return await dataLayer.getRoleModule({
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.formatRoleModules = async({data})=>{
    try{
        let headers = _.uniqBy(data.map(item => {
            return {
                name:item.module_name,
                label:item.module_label,
                route:item.route,
                has_access:true
            }
        }),'name')


        for(const index in headers){
            const header = headers[index]

            const subModules = data.filter(item => item.module_name === header.name).map(item => {
                return {
                    name:  item.sub_module_name,
                    route: item.sub_module_route,
                    label: item.sub_module_label,
                    has_access:item.has_access
                }
            })

            headers[index] = {
                ...header,
                subModules
            }

        }

        return headers

    }
    catch(e){
        throw e
    }
}

exports.getPaginatedRoles = async({
    filters,
    page,
    totalPage
})=>{
    try{

        return await dataLayer.getPaginatedRole({
            filters,
            page,
            totalPage
        })
    }
    catch(e){
        throw e
    }
}