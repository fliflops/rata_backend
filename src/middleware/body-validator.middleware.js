const Joi = require('joi');
const Validators = require('../validations');
const httpStatus = require('http-errors');

module.exports = (validator) => {
   
    if(!Validators.hasOwnProperty(validator))
        throw new Error(`'${validator}' validator is not exist`)

    return async(req,res,next) => {
        try{
            const validated = await Validators[validator].validateAsync(req.body)
            req.body = validated;
            next()
        }
        catch(e) {
            if(e.isJoi){
                return next(httpStatus(422,{
                    message:e.message
                }))
            }

            next(httpStatus(500))
        }   
    }
}
