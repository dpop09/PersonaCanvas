const nodemailer = require("nodemailer");
require('dotenv').config()

const SENDGRID = process.env.SENDGRID_API_KEY 
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD

const emailOperations = {
    sendEmailToPersonaCanvas: async function(input_email, email_content){
        try {
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: "canvaspersona@gmail.com",
                  pass: GMAIL_PASSWORD
                }
             });
             const mailOptions = {
                from: input_email, 
                to: 'canvaspersona@gmail.com', 
                subject: `Message from ${input_email} from the PersonaCanvas website`, 
                text: email_content
           };
        var result = await transport.sendMail(mailOptions)
        return result
        } catch (error) {
            console.log(error);
        }   
    },
    //sending email using SendGrid
    sendEmail: async function(user_email, email_content) {
        try {
            //transprter for SendGrid service
            const transport = nodemailer.createTransport({
                host: "smtp.sendgrid.net",
                port: 465,
                secure: true,
                auth: {
                  user: "apikey",
                  pass: SENDGRID
                }
             });
             //define mail options
             const mailOptions = {
                  from: 'canvaspersona@gmail.com',  //sender's email
                  to: user_email, //user's email
                  subject: 'Verify Your Email', //email subject
                  text: email_content //email content
             };
             //send email and return true if successful
             var result = await transport.sendMail(mailOptions)
             return true;
            } catch(error) {
                console.error('Error sending email:', error);
                return false;
            }
        }
    };
    
 module.exports = emailOperations;