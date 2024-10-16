import React, { useContext, useEffect, useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css'
import { Container, Card } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { clientEmailOperations } from '../apis/clientEmailOperations';
import { AuthContext } from './AuthContext';
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations';

function AboutUs() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const navigateToLoginPage = () => {
    navigate('/')
  }
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { isGuest, setIsGuest } = useContext(AuthContext);
  const { username } = useContext(AuthContext);
  useEffect(() => { // **dpop09** log the user out when user tries to reload the page
    if (!isLoggedIn && !isGuest) {
      navigateToLoginPage()
    }
  }, [isLoggedIn, setIsLoggedIn, isGuest, setIsGuest]); 

  const isEmailFormated = (parmtr_input_email) => {
    const EMAIL_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+(\.[a-zA-Z0-9]{1,20}){1,}$/ // **dpop09** email address be in format of (local-part@website.com) and domain length is at most 80 characters
    var domain = parmtr_input_email.split('@')[1]
    return (EMAIL_PATTERN.test(parmtr_input_email) && domain.length <= 80)
  }

  const handleSendEmail = async function(event) {
    event.preventDefault()
    let input_email_address = null
    if (isGuest) {
      input_email_address = document.getElementById('email').value
      if (!isEmailFormated(input_email_address)) {
        setSuccessMessage("")
        setErrorMessage("Please enter a valid email address.")
        return
      }
    }
    else {
      input_email_address = await clientDatabaseOperations.fetchEmail(username)
    }
    const email_content = document.getElementById("message").value
    if (email_content === "") {
      setSuccessMessage("")
      setErrorMessage("Please enter a message.")
      return
    }
    const is_email_sent = await clientEmailOperations.sendEmailToPersonaCanvas(input_email_address, email_content)
    if (!is_email_sent) {
      setSuccessMessage("")
      setErrorMessage("Email was not sent. Please try again.")
      return
    }
    setIsButtonDisabled(true)
    setErrorMessage("")
    setSuccessMessage("Email sent successfully!")
    setTimeout(() => { // **dpop09** after 10 seconds disable the button and clear the success message
        setIsButtonDisabled(false)
        setSuccessMessage("")
    }, 10000)
  } 

  return (
    <Container id="AboutUs-Container">
      <div id="AboutUs-div-top"><h1>About Us</h1></div>
        <div id="AboutUs-div-section">
          <Row><h2>Our Mission</h2></Row>
          <p id="AboutUs-p-text">
            At PersonaCanvas, we are passionate about unleashing the power of imagination through
            interactive character chatbots. Our platform empowers users to craft personalized chatbot experiences, whether it's 
            bringing fictional characters to life or creating entirely new personalities. With easy-to-use tools for 
            customization and the option to share creations with the community, PersonaCanvas fosters a vibrant space where 
            creativity meets technology. Join us in exploring the endless possibilities of character-driven conversations.
          </p>
        </div>
      <div id="AboutUs-div-section">
        <div>
        <Row><h2>How We Operate</h2></Row>
            <p id="AboutUs-p-text">
            At PersonaCanvas, our operation revolves around providing a user-friendly platform that empowers creativity 
            and collaboration. We prioritize the safety and security of our users' information. We understand 
            the importance of protecting your personal data and chatbot creations, and we take comprehensive measures to ensure
            their confidentiality and integrity. Our team is dedicated to continuously improving the platform, incorporating 
            user feedback and staying at the forefront of technological advancements. We are here to support you every step of the way. 
          </p>
        </div>
      </div>
      <div id="AboutUs-div-section">
        <Row><h2>Contact Us</h2></Row>
            <Form >
              {successMessage ? <p id='AboutUs-p-success'>{successMessage}</p> : null}
              {errorMessage ? <p id='AboutUs-p-error'>{errorMessage}</p> : null}
              {isGuest ? 
              <Form.Group id="email-adress" controlId="exampleForm.ControlInput1">
                <Form.Label id='AboutUs-label'>EMAIL</Form.Label>
                <Form.Control type="email" id = "email" placeholder="email@address.com" />
              </Form.Group>
              : null}
              <Form.Group id="message-for-form-group" controlId="exampleForm.ControlTextarea1">
                <Form.Label id='AboutUs-label'>MESSAGE CONTENT</Form.Label>
                <Form.Control id = "message" as="textarea" rows={3} />
                <div id="AboutUs-div-submit-container">
                  <Button id="AboutUs-Button-submit" type="submit" onClick = {handleSendEmail} disabled={isButtonDisabled}>SEND</Button>
                </div>
              </Form.Group>
            </Form>
          </div>
      </Container>
  );
}

export default AboutUs