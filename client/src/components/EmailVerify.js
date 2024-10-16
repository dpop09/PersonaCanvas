import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { clientEmailOperations } from '../apis/clientEmailOperations';
import { useNavigate } from 'react-router-dom';
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations';

function EmailVerify() {
  const { setIsLoggedIn } = useContext(AuthContext)
  const { username } = useContext(AuthContext)
  const { email } = useContext(AuthContext)
  const { password, setPassword } = useContext(AuthContext)

  const [ verificationCode, setVerificationCode ] = useState('');
  const [codeErrorMessage, setCodeErrorMessage] = useState('');
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const navigate = useNavigate();

  //navigates to register page 
  const navigateToRegisterPage = () => {
    navigate('/Register');
  };

  //navigates to home page after successfull code 
  const navigateToHomePage = () => {
    navigate('/Home');
  };

  useEffect(() => {
    const sendRegistrationVerificationEmail = async () => {
      try {
        //generate random verification code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const timestamp = Date.now() + 10 * 60 * 1000; //10 minute timestamp
        setVerificationCode({ code, timestamp });
        //send verification code to the registered email
        const isEmailSent = await clientEmailOperations.sendEmail(email, `Your verification code is: ${code}. This code will expire in 10 minutes.`);
        return isEmailSent;
      } catch (error) {
        console.error("Error sending registration verification code:", error);
        return false;
      }
    };
    sendRegistrationVerificationEmail()
    setEmailSuccessMessage('Verification code sent successfully!');
    setCodeErrorMessage("")
    setIsButtonDisabled(true)
    setTimeout(() => { // **dpop09** after 10 seconds disable the button and clear the success message
        setIsButtonDisabled(false)
        setEmailSuccessMessage("")
    }, 10000)
  }, [])

  const createNewUserAccount = async (parmtr_email, parmtr_username, parmtr_password) => {
    const is_new_user_inserted_into_database = await clientDatabaseOperations.insertNewUserIntoDatabase(parmtr_email, parmtr_username, parmtr_password)
    return is_new_user_inserted_into_database
  }
  //handles verificaion submission
  const handleVerificationSubmit = async (event) => {
    event.preventDefault();
    setCodeErrorMessage('');
    setEmailSuccessMessage('');

    //four code number inputs 
    const codeInput1 = event.target.elements.codeInput1.value;
    const codeInput2 = event.target.elements.codeInput2.value;
    const codeInput3 = event.target.elements.codeInput3.value;
    const codeInput4 = event.target.elements.codeInput4.value;
    const inputVerificationCode = codeInput1 + codeInput2 + codeInput3 + codeInput4;

    //check if verification code has expired
    const currentTimestamp = Date.now();
    const timeDifference = Math.floor((currentTimestamp - verificationCode.timestamp) / 60000);
    if (timeDifference > 10) {
      setCodeErrorMessage("Verification code has expired. Please request a new one.");
      setEmailSuccessMessage('');
      return;
    }
    //if verification code is correct, create new user account
    if (inputVerificationCode === verificationCode.code) {
      const is_new_account_created = await createNewUserAccount(email, username, password);
      if (!is_new_account_created) {
        setCodeErrorMessage("The server could not create a new account at this moment. Please try again another time.");
        setEmailSuccessMessage('');
        return;
      }
      setPassword('');
      setIsLoggedIn(true);
      navigateToHomePage();
    } else {
      setCodeErrorMessage("Incorrect verification code. Please try again.");
      setEmailSuccessMessage('');
    }
  };

  //handle resend verification code
  const handleResendCode = async () => {
    try {
      //generate a new 4-digit verification code 
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setVerificationCode({ code, timestamp: Date.now() });
      //resend email with new verification code 
      const isEmailSent = await clientEmailOperations.sendEmail(email, `Your new verification code is ${code}.`);
      if (isEmailSent) {
        setEmailSuccessMessage('Verification code resent successfully!');
        setCodeErrorMessage("")
        setIsButtonDisabled(true)
        setTimeout(() => { // **dpop09** after 10 seconds disable the button and clear the success message
            setIsButtonDisabled(false)
            setEmailSuccessMessage("")
        }, 10000)
      } else {
        setCodeErrorMessage('Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      setCodeErrorMessage("Error resending verification code. Please try again.");
    }
  };
  
  return (
    <Container id='EmailVerify-Container'>
      <div id='EmailVerify-Container-top'>
        <h1>Email Verification</h1>
        <Button id='EmailVerify-Container-Button-goback' type='button' onClick={navigateToRegisterPage}></Button>
      </div>
      <h2>Please enter the 4-digit verification code that was sent to your email</h2>
      <Form onSubmit={handleVerificationSubmit}> 
        <Form.Group controlId="verificationCode" id="EmailVerify-input-code">
          <Form.Control type="text" pattern="[0-9]" placeholder="0" required className="EmailVerify-input" maxLength="1" name='codeInput1' />
          <Form.Control type="text" pattern="[0-9]" placeholder="0" required className="EmailVerify-input" maxLength="1" name='codeInput2'/>
          <Form.Control type="text" pattern="[0-9]" placeholder="0" required className="EmailVerify-input" maxLength="1" name='codeInput3'/>
          <Form.Control type="text" pattern="[0-9]" placeholder="0" required className="EmailVerify-input" maxLength="1" name='codeInput4'/>
        </Form.Group>
        <div id="EmailVerify-div-flexbox"> 
          <p id="EmailVerify-p">Didn't receive an email? </p>
          <Button variant="link" id='EmailVerify-p-resend-code' onClick={handleResendCode} disabled={isButtonDisabled}>Resend Code</Button>
        </div>
        {emailSuccessMessage && <p id='EmailVerify-p-success'>{emailSuccessMessage}</p>}
        {codeErrorMessage && <p id="EmailVerify-p-error">{codeErrorMessage}</p>}
        <div id="EmailVerify-div-submit-container">
          <Button id="EmailVerify-Button-submit" type="submit">SUBMIT</Button>
        </div>
      </Form>
    </Container>
  )
}

export default EmailVerify;