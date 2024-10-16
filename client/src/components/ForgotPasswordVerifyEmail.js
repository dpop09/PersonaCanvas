/*
**dpop09**
ForgotPasswordVerifyEmail.js is used to update user's password
*/
import React, { useContext, useEffect, useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css'
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations'
import { clientEmailOperations } from '../apis/clientEmailOperations'
import { AuthContext } from './AuthContext'
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

function ForgotPasswordVerifyEmail() {

    const [emailErrorMessage, setEmailErrorMessage] = useState('')
    const [codeErrorMessage, setCodeErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const { setEmail } = useContext(AuthContext)

    const navigate = useNavigate()
    const navigateToLoginPage = () => {
        navigate('/')
    }
    const navigateToUpdatePassword = () => {
        navigate('/UpdatePassword')
    }

    const isEmailFormated = (parmtr_input_email) => {
        const EMAIL_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+(\.[a-zA-Z0-9]{1,20}){1,}$/ // **dpop09** email address be in format of (local-part@website.com) and domain length is at most 80 characters
        var domain = parmtr_input_email.split('@')[1]
        return (EMAIL_PATTERN.test(parmtr_input_email) && domain.length <= 80)
    }

    const isEmailInDatabase = async (parmtr_email) => {
        const bool_result = await clientDatabaseOperations.isEmailInDatabase(parmtr_email)
        return bool_result
    }
    
    const sendVerificationEmail = async (parmtr_email) => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();    // **dpop09** generate a random 4 digit number
        const timestamp = Date.now()
        setVerificationCode({code, timestamp});  // **dpop09** store the code and its timestamp into the state
        await new Promise(resolve => setTimeout(resolve, 0));  // **dpop09** must allow the state update to complete
        const is_email_sent = await clientEmailOperations.sendEmail(parmtr_email, `Here is your verification code: ${code}`);
        return is_email_sent;
    }

    const handleEmail = async (event) => {
        event.preventDefault()
        const input_email = document.getElementById('ForgotPasswordVerifyEmail-FormControl-email').value
        if (input_email === "") {
            setEmailErrorMessage("Please enter your registered email")
            setSuccessMessage("")
            return
        }
        const is_email_formated = isEmailFormated(input_email)
        if (!is_email_formated) {
            setEmailErrorMessage("Please enter a valid email")
            setSuccessMessage("")
            return
        }
        const is_email_in_database = await isEmailInDatabase(input_email)
        if (!is_email_in_database) {
            setEmailErrorMessage("This email is not registered in our database")
            setSuccessMessage("")
            return
        }
        const is_email_sent = await sendVerificationEmail(input_email)
        if (!is_email_sent) {
            setEmailErrorMessage("Failed to send verification email. Try again later")
            setSuccessMessage("")
            return
        }

        setEmail(input_email)
        setEmailErrorMessage("")
        setSuccessMessage("Please check your email for a 4-digit code. This code will expire in 10 minutes")
        setIsButtonDisabled(true)
        setTimeout(() => { // **dpop09** after 10 seconds disable the button and clear the success message
            setIsButtonDisabled(false)
            setSuccessMessage("")
        }, 10000)
    }



    const handleVerificationCode = async (event) => {
        event.preventDefault()
        const input_verification_code = document.getElementById('ForgotPasswordVerifyEmail-FormControl-code').value
        const current_timestamp = Date.now()
        const time_difference = Math.floor((current_timestamp - verificationCode.timestamp) / 60000) // **dpop09** difference in minutes
        if (time_difference > 10) { // **dpop09** verification code has expired after 10 minutes
            setCodeErrorMessage("Verification code has expired. Please request a new one");
            return;
        }
        if (input_verification_code !== verificationCode.code) {
            setCodeErrorMessage("Incorrect verification code. Please try again")
            return
        }

        navigateToUpdatePassword()
    }



    return (
        <Container id='ForgotPasswordVerifyEmail-Container'>
            <div id='ForgotPasswordVerifyEmail-Container-top'>
                <Button id='ForgotPasswordVerifyEmail-Button-goback' type='button' onClick={navigateToLoginPage}></Button>
                <h1>Verify Email</h1>
            </div>
            <Form id='ForgotPasswordVerifyEmail-Form-email' onSubmit={handleEmail}>
                <Form.Group className='mb-3'>
                    <Form.Label id='ForgotPasswordVerifyEmail-FormLabel'>EMAIL</Form.Label>
                    <Form.Control id='ForgotPasswordVerifyEmail-FormControl-email' type='text' placeholder='Email@address.com'></Form.Control>
                </Form.Group>
                <Button id='ForgotPasswordVerifyEmail-Button-email-submit' type='submit' disabled={isButtonDisabled}>SEND CODE</Button>
                {successMessage && <p id='ForgotPasswordVerifyEmail-p-success'>{successMessage}</p>}
                {emailErrorMessage && <p id='ForgotPasswordVerifyEmail-p-error'>{emailErrorMessage}</p>}
            </Form>
            <Form id='ForgotPasswordVerifyEmail-Form-code' onSubmit={handleVerificationCode}>
                <Form.Group className='mb-3'>
                    <Form.Label id='ForgotPasswordVerifyEmail-FormLabel'>VERIFICATION CODE</Form.Label>
                    <Form.Control id='ForgotPasswordVerifyEmail-FormControl-code' type='text' placeholder='1234'></Form.Control>
                </Form.Group>
                <Button id='ForgotPasswordVerifyEmail-Button-code-submit' type='submit'>CHANGE PASSWORD</Button>
                {codeErrorMessage && <p id='ForgotPasswordVerifyEmail-p-error'>{codeErrorMessage}</p>}
            </Form>
        </Container>
    )
}

export default ForgotPasswordVerifyEmail