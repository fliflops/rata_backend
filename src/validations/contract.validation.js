const Joi = require('joi');

exports.contract_tariff = Joi.object({
    page: Joi.string().required(),
    totalPage: Joi.string().required(),
    search: Joi.string().empty('').default(''),
    contract_id: Joi.string().required(),
    status:Joi.string().empty('')
})
.rename('rate_status','status')

exports.getExtendRates = Joi.object({
    valid_to: Joi.string().required(),
    fk_agg_id: Joi.string().empty()
})
.rename('from', 'valid_to')
.rename('algorithm','fk_agg_id')


exports.putExtendRates = Joi.object({
    valid_to: Joi.string().required(),
    fk_agg_id: Joi.string().empty(),
    new_valid_to: Joi.string().required()
})
.rename('from', 'valid_to')
.rename('algorithm','fk_agg_id')