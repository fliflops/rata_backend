const nodemailer = require('nodemailer');
const {email,password} =require('../../../config').nodeMailer;

const transporter = nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:email,
        pass:password
    }
})

exports.sendEmail = async({
    job_id,
    status
}) => {

    try{

    }
    catch(e){
        throw e
    }
}