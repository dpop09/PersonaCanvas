import React, { useEffect, useContext, useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css'
import mistralAvatar from '../images/mistral-avatar.png'
import thumbsupIcon from '../images/thumbsup-icon.png'
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { AuthContext } from './AuthContext';
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations';
import { clientEmailOperations } from '../apis/clientEmailOperations'


function PromptDeleteAllChatbotsModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body id='ChatUI-ModalBody'>
        <h4>Are you sure you want to delete all of your chatbots?</h4>
      </Modal.Body>
      <Modal.Footer id='ChatUI-ModalFooter'>
        <Button variant='secondary' onClick={props.onHide}>Cancel</Button>
        <Button variant='danger' onClick={props.onConfirm}>Delete</Button>
      </Modal.Footer>
    </Modal>
  )
}

function Profile(){
  // **dpop09** AuthContext
  const { username } = useContext(AuthContext)
  const { setChatbotId } = useContext(AuthContext)
  
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [emailConfirmationMessage, setEmailConfirmationMessage] = useState('');

  // **dpop09** dynamically controls the visibility of the forms upon the clicking of a button
  const [showUpdateEmail, setShowUpdateEmail] = useState(false)
  const [showUpdatePassword, setShowUpdatePassword] = useState(false)

  // **dpop09** controls which tab the user is on in the Profile component ('My Profile' or 'My Chatbots')
  const [showProfile, setShowProfile] = useState(true) 
  
  const [showDeleteAllChatbotsModal, setShowDeleteAllChatbotsModal] = useState(false)
  const [showDeleteSelectChatbotsModal, setShowDeleteSelectChatbotsModal] = useState(false)
  const [deleteAccountErrorMessage, setDeleteAccountErrorMessage] = useState('')
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeRequested, setVerificationCodeRequested] = useState(false);
  const [verficationCodeMessage, setVerficationCodeMessage] = useState('')
  const [emailChangedSuccessMessage, setEmailChangedSuccessMessage] = useState('')
  const [emailErrorMessage, setEmailErrorMessage] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  // **dpop09** change password pop up messages useStates
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [passwordChangedSuccessMessage, setPasswordChangedSuccessMessage] = useState('')

  // **dpop09** show/hide password input useStates
  const [passwordShown, setPasswordShown] = useState(false)
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false)

  const [passwordRequirements, setPasswordRequirements] = useState({
    minChar: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const [createdChatbotCards, setCreatedChatbotCards] = useState([])
  const [isCreatedChatbotCardsLoading, setIsCreatedChatbotCardsLoading] = useState(true)

  const navigate = useNavigate();
  const navigateToChat = (parmtr_chatbot_id) => {
    setChatbotId(parmtr_chatbot_id)
    navigate('/ChatUI') //navigates to the chat page
  }
  const navigateToLoginPage = () => {
    navigate('/') //navigates to the login page
  }
  const { isLoggedIn } = useContext(AuthContext)
  const { setIsLoggedIn } = useContext(AuthContext);
  useEffect(() => { // **dpop09** log the user out when user tries to reload the page
    if (!isLoggedIn) {
      navigateToLoginPage()
    }
  }, [isLoggedIn, setIsLoggedIn]);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const emailResult = await clientDatabaseOperations.fetchEmail(username); // **dpop09** fetch email from database for the user upon loading the page or when the email is changed
        setEmail(emailResult);
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };
  
    fetchEmail();
  }, [username]);

  useEffect(() => {
    const fetchCreatedChatbots = async () => {
      const data = await clientDatabaseOperations.getCreatedChatbotData(username)
      setCreatedChatbotCards(data)
      setIsCreatedChatbotCardsLoading(false)
    }
    fetchCreatedChatbots()
  }, [showDeleteSelectChatbotsModal, showDeleteAllChatbotsModal])

  const isEmailFormated = (parmtr_input_email) => {
    const EMAIL_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+(\.[a-zA-Z0-9]{1,20}){1,}$/ // **dpop09** email address be in format of (local-part@website.com) and domain length is at most 80 characters
    var domain = parmtr_input_email.split('@')[1]
    return (EMAIL_PATTERN.test(parmtr_input_email) && domain.length <= 80)
  }

  const handleShowEmail = () => { // **dpop09** dynamically controls the visibility of the change email form
    setEmailErrorMessage('')
    setEmailChangedSuccessMessage('')
    setVerficationCodeMessage('')
    setShowUpdateEmail(!showUpdateEmail)
  }
  const handleShowPassword = () => {  // **dpop09** dynamically controls the visibility of the change password form
    setPasswordErrorMessage('')
    setPasswordChangedSuccessMessage('')
    setPasswordRequirements({
      minChar: false,
      uppercase: false,
      number: false,
      specialChar: false, // Check for special characters
    });
    setShowUpdatePassword(!showUpdatePassword)
  }

  const sendVerificationEmail = async (parmtr_email) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString(); 
    const timestamp = Date.now();
    setVerificationCode({ code, timestamp }); 
    await new Promise(resolve => setTimeout(resolve, 0));
    const is_email_sent = await clientEmailOperations.sendEmail(parmtr_email, `Here is your verification code: ${code}. This code will expire in 10 minutes.`);
    return is_email_sent;
}

  const validateAndSendVerificationCode = async () => {
    const input_new_email = document.getElementById('Profile-FormControl-new-email').value;
    if (input_new_email === "") {
      setEmailErrorMessage("Please enter your new email.");
      setEmailConfirmationMessage("");
      return;
    }
    const is_input_email_formated = isEmailFormated(input_new_email);
    if (!is_input_email_formated) {
      setEmailErrorMessage("Email is not formatted correctly.");
      setEmailConfirmationMessage("");
      return;
    }
    const is_email_in_database = await clientDatabaseOperations.isEmailInDatabase(input_new_email);
    if (is_email_in_database) {
      setEmailErrorMessage("This email is already registered in our database. Choose a different email.");
      setEmailConfirmationMessage("");
      return;
    }
    const is_verification_code_sent = await sendVerificationEmail(input_new_email); 
    if (is_verification_code_sent) {
      setEmailConfirmationMessage("Please check your email for a 4-digit code. This code will expire in 10 minutes.");
      setEmailErrorMessage("");
      setVerificationCodeRequested(true);
      setIsButtonDisabled(true)
      setTimeout(() => { // **dpop09** after 10 seconds disable the button and clear the success message
          setIsButtonDisabled(false)
          setEmailConfirmationMessage("")
      }, 10000)
    }
    setNewEmail(input_new_email);
  };
  
  const handleVerificationCode = async (event) => {
    event.preventDefault();
    const input_verification_code = document.getElementById('Profile-FormControl-verification-code').value;
    const current_timestamp = Date.now();
    const time_difference = Math.floor((current_timestamp - verificationCode.timestamp) / 60000);
    if (time_difference > 10) { 
      setVerficationCodeMessage("Verification code has expired. Please request a new one.");
      setEmailChangedSuccessMessage("");
      return;
    }
    if (input_verification_code !== verificationCode.code) {
      setVerficationCodeMessage("Incorrect verification code. Please try again.");
      setEmailChangedSuccessMessage("");
      return;
    }
    const is_email_updated = await clientDatabaseOperations.updateEmail(username, newEmail);
    if (!is_email_updated) {
      setVerficationCodeMessage("An error occurred in the server. Please try again another time.");
      setEmailChangedSuccessMessage("");
    }
    setEmail(newEmail); // **dpop09** update the email state
    setVerificationCode({ code: '', timestamp: 0 }); // **dpop09** reset the verification code state
    setEmailConfirmationMessage('');
    setVerficationCodeMessage("");
    setEmailChangedSuccessMessage("Email updated successfully.")
  };

  const showMyProfileContent = () => {
    setShowProfile(true)
  }
  const showMyChatbotsContent = () => {
    setShowProfile(false)
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
    setPasswordShown(!passwordShown)
  }
  const toggleConfirmPasswordVisibility = (event) => {
    event.preventDefault()
    setConfirmPasswordShown(!confirmPasswordShown)
  }
  const isPasswordValidated = (parmtr_password) => {
    const PASSWORD_PATTERN = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[\\S]{8,}$')
    return PASSWORD_PATTERN.test(parmtr_password)
  }

  const validatePassword = async (event) => {
    event.preventDefault()
    const input_password = document.getElementById("Profile-FormControl-password").value
    const input_verify_password = document.getElementById("Profile-FormControl-confirm-password").value
    if (input_password === "" || input_verify_password === "") { // **dpop09** check if password and verify password fields are empty
        setPasswordErrorMessage("Please fill in the password and verify password fields.")
        setPasswordChangedSuccessMessage('')
        return
    }
    const is_password_valid = isPasswordValidated(input_password)
    if (!is_password_valid) { // **dpop09** check if password meets password requirements
        setPasswordErrorMessage("Password does not meet password requirements.")
        setPasswordChangedSuccessMessage('')
        return
    }
    if (input_password !== input_verify_password) { // **dpop09** check if password and verify password match
        setPasswordErrorMessage("Passwords do not match.")
        setPasswordChangedSuccessMessage('')
        return
    }
    const is_password_updated_in_database = await clientDatabaseOperations.updatePassword(email, input_password)
    if (!is_password_updated_in_database) { // **dpop09** check if password is updated in database
        setPasswordErrorMessage("Unable to update password. Please try again another time.")
        setPasswordChangedSuccessMessage('')
        return
    }
    setPasswordErrorMessage("")
    setPasswordChangedSuccessMessage("Password updated successfully.")
  }
  
  const handleDeleteAccount = async () => {
    const input_confirm_deletion = document.getElementById("Profile-FormControl-deleteConfirmation").value
    if (input_confirm_deletion === "") {
      setDeleteAccountErrorMessage("Please fill in the delete confirmation field.")
      return
    }
    if (input_confirm_deletion !== `DELETE ${username}`) {
      setDeleteAccountErrorMessage("Incorrect delete confirmation. Please try again.")
      return
    }
    const is_account_deleted = await clientDatabaseOperations.deleteAccount(username)
    if (!is_account_deleted) {
      setDeleteAccountErrorMessage("Unable to delete account. Please try again another time.")
      return
    }

    setShowDeleteAccountModal(false)
    navigateToLoginPage()
  };

  const handleDeleteAllChatbots = async () => {
    const result = await clientDatabaseOperations.deleteAllChatbotsByCreator(username)
    console.log(result)
    setShowDeleteAllChatbotsModal(false)
  }

  const handleDeleteSelectChatbot = async (parmtr_chatbot_id) => {
    const result = await clientDatabaseOperations.deleteChatbot(parmtr_chatbot_id)
    console.log(result)
    setShowDeleteSelectChatbotsModal(false)
  }

  const renderPasswordRequirements = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      <ul id="Profile-ul-password-requirements">
        <li id={passwordRequirements.minChar ? "Profile-li-requirement-met" : "Profile-li-requirement-not-met"}>
          {passwordRequirements.minChar ? '✓' : '✕'} At least 8 char
        </li>
        <li id={passwordRequirements.uppercase ? "Profile-li-requirement-met" : "Profile-li-requirement-not-met"}>
          {passwordRequirements.uppercase ? '✓' : '✕'} At least 1 uppercase
        </li>
        <li id={passwordRequirements.number ? "Profile-li-requirement-met" : "Profile-li-requirement-not-met"}>
          {passwordRequirements.number ? '✓' : '✕'} At least 1 number
        </li>
        <li id={passwordRequirements.specialChar ? "Profile-li-requirement-met" : "Profile-li-requirement-not-met"}>
          {passwordRequirements.specialChar ? '✓' : '✕'} At least 1 special char (!@#$%^&*)
        </li>
      </ul>
    </Tooltip>
  )

  return (
    <Container id="Profile-Container">
      <div id="Profile-div-SideNav">
        <Card id='Profile-Card-SideNav-top' onClick={showMyProfileContent}>
          <Card.Header>
            <h6 id="Profile-Card-SideNav-top-h6">My Profile</h6>
          </Card.Header>
        </Card>
        <Card id='Profile-Card-SideNav' onClick={showMyChatbotsContent}>
          <Card.Header>
            <h6 id="Profile-Card-SideNav-top-h6">My Chatbots</h6>
          </Card.Header>
        </Card>
      </div>
      {showProfile ? (
        <div id="Profile-div-content">
          <div id="Profile-div-header">
            <h1>My Profile</h1>
          </div>
          <div id='Profile-div-form'>
            <Form.Group className="mb-3">
              <Form.Label id='Profile-FormLabel'>USERNAME</Form.Label>
              <Form.Control id='Profile-FormControl-username' type="text" placeholder={username} disabled readOnly/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label id='Profile-FormLabel'>CURRENT EMAIL</Form.Label>
              <Form.Control id='Profile-FormControl-email' type="text" placeholder={email} disabled readOnly/>
            </Form.Group>
            <Button id='Profile-Button-changeEmail' onClick={handleShowEmail}>CHANGE EMAIL</Button>
            
            { showUpdateEmail ? (
            <Form.Group id="Profile-FormGroup-updateEmail" className="mb-3">
              <Form.Label id='Profile-FormLabel'>ENTER NEW EMAIL</Form.Label>
              <Form.Control
              id='Profile-FormControl-new-email'
              type="text"
              placeholder="email@address.com"/>
              {emailErrorMessage !== ''? (<p id='Profile-p-error'>{emailErrorMessage}</p>):null }
              {verificationCodeRequested && emailConfirmationMessage && (<p id='Profile-p-success'>{emailConfirmationMessage}</p>)}
              <Button id='Profile-Button-updateEmail' onClick={validateAndSendVerificationCode} disabled={isButtonDisabled}>SEND CODE</Button>
              <Form.Label id='Profile-FormLabel'>ENTER CODE</Form.Label>
              <Form.Control
              id='Profile-FormControl-verification-code'
              type="text"
              placeholder="1234"/>
              {verficationCodeMessage !== ''? (<p id='Profile-p-error'>{verficationCodeMessage}</p>):null }
              {emailChangedSuccessMessage !== ''? (<p id='Profile-p-success'>{emailChangedSuccessMessage}</p>):null }
              <Button id='Profile-Button-verifyCode' onClick={handleVerificationCode}>CONFIRM EMAIL</Button>
              </Form.Group>
              ):null
            }
            <Button id='Profile-Button-changePassword' onClick={handleShowPassword}>CHANGE PASSWORD</Button>
            { showUpdatePassword ? (
              <Form id='Profile-Form' onSubmit={validatePassword}>
                <Form.Group className='mb-3'>
                  <Form.Label id='Profile-FormLabel'>PASSWORD</Form.Label>
                    <div id='Profile-div-password'>
                      <OverlayTrigger
                        placement="top"
                        trigger={"focus"} /* **dpop09** trigger on focus */
                        overlay={renderPasswordRequirements}
                      >
                        <Form.Control 
                          id='Profile-FormControl-password' 
                          type={passwordShown ? 'text' : 'password'} 
                          placeholder='Password' 
                          onChange={handlePasswordChange}
                        />
                      </OverlayTrigger>
                      <Button id={passwordShown ? 'Profile-Button-hide-password' : 'Profile-Button-show-password'} onClick={togglePasswordVisibility}></Button>
                    </div>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label id='Profile-FormLabel'>CONFIRM PASSWORD</Form.Label>
                    <div id='Profile-div-password'>
                    <Form.Control 
                        id='Profile-FormControl-confirm-password' 
                        type={confirmPasswordShown ? 'text' : 'password'} 
                        placeholder='Confirm Password'
                    />
                    <Button id={confirmPasswordShown ? 'Profile-Button-hide-confirm-password' : 'Profile-Button-show-confirm-password'} onClick={toggleConfirmPasswordVisibility}></Button>
                    </div>
                </Form.Group>
                {passwordErrorMessage && <p id='Profile-p-error'>{passwordErrorMessage}</p>}
                {passwordChangedSuccessMessage && <p id='Profile-p-success'>{passwordChangedSuccessMessage}</p>}
                <Button type='submit' id='Profile-Button-changePassword-submit'>UPDATE PASSWORD</Button>
              </Form>
            ):null
            }
            <Button id="Profile-Button-deleteAccount" variant="danger" onClick={() => setShowDeleteAccountModal(true)} className="delete-account-button">DELETE ACCOUNT</Button>
          </div>
          <Modal 
            show={showDeleteAccountModal} 
            onHide={() => setShowDeleteAccountModal(false)} 
            id="Profile-Modal-deleteAccount"            
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
            <Modal.Header id="Profile-ModalHeader-deleteAccount">
              <Modal.Title id="Profile-ModalTitle-deleteAccount">Are you sure you want to delete your account?</Modal.Title>
            </Modal.Header>
            <Modal.Body id="Profile-ModalBody-deleteAccount">
              <p id='Profile-p-deleteAccount-warning'>After deleting your account, you will no longer be able to access your private chatbots. This action cannot be undone. All of your public and whitelist chatbots will remain.</p>
              <h6>Please confirm by typing <span id='Profile-span-deleteAccount-instruction'>'DELETE [USERNAME]'</span> in the box below.</h6>
              <Form.Group controlId="Profile-Modal-Form-EmailConfirmation">
                <Form.Control
                  type="text"
                  id="Profile-FormControl-deleteConfirmation"
                  placeholder='DELETE [USERNAME]'
                />
              </Form.Group>
              {deleteAccountErrorMessage && <p id="Profile-p-deleteAccount-error">{deleteAccountErrorMessage}</p>}
            </Modal.Body>
            <Modal.Footer id="Profile-ModalFooter-deleteAccount">
              <Button variant="secondary" onClick={() => {
                setDeleteAccountErrorMessage('')
                setShowDeleteAccountModal(false)}}
                id="Profile-Modal-Button-Cancel">CANCEL</Button>
              <Button variant="danger" onClick={handleDeleteAccount} id="Profile-Modal-Button-Delete">CONFIRM</Button>
            </Modal.Footer>
          </Modal>
        </div> 
      ) : 
        <div id='Profile-div-content'>
          <div id='Profile-div-header'>
            <h1>My Chatbots</h1>
          </div>
          <div id={isCreatedChatbotCardsLoading ? 'Profile-div-chatbot-cards-container-loading' : 'Profile-div-chatbot-cards-container'}>
            {isCreatedChatbotCardsLoading ? (
              <div id='Profile-div-cards-loader'></div>
                ) : (
                createdChatbotCards.length !== 0 ? (
                  createdChatbotCards.map((chatbot, index) => (
                    <Card key={index} id='Profile-Card-chatbot-card' onClick={() => navigateToChat(chatbot.ChatbotID, chatbot.Name)}>
                      <div id='Profile-div-card-top'>
                        <Card.Img 
                            id='Profile-CardImg-avatar' 
                            variant='top' 
                            src={chatbot.ImageData ? `data:image/jpeg;base64,${chatbot.ImageData}` : mistralAvatar} 
                        />
                        <Card.Title id='Profile-CardTitle-name'>{chatbot.Name}</Card.Title>
                        <Card.Text id='Profile-CardText-greeting'>
                          {chatbot.Greeting.length > 68 ? chatbot.Greeting.slice(0,68) + '...' : chatbot.Greeting}  {/* display only the first 68 characters*/}
                        </Card.Text>
                      </div>
                      <div id='Profile-div-card-bottom'>
                        <Card.Text id='Profile-CardText-creator'>@{chatbot.Creator}</Card.Text>
                        <div id='Profile-div-likes-flexbox'>
                          <img src={thumbsupIcon} alt='thumbsup-icon'></img>
                          <Card.Text id='Profile-CardText-likes'>{chatbot.Likes}</Card.Text>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div id='Profile-div-empty'><p>Create a character chatbot by clicking on the plus sign in the navigation bar above.</p></div>
                )
            )}
          </div>
          <div id='Profile-div-buttons-container'>
            <Button id='Profile-Button-deleteSelectChatbots' variant='danger' onClick={() => setShowDeleteSelectChatbotsModal(true)}>DELETE SELECT CHATBOTS</Button>
            <Button id='Profile-Button-deleteAllChatbots' variant="danger" onClick={() => setShowDeleteAllChatbotsModal(true)}>DELETE ALL CHATBOTS</Button>
          </div>
          <Modal
            id='Profile-Modal-deleteSelect'
            show={showDeleteSelectChatbotsModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Title id='Profile-ModalTitle-deleteSelect'>
              <h4>Select Chatbots to Delete</h4>
            </Modal.Title>
            <Modal.Body id='Profile-ModalBody-deleteSelect'>
              {createdChatbotCards.length !== 0 ? (
                createdChatbotCards.map((chatbot, index) => (
                  <Card id='Profile-Card-deleteSelect' key={index}>
                    <Card.Img
                      id='Profile-CardImg-avatar-deleteSelect'
                      variant='top'
                      src={chatbot.ImageData ? `data:image/jpeg;base64,${chatbot.ImageData}` : mistralAvatar}
                    />
                    <Card.Title id='Profile-CardTitle-name-deleteSelect'>{chatbot.Name}</Card.Title>
                    <Card.Text id='Profile-CardText-greeting-deleteSelect'>
                      {chatbot.Greeting.length > 60 ? chatbot.Greeting.slice(0,60) + '...' : chatbot.Greeting}  {/* display only the first 68 characters*/}
                    </Card.Text>
                    <Card.Text id='Profile-CardText-likes-deleteSelect'>
                      <div id='Profile-div-likes-flexbox-deleteSelect'><img id='Profile-img-thumbsup' src={thumbsupIcon} alt='thumbsup-icon'></img>
                        {chatbot.Likes}
                      </div>
                    </Card.Text>
                    <Button id='Profile-Button-deleteSelectChatbot' variant='danger' onClick={() => handleDeleteSelectChatbot(chatbot.ChatbotID)}>Delete</Button>
                  </Card>
                ))
              ): (
                <div id='Profile-div-empty'><p>You don't have any chatbots.</p></div>
              )}
              
            </Modal.Body>
            <Modal.Footer id='ChatUI-ModalFooter'>
              <Button variant='secondary' onClick={() => setShowDeleteSelectChatbotsModal(false)}>Cancel</Button>
            </Modal.Footer>
          </Modal>
          
          <PromptDeleteAllChatbotsModal show={showDeleteAllChatbotsModal} onHide={() => setShowDeleteAllChatbotsModal(false)} onConfirm={handleDeleteAllChatbots}/>
        </div>
      }
    </Container>
  );
}

export default Profile

