const express = require("express")
const emailOperations = require('./apis/emailOperations')
const emailRouter = express.Router()


emailRouter.post('/sendEmail', async (req,res) => {
    try {
        const {input_email, email_content} = req.body
        var bool_result = await emailOperations.sendEmail(input_email, email_content)
        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})

emailRouter.post('/sendEmailToPersonaCanvas', async (req,res) => {
    try {
        const {input_email, email_content} = req.body
        var bool_result = await emailOperations.sendEmailToPersonaCanvas(input_email, email_content)
        console.log(bool_result)
        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})

module.exports = emailRouter;