const Joi = require('joi');

exports.transmittal = Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    contract_type:Joi.string().empty(''),
    location:Joi.string().empty('')
})