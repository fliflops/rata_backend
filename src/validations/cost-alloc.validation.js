const Joi = require('joi');

module.exports = {
    create_cost_alloc: Joi.object({
        service_type: Joi.string().required(),
        draft_bill_type: Joi.string().required(),
        is_active: Joi.boolean().required()
    })
}