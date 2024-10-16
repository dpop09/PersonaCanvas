/*
**dpop09**
Login component will display first when user enters the website
*/
import React, { useContext, useEffect, useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import userIcon from '../images/user-icon.png'
import '../styling/styling.css'
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations'
import { AuthContext } from './AuthContext'
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

function Login() {
  
  const [passwordShown, setPasswordShown] = useState(false)
  
  const [errorMessage, setErrorMessage] = useState('')

  const { setIsLoggedIn } = useContext(AuthContext)
  const { username, setUsername } = useContext(AuthContext)
  const { isGuest, setIsGuest } = useContext(AuthContext)
  
  useEffect(() => {
    const deleteGuestAccount = async () => {
      const is_guest_account_deleted = await clientDatabaseOperations.deleteGuestAccount(username)
      console.log(is_guest_account_deleted)
    }
    if (isGuest) {
      deleteGuestAccount()
      setIsGuest(false)
    }
    setIsLoggedIn(false)  // **dpop09** if user goes back to the login page from any other page, login status will automatically be changed to false
    setUsername('') // **dpop09** if user goes back to the login page from any other page, the username status will automatically be set to empty
  }, [])

  const navigate = useNavigate()
  const navigateToRegister = () => {
    navigate('/Register') //navigates to the register page
  }
  const navigateToHome = () => {
    navigate('/Home') //navigates to the home page
  }

  const isUserCredentialsMatched = async (parmtr_username, parmtr_password) => {
    const is_user_credentials_matched = await clientDatabaseOperations.isUserCredentialsMatched(parmtr_username, parmtr_password)
    return is_user_credentials_matched
  }

  const handleForgotPassword = () => {
    navigate('/ForgotPasswordVerifyEmail')
  }

  const validateLoginForm = async (event) => {
    event.preventDefault()  // **dpop09** prevents the default form submission behavior
    setErrorMessage('')
    var input_username = document.getElementById("Login-FormControl-uname").value
    var input_password = document.getElementById("Login-FormControl-password").value
    if (input_username === "" || input_password === "") { // **dpop09** check if any fields are missing
      setErrorMessage('Please fill in all fields') // when the function is tripped, the useState is set to true, which shows the error message
      return
    } 
    var isLoginValid = await isUserCredentialsMatched(input_username, input_password)
    if (!isLoginValid) {  // **dpop09** check if there is a user account with the input login
      setErrorMessage('Invalid username and/or password') // when the function is tripped, the useState is set to true, which shows the error message
      return
    } 
    setIsLoggedIn(true) // **dpop09** update login status of user to true
    setUsername(input_username) // **dpop09** update username status for greeting
    navigateToHome()  // **danp09** ideally the home page
  }

  const togglePasswordVisibility = (event) => {
    event.preventDefault()
    setPasswordShown(!passwordShown)
  }

  const handleGuestLogin = async (event) => {
    event.preventDefault()

    const guest_username = await clientDatabaseOperations.createGuestAccount()
    if (guest_username === null) {
      setErrorMessage('Server Error: Guest account could not be created at this time')
      return
    }

    setIsGuest(true)
    setUsername(guest_username)
    navigateToHome()
  }

  return (
    <Container id='Login-Container'>
      <div id='Login-Container-top'>
        <img src={userIcon} alt='user icon' />
        <h1>SIGN IN</h1>
      </div>
      <Form id='Login-Form' onSubmit={validateLoginForm}>
        {errorMessage !== '' && <div id="Login-div-errorMessage">{errorMessage}</div>}
        <Form.Group>
          <Form.Label>USERNAME</Form.Label>
          <Form.Control id='Login-FormControl-uname' type='text' placeholder='Username' />
        </Form.Group>
        <Form.Group>
          <Form.Label>PASSWORD</Form.Label>
          <div id='Login-div-password'>
            <Form.Control id='Login-FormControl-password' type={passwordShown ? 'text' : 'password'} placeholder='Password' />
            <Button id={passwordShown ? 'Login-Button-hide-password' : 'Login-Button-show-password'} onClick={togglePasswordVisibility}></Button>
          </div>
        </Form.Group>
        <p id='Login-p-forgot-password' onClick={handleForgotPassword}>Forgot Password?</p>
        <Button type='submit' id='Login-Button-signin'>SIGN IN</Button>
        <div id='Login-Container-bottom'>
          <p>Don't have an account?</p>
          <p id='Login-p-register-link' onClick={navigateToRegister}>Register</p>
        </div>
        <div id='Login-div-guest'>
          <p>Sign in as a</p>
          <p id='Login-p-guest-link' onClick={handleGuestLogin}>Guest</p>
        </div>
      </Form>
    </Container>
  )
  
}

export default Login