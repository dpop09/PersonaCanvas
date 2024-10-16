/*
**dpop09**
Register component is navigated from Login component. This page is dedicated to users who do not have a PersonaCanvas account.
*/
import React, { useContext, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css'
import registerIcon from "../images/register-icon.png"
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations'
import { AuthContext } from './AuthContext'
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

function Register() {
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordShown, setPasswordShown] = useState(false)
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minChar: false,
    uppercase: false,
    number: false,
    specialChar: false
  });

  const { setIsLoggedIn } = useContext(AuthContext)
  const { username, setUsername } = useContext(AuthContext)
  const { setEmail } = useContext(AuthContext)
  const { isGuest, setIsGuest } = useContext(AuthContext)
  const { setPassword } = useContext(AuthContext)
  
  useEffect(() => {
    const deleteGuestAccount = async () => { 
      const is_guest_account_deleted = await clientDatabaseOperations.deleteGuestAccount(username)
      console.log(is_guest_account_deleted)
    }
    if (isGuest) { // **dpop09** if user goes back to the register page from any other page, guest account will be deleted and guest status will automatically be changed to false
      deleteGuestAccount()
      setIsGuest(false)
    }
    setIsLoggedIn(false)  // **dpop09** if user goes back to the login page from any other page, login status will automatically be changed to false
    setUsername('') // **dpop09** if user goes back to the login page from any other page, the username status will automatically be set to empty
  }, [])

  const navigateToEmailVerify = () => {
    navigate('/EmailVerify'); // **dpop09** navigates to the email verification page
  }

  const navigate = useNavigate();
  const navigateToLogin = () => {
    navigate('/'); // Navigates back to the login page
  }

  const isEmailFormated = (parmtr_input_email) => {
    const EMAIL_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+(\.[a-zA-Z0-9]{1,20}){1,}$/ // **dpop09** email address be in format of (local-part@website.com) and domain length is at most 80 characters
    var domain = parmtr_input_email.split('@')[1]
    return (EMAIL_PATTERN.test(parmtr_input_email) && domain.length <= 80)
  }

  const isUsernameAlreadyReserved = (parmtr_username) => {
    if (parmtr_username === 'deleted') { // **dpop09** username 'deleted' is reserved
      return true
    }
    const GUEST_REGEX = /^Guest[A-Za-z0-9]{8}$/ // **dpop09** any usernames with 'Guest' and 8 alphanumeric characters are reserved
    if (GUEST_REGEX.test(parmtr_username)) {
      return true
    }
    return false
  }

  const isRegisterCredentialsUnique = async (parmtr_email, parmtr_username) => {
    const is_email_unique = !(await clientDatabaseOperations.isEmailInDatabase(parmtr_email))
    const is_username_unique = !(await clientDatabaseOperations.isUsernameInDatabase(parmtr_username))
    if (!is_email_unique && is_username_unique){  // **dpop09** username already taken
      return 0
    }
    else if (is_email_unique && !is_username_unique){  // **dpop09** email already taken
      return 1
    }
    else if (!is_email_unique && !is_username_unique){ // **dpop09** both email and username already taken
      return 2
    }
    else {
      return 3
    }
  }

  const isPasswordValidated = (parmtr_password) => {
    const PASSWORD_PATTERN = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[\\S]{8,}$')
    return PASSWORD_PATTERN.test(parmtr_password) // **dpop09** Check if the password matches the pattern
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

  const validateRegisterForm = async (event) => {
    event.preventDefault();  // Prevents the default form submission behavior
    setErrorMessage(''); // Reset any previous error messages
  
    const input_email = document.getElementById("Register-FormControl-email").value;
    const input_username = document.getElementById("Register-FormControl-uname").value;
    const input_password = document.getElementById("Register-FormControl-password").value;
    const input_confirm_password = document.getElementById("Register-FormControl-confirm-password").value;

    // Check if any fields are missing
    if (input_email === "" || input_username === "" || input_password === "" || input_confirm_password === "") {
      setErrorMessage("Please fill in all fields");
      return;
    }

    // Check if the email is formatted correctly
    if (!isEmailFormated(input_email)) {
      setErrorMessage("Email is not formatted correctly");
      return;
    }

    // Check if the username is at an acceptable length
    if (input_username.length < 3 || input_username.length > 20) {
      setErrorMessage("Username must be between 3 and 20 characters");
      return;
    }

    // Check if the password meets requirements
    if (!isPasswordValidated(input_password)) {
      setErrorMessage("Password does not meet password requirements");
      return;
    }

    // **dpop09** check if password and confirm password match
    if (input_password !== input_confirm_password) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const is_username_already_reserved = isUsernameAlreadyReserved(input_username); // **dpop09** check if username is reserved
    if (is_username_already_reserved) {
      setErrorMessage("This username is reserved. Please choose another username");
      return;
    }

    // Check if the email and/or username is already taken
    const is_registration_credentials_unique = await isRegisterCredentialsUnique(input_email, input_username);
    switch(is_registration_credentials_unique) {
      case 0:
        setErrorMessage("This email is already taken");
        return;
      case 1:
        setErrorMessage("This username is already taken");
        return;
      case 2:
        setErrorMessage("Both email and username are already taken");
        return;
      default:
        // If credentials are unique, we can continue
        break;
    }

    setUsername(input_username) // **dpop09** update username status for greeting
    setEmail(input_email) 
    setPassword(input_password)
    navigateToEmailVerify()   // **danp09** navigate to the email verify page
  }


  const togglePasswordVisibility = (event) => { 
    event.preventDefault()
    setPasswordShown(!passwordShown)  // **dpop09** to toggle the password visibility
  }
  const toggleConfirmPasswordVisibility = (event) => {
    event.preventDefault()
    setConfirmPasswordShown(!confirmPasswordShown) // **dpop09** to toggle the confirm password visibility
  }

  const renderPasswordRequirements = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      <ul id="Register-ul-password-requirements">
        <li id={passwordRequirements.minChar ? "Register-li-requirement-met" : "Register-li-requirement-not-met"}>
          {passwordRequirements.minChar ? '✓' : '✕'} At least 8 char
        </li>
        <li id={passwordRequirements.uppercase ? "Register-li-requirement-met" : "Register-li-requirement-not-met"}>
          {passwordRequirements.uppercase ? '✓' : '✕'} At least 1 uppercase
        </li>
        <li id={passwordRequirements.number ? "Register-li-requirement-met" : "Register-li-requirement-not-met"}>
          {passwordRequirements.number ? '✓' : '✕'} At least 1 number
        </li>
        <li id={passwordRequirements.specialChar ? "Register-li-requirement-met" : "Register-li-requirement-not-met"}>
          {passwordRequirements.specialChar ? '✓' : '✕'} At least 1 special character (!@#$%^&*)
        </li>
      </ul>
    </Tooltip>
  )

  return (
    <Container id='Register-Container'>
      <div id='Register-Container-top'>
        <img src={registerIcon} alt='register icon' />
        <h1>REGISTER</h1>
      </div>
      <Form id='Register-Form' onSubmit={validateRegisterForm}>
      {errorMessage && <div id="Register-p-errorMessage">{errorMessage}</div>}
        {/* ... other form groups ... */}
        <Form.Group className='mb-3'>
          <Form.Label>EMAIL</Form.Label>
          <Form.Control id='Register-FormControl-email' type='text' placeholder='Email@address.com' />
        </Form.Group>
        <Form.Group className='mb-3'>
          <Form.Label>USERNAME</Form.Label>
          <Form.Control id='Register-FormControl-uname' type='text' placeholder='Username' />
        </Form.Group>
        {/* ... password requirements ... */}
        <Form.Group className='mb-3'>
          <Form.Label>PASSWORD</Form.Label>
          <div id='Register-div-password'>
            <OverlayTrigger
              placement="top"
              trigger={"focus"} /* **dpop09** trigger on focus */
              overlay={renderPasswordRequirements}
            >
              <Form.Control 
                id='Register-FormControl-password' 
                type={passwordShown ? 'text' : 'password'} 
                placeholder='Password'
                onChange={handlePasswordChange}
              />
            </OverlayTrigger>
            <Button id={passwordShown ? 'Register-Button-hide-password' : 'Register-Button-show-password'} onClick={togglePasswordVisibility}></Button>
          </div>
          <Form.Label>CONFIRM PASSWORD</Form.Label>
          <div id='Register-div-confirm-password'>
            <Form.Control 
              id='Register-FormControl-confirm-password' 
              type={confirmPasswordShown ? 'text' : 'password'} 
              placeholder='Confirm Password'
            />
            <Button id={confirmPasswordShown ? 'Register-Button-hide-confirm-password' : 'Register-Button-show-confirm-password'} onClick={toggleConfirmPasswordVisibility}></Button>
          </div>
        </Form.Group>
        <Button type='submit' id='Register-Button'>REGISTER</Button>
        <div id='Register-div-bottom'>
          <p>Already have an account?</p>
          <p id='Register-p-login-link' onClick={navigateToLogin}>Login</p>
        </div>
      </Form>
    </Container>
  );
}

export default Register