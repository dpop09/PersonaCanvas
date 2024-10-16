import React, { useContext, useEffect, useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations'
import { AuthContext } from './AuthContext'

function ChatbotCreation() {
    // **dpop09** useContext variables
    const { username } = useContext(AuthContext)
    const { setChatbotId } = useContext(AuthContext)
    const { isLoggedIn } = useContext(AuthContext)
    // **dpop09** useState variables
    const [errorMessage, setErrorMessage] = useState('')
    const [visibilityOption, setVisibilityOption] = useState('public')   // **dpop09** chatbot visibility is set to public by default
    const [roleOption, setRoleOption] = useState('character')   // **dpop09** role option is set to character by default
    const [showWhitelistBox, setShowWhitelistBox] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [selectedImageFile, setSelectedImageFile] = useState(null)
    const [showDocumentUpload, setShowDocumentUpload] = useState(false)

    const navigate = useNavigate()
    const navigateToLoginPage = () => {
        navigate('/')
    }

    useEffect(() => { // **dpop09** log the user out when user tries to reload the page
        if (!isLoggedIn) {
            navigateToLoginPage()
        }
    }, [isLoggedIn])
    
    const handleVisibilityChange = (event) => {
        setVisibilityOption(event.target.value)
        setErrorMessage('')  // **dpop09** reset the whitelist error
        if (event.target.value === 'whitelist') { // **dpop09** show the whitelist text box if the visibility option is set to whitelist
            setShowWhitelistBox(true)
        } else {
            setShowWhitelistBox(false)
        }
    }

    const handleRoleChange = (event) => {
        setRoleOption(event.target.value)
    }

    const handleImageFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const validTypes = ['image/png', 'image/jpeg']
            if (validTypes.includes(file.type)) {
                setSelectedImageFile(file)
                setErrorMessage('')
            } else {
                setErrorMessage('Only PNG or JPEG files are allowed.')
                event.target.value = null
            }
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const validTypes = ['application/pdf']
            if (validTypes.includes(file.type)) {
                setSelectedFile(file)
                setErrorMessage('')
            } else {
                setErrorMessage('Only PDF files are allowed.')
                event.target.value = null
            }
        }
    }

    const handleShowDocumentUpload = () => {
        setShowDocumentUpload(!showDocumentUpload)
    }

    const navigateToChat = (parmtr_chatbot_id) => {
        setChatbotId(parmtr_chatbot_id)
        navigate('/ChatUI') //navigates to the chat page
    }

    const isNameValidated = (parmtr_input_name) => {
        const NAME_PATTERN = /^[a-zA-Z0-9_\- ]{3,20}$/
        return NAME_PATTERN.test(parmtr_input_name)
    }

    const isGreetingValidated = (parmtr_input_greeting) => {
        return parmtr_input_greeting.length >= 20
    }

    const isPersonalityValidated = (parmtr_input_personality) => {
        return parmtr_input_personality.length >= 20
    }

    const isChatbotAddedToDatabase = async (parmtr_input_name, parmtr_input_greeting, parmtr_input_personality, parmtr_input_whitelist_array) => {
        var result_code = await clientDatabaseOperations.insertChatbotIntoDatabase(parmtr_input_name, parmtr_input_greeting, parmtr_input_personality, visibilityOption, parmtr_input_whitelist_array, roleOption, username, selectedFile, selectedImageFile)
        return result_code
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

    const validateForm = async (event) => {
        event.preventDefault()  // **dpop09** prevents the default form submission behavior
        var input_name = document.getElementById("ChatbotCreationUI-FormControl-name").value
        var input_greeting = document.getElementById("ChatbotCreationUI-FormControl-greeting").value
        const input_personality = document.getElementById("ChatbotCreationUI-FormControl-personality").value
        var input_whitelist_array = null

        if (input_name === "" || input_greeting === "" || input_personality === "") {
            setErrorMessage('The name, greeting, and personality fields must be filled')
            return
        }
        var is_name_validated = isNameValidated(input_name)
        if (!is_name_validated) {
            setErrorMessage("The chatbot's name must be 3 to 20 characters and contain only letters, numbers, underscore, dash and space")
            return
        }
        var is_greeting_validated = isGreetingValidated(input_greeting)
        if (!is_greeting_validated) {
            setErrorMessage("The chatbot's greeting must be at least 20 characters")
            return
        }
        if (!isPersonalityValidated(input_personality)) {
            setErrorMessage("The chatbot's personality must be at least 20 characters") // Set personality error message
            return
        }    
        if (showWhitelistBox === true) {
            var input_whitelist = document.getElementById("ChatbotCreationUI-FormControl-whitelist").value
            if (input_whitelist === "") {   // **dpop09** check if the whitelist field is empty
                setErrorMessage('The whitelist field must be filled')
                return
            }
            var input_whitelist_without_spaces = input_whitelist.replace(/\s/g, "")
            var input_whitelist_array = input_whitelist_without_spaces.split(",")
            input_whitelist_array.push(username) // **dpop09** add the current user to the whitelist automatically
            input_whitelist_array = [...new Set(input_whitelist_array)] // **dpop09** remove duplicates from the whitelist
            var reservedUsernames = []
            input_whitelist_array.forEach(username => {
                if (isUsernameAlreadyReserved(username)) {
                    reservedUsernames.push(username)
                }
            })
            if (reservedUsernames.length > 0) {
                setErrorMessage(`The following usernames are reserved and cannot be used: ${reservedUsernames.join(', ')}`)
                return
            }
            var nonexistent_usernames_array = await clientDatabaseOperations.checkWhitelistedUsernamesNotExist(input_whitelist_array)
            if (nonexistent_usernames_array.length > 0) {   // **dpop09** check if the whitelist contains nonexistent usernames
                setErrorMessage("The following usernames do not exist: " + nonexistent_usernames_array)
                return
            }
        }
        var result_code = await isChatbotAddedToDatabase(input_name, input_greeting, input_personality, input_whitelist_array)
        if (result_code === -1) {
            setErrorMessage("Server couldn't process your request at this time")
            return
          } else if (result_code === 1) {
            setErrorMessage("Your document file must be a PDF file type")
            return
          } else if (result_code === 2) {
            setErrorMessage("Your PDF file must be at most 1MB")
            return
          } else if (result_code === 3) {
            setErrorMessage("The database couldn't store your chatbot")
            return
          }
        
        // **dpop09** immediately navigate to the chat page with the newly created chatbot
        await clientDatabaseOperations.getChatbotID(username, input_name, input_greeting, visibilityOption).then(result => navigateToChat(result))
    }

    return (
        <Container id='ChatbotCreationUI-Container'>
            <div id='ChatbotCreationUI-Container-top'>
                <h1>Create Character Chatbot</h1>
            </div>
            <div id='ChatbotCreationUI-div-asterisk'>
                <p>"*" indicates a required field.</p>
            </div>
            <Form id='ChatbotCreationUI-Form'>
                <Form.Group className='mb-3'>
                    <h3>Chatbot's Avatar</h3>
                    <Form.Label id='ChatbotCreationUI-FormLabel'>Give your character chatbot an avatar by uploading an image.</Form.Label>
                    <Form.Control id='ChatbotCreationUI-FormControl-avatar' onChange={handleImageFileChange} type='file' accept='.png, .jpeg, .jpg'/>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <h3>*Chatbot's Name</h3>
                    <Form.Label id='ChatbotCreationUI-FormLabel'>Give your character chatbot a name.</Form.Label>
                    <Form.Control id='ChatbotCreationUI-FormControl-name' type='text' placeholder='Name'></Form.Control>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <h3>*Chatbot's Greeting</h3>
                    <Form.Label id='ChatbotCreationUI-FormLabel'>Give your character chatbot an initial greeting.</Form.Label>
                    <Form.Control id='ChatbotCreationUI-FormControl-greeting' as='textarea' rows={3} placeholder="Hello! It's a pleasure to meet you. My name is..."></Form.Control>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <h3>*Chatbot's Personality</h3>
                    <Form.Label id='ChatbotCreationUI-FormLabel'>Tell your character chatbot how it should behave.</Form.Label>
                    <Form.Control id='ChatbotCreationUI-FormControl-personality' as='textarea' rows={3} placeholder="I'm a friendly and polite AI assistant chatbot."></Form.Control>
                </Form.Group>
                <h3>Chatbot's Visibility</h3>
                <div key='inline-radio' className='mb-3'>
                    <Form.Label id='ChatbotCreationUI-FormLabel'>Do you want everyone to be able to talk to your chatbot?</Form.Label><br></br>
                    <Form.Check inline name='chatbot-visibility' label='Public: Anyone can chat' id='ChatbotCreationUI-FormCheck-radio-button' type='radio' value='public' checked={visibilityOption === 'public'} onChange={handleVisibilityChange}></Form.Check>
                    <Form.Check inline name='chatbot-visibility' label='Private: Only you can chat' id='ChatbotCreationUI-FormCheck-radio-button' type='radio' value='private' checked={visibilityOption === 'private'} onChange={handleVisibilityChange}></Form.Check>  
                    <Form.Check inline name='chatbot-visibility' label='Whitelist: Only specific users can chat' id='ChatbotCreationUI-FormCheck-radio-button' type='radio' value='whitelist' checked={visibilityOption === 'whitelist'} onChange={handleVisibilityChange}></Form.Check>
                </div>
                {showWhitelistBox && <Form.Group className='mb-3'>
                    <Form.Label id='ChatbotCreationUI-FormLabel'>Enter comma separated usernames. Creator is automatically whitelisted.</Form.Label>
                    <Form.Control id='ChatbotCreationUI-FormControl-whitelist' type='text' placeholder='User1, User2, User3,...'></Form.Control>
                </Form.Group>}
                <h3>Chatbot's Role</h3>
                <div className='mb-3'>
                    <Form.Label id='ChatbotCreationUI-FormLabel'>Choose a role for your chatbot to embody?</Form.Label><br></br>
                    <Form.Check inline name='chatbot-role' label='Character' id='ChatbotCreationUI-FormCheck-radio-button' type='radio' value='character' checked={roleOption === 'character'} onChange={handleRoleChange}></Form.Check>
                    <Form.Check inline name='chatbot-role' label='Assistant' id='ChatbotCreationUI-FormCheck-radio-button' type='radio' value='assistant' checked={roleOption === 'assistant'} onChange={handleRoleChange}></Form.Check>
                </div>
                {showDocumentUpload && 
                    <Form.Group className='mb-3' controlId="formFile">
                        <h3>Upload a Document</h3>
                        <Form.Label id='ChatbotCreationUI-FormLabel'>Extend your character chatbot's knowledge base with a PDF document under 1MB.</Form.Label>
                        <Form.Control id='ChatbotCreationUI-FormControl-file' type="file" onChange={handleFileChange} accept='application/pdf'/>
                    </Form.Group>
                }
                {errorMessage && <div id='ChatbotCreationUI-div-errorMessage'>{errorMessage}</div>}  
            </Form>
            <div id='ChatbotCreationUI-div-buttons'>
                <Button type='click' id='ChatbotCreationUI-Button-create' onClick={validateForm}>CREATE & CHAT</Button>
                <Button type='click' id={showDocumentUpload ? 'ChatbotCreationUI-Button-advanced-active' : 'ChatbotCreationUI-Button-advanced'} onClick={handleShowDocumentUpload}>ADVANCED OPTIONS</Button>
            </div>
        </Container>
    )
}

export default ChatbotCreation