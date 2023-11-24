const Joi = require('joi');

exports.contract_tariff = Joi.object({
    page: Joi.string().required(),
    totalPage: Joi.string().required(),
    search: Joi.string().empty('').default(''),
    contract_id: Joi.string().required(),
    status:Joi.string().empty('')
})
.rename('rate_status','status')