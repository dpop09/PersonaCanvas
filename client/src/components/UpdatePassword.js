/*
**dpop09**
UpdatePassword.js is used to update user's password
*/
import React, { useContext, useEffect, useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css'
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations'
import { AuthContext } from './AuthContext'
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

function UpdatePassword() {

    const { email } = useContext(AuthContext);

    const [errorMessage, setErrorMessage] = useState('');
    const [passwordShown, setPasswordShown] = useState(false)
    const [confirmPasswordShown, setConfirmPasswordShown] = useState(false)
    const [passwordRequirements, setPasswordRequirements] = useState({
        minChar: false,
        uppercase: false,
        number: false,
        specialChar: false
      });

    const navigate = useNavigate()
    const navigateToLoginPage = () => {
        navigate('/') // **dpop09** navigates to the login page
    }

    const handlePasswordChange = (event) => {
        const value = event.target.value;
        // Set the state based on validation
        setPasswordRequirements({
          minChar: value.length >= 8,
          uppercase: /[A-Z]/.test(value),
          number: /\d/.test(value),
          specialChar: /[!@#$%^&*]/.test(value), // Check for special characters
        });
    };

    const togglePasswordVisibility = (event) => {
        event.preventDefault()
        setPasswordShown(!passwordShown)    // **dpop09** to toggle the password visibility
    }

    const toggleConfirmPasswordVisibility = (event) => {
        event.preventDefault()
        setConfirmPasswordShown(!confirmPasswordShown) // **dpop09** to toggle the confirm password visibility
    }
    const isPasswordValidated = (parmtr_password) => {
        const PASSWORD_PATTERN = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[\\S]{8,}$')
        return PASSWORD_PATTERN.test(parmtr_password) // **dpop09** Check if the password matches the pattern
      }

    const isPasswordUpdatedInDatabase = async (parmtr_password) => {
        const bool_result = await clientDatabaseOperations.updatePassword(email, parmtr_password) // **dpop09** Update the password in the database
        return bool_result
    }

    const validatePassword = async (event) => {
        event.preventDefault()
        const input_password = document.getElementById("UpdatePassword-FormControl-password").value
        const input_verify_password = document.getElementById("UpdatePassword-FormControl-confirm-password").value
        if (input_password === "" || input_verify_password === "") { // **dpop09** check if password and verify password fields are empty
            setErrorMessage("Please fill in fields")
            return
        }
        const is_password_valid = isPasswordValidated(input_password)
        if (!is_password_valid) { // **dpop09** check if password meets password requirements
            setErrorMessage("Password does not meet password requirements")
            return
        }
        if (input_password !== input_verify_password) { // **dpop09** check if password and verify password match
            setErrorMessage("Passwords do not match")
            return
        }
        const is_password_updated_in_database = await isPasswordUpdatedInDatabase(input_password)
        if (!is_password_updated_in_database) { // **dpop09** check if password is updated in database
            setErrorMessage("Unable to update password. Please try again another time.")
            return
        }
        navigateToLoginPage() // **dpop09** navigate to the login page
    }

    const renderPasswordRequirements = (props) => (
        <Tooltip id="UpdatePassword-Tooltip" {...props}>
            <ul id="UpdatePassword-ul-password-requirements">
                <li id={passwordRequirements.minChar ? "UpdatePassword-li-requirement-met" : "UpdatePassword-li-requirement-not-met"}>
                    {passwordRequirements.minChar ? '✓' : '✕'} At least 8 char
                </li>
                <li id={passwordRequirements.uppercase ? "UpdatePassword-li-requirement-met" : "UpdatePassword-li-requirement-not-met"}>
                    {passwordRequirements.uppercase ? '✓' : '✕'} At least 1 uppercase
                </li>
                <li id={passwordRequirements.number ? "UpdatePassword-li-requirement-met" : "UpdatePassword-li-requirement-not-met"}>
                    {passwordRequirements.number ? '✓' : '✕'} At least 1 number
                </li>
                <li id={passwordRequirements.specialChar ? "UpdatePassword-li-requirement-met" : "UpdatePassword-li-requirement-not-met"}>
                    {passwordRequirements.specialChar ? '✓' : '✕'} At least 1 special char (!@#$%^&*)
                </li>
            </ul>
        </Tooltip>
    )   

    return(
        <Container id='UpdatePassword-Container'>
            <div id='UpdatePassword-Container-top'>
                <Button id='UpdatePassword-Button-goback' type='button' onClick={navigateToLoginPage}></Button>   
                <h2>Change Password</h2>  
            </div>
            <Form id='UpdatePassword-Form' onSubmit={validatePassword}>
                <Form.Group className='mb-3'>
                    {errorMessage && <p id='UpdatePassword-p-error'>{errorMessage}</p>}
                    <Form.Label id='UpdatePassword-FormLabel'>PASSWORD</Form.Label>
                    <div id='UpdatePassword-div-password'>
                        <OverlayTrigger
                        placement="top"
                        trigger={"focus"} /* **dpop09** trigger on focus */
                        overlay={renderPasswordRequirements}
                        >
                            <Form.Control 
                                id='UpdatePassword-FormControl-password' 
                                type={passwordShown ? 'text' : 'password'} 
                                placeholder='Password'
                                onChange={handlePasswordChange}
                            />
                        </OverlayTrigger>
                        <Button id={passwordShown ? 'UpdatePassword-Button-hide-password' : 'UpdatePassword-Button-show-password'} onClick={togglePasswordVisibility}></Button>
                    </div>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label id='UpdatePassword-FormLabel'>CONFIRM PASSWORD</Form.Label>
                    <div id='UpdatePassword-div-password'>
                    <Form.Control 
                        id='UpdatePassword-FormControl-confirm-password' 
                        type={confirmPasswordShown ? 'text' : 'password'} 
                        placeholder='Confirm Password'
                    />
                    <Button id={confirmPasswordShown ? 'UpdatePassword-Button-hide-confirm-password' : 'UpdatePassword-Button-show-confirm-password'} onClick={toggleConfirmPasswordVisibility}></Button>
                    </div>
                </Form.Group>
                <Button type='submit' id='UpdatePassword-Button-submit'>CHANGE PASSWORD</Button>
            </Form>
        </Container>
    )
}

export default UpdatePassword