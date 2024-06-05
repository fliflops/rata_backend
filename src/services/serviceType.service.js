const models = require('../models/rata');

exports.getServiceType = async() => {
   return await models.service_type_tbl.findAll()
   .then(result => JSON.parse(JSON.stringify(result)))
}

