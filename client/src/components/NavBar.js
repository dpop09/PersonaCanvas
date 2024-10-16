/*
**RukiyahA**
NavBar componennt that is consistent for all pages of the website
*/
import React, { useContext, useEffect, useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css'
import { AuthContext } from './AuthContext';
import homeIcon from '../images/home-icon.png'
import createIcon from '../images/create-icon.png'
import chatIcon from '../images/chat-icon.png'
import userIcon from '../images/user-icon-white.png'
import infoIcon from '../images/info-icon.png'
import logoutIcon from '../images/logout-icon.png'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
 
function CreateAccountModal(props) {
    return (
      <Modal id='NavBar-Modal'
        {...props}
        size="lg"
        centered
      >
        <Modal.Body id='NavBar-ModalBody'>
          <h4>You must create an account to access this feature.</h4>
        </Modal.Body>
        <Modal.Footer id='NavBar-ModalFooter'>
          <Button variant='secondary' onClick={props.onHide}>CANCEL</Button>
          <Button id='NavBar-Button-login' onClick={props.onConfirmLogin}>LOGIN</Button>
          <Button id='NavBar-Button-register' onClick={props.onConfirmRegister}>REGISTER</Button>
        </Modal.Footer>
      </Modal>
    )
}

function NavBar() {
 
    const { isLoggedIn, isGuest } = useContext(AuthContext)
    const [modalShow, setModalShow] = useState(false)
 
    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate('/Home') //navigates to the create home page
    }
    const navigateToCreate = () => {
        if (isGuest) {
           setModalShow(true) 
        } else {
           navigate('/ChatbotCreationUI') //navigates to the create character page 
        }
    }
    const navigateToConversations = () => {
        navigate('/Conversations') //navigates to the chat page
    }
    const navigateToProfile = () => {
        if (isGuest) {
           setModalShow(true) 
        } else {
          navigate('/Profile') //navigates to the profile page  
        }
    }
    const navigateToAbout = () => {
        navigate('/AboutUs') //navigates to the about us page
    }
    const navigateToLogin = () => {
      navigate('/') //navigates to the login page
    }
    const navigateToRegister = () => {
      navigate('/Register') //navigates to the register page
    }
 
    return (
        <Navbar fixed='top' expand='lg' id="NavBar-Navbar">
            <Container fluid className='justify-content-between'>
                <Navbar.Brand id='NavBar-NavbarBrand-logo'>PersonaCanvas</Navbar.Brand>
                {isLoggedIn || isGuest? (     // **dpop** user must be logged in to see the navbar contents
                    <>
                        <Navbar.Toggle aria-controls='basic-navbar-nav' id ='NavBar-NavbarToggler'/>
                        <Navbar.Collapse className='justify-content-end'>
                            <Nav id='NavBar-Nav' className='ms-auto'>
                                <Nav.Link id='NavBar-NavLink' onClick={navigateToHome}><img src={homeIcon} alt='home-icon'></img>Home</Nav.Link>
                                <Nav.Link id='NavBar-NavLink' onClick={navigateToCreate}><img src={createIcon} alt='create-icon'></img>Create</Nav.Link>
                                <Nav.Link id='NavBar-NavLink' onClick={navigateToConversations}><img src={chatIcon} alt='chat-icon'></img>Chat</Nav.Link>
                                <Nav.Link id='NavBar-NavLink' onClick={navigateToProfile}><img src={userIcon} alt='user-icon'></img>Profile</Nav.Link>
                                <Nav.Link id='NavBar-NavLink' onClick={navigateToAbout}><img src={infoIcon} alt='info-icon'></img>About Us</Nav.Link>
                                <Nav.Link id='NavBar-NavLink' onClick={navigateToLogin}><img src={logoutIcon} alt='logout-icon'></img>Logout</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </>
                ) : null}
            </Container>
            <CreateAccountModal 
                show={modalShow} 
                onHide={() => setModalShow(false)} 
                onConfirmLogin={() => {
                  setModalShow(false);
                  navigateToLogin();
                }}
                onConfirmRegister={() => {
                  setModalShow(false);
                  navigateToRegister();
                }}
            />
        </Navbar>
      );
}
 
export default NavBar