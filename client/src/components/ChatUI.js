/*
**jareshi**
Chat component will display when user creates a chatbot or opens an existing chat
*/
import React, { useState, useEffect, useRef, useContext } from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import '../styling/styling.css';
import clientChatbotOperations from '../apis/clientChatbotOperations'
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { AuthContext } from './AuthContext';
import thumbsUpIcon from '../images/thumbsup-icon.png'
import thumbsUpIconMint from '../images/thumbsup-icon-mint.png'
import Modal from 'react-bootstrap/Modal';
import mistralAvatar from '../images/mistral-avatar.png'
import userIcon from '../images/user-icon.png'


function DeleteConversationModal(props) {
  return (
    <Modal id='ChatUI-Modal'
      {...props}
      size="lg"
      centered
    >
      <Modal.Body id='ChatUI-ModalBody'>
        <h4>Are you sure you want to delete this conversation?</h4>
      </Modal.Body>
      <Modal.Footer id='ChatUI-ModalFooter'>
        <Button variant='secondary' onClick={props.onHide}>CANCEL</Button>
        <Button variant='danger' onClick={props.onConfirm}>DELETE</Button>
      </Modal.Footer>
    </Modal>
  )
}
function CreateAccountModal(props) {
  return (
    <Modal id='ChatUI-Modal-CreateAccount'
      {...props}
      size="lg"
      centered
    >
      <Modal.Body id='ChatUI-ModalBody-CreateAccount'>
        <h4>You must create an account to access this feature.</h4>
      </Modal.Body>
      <Modal.Footer id='ChatUI-ModalFooter-CreateAccount'>
        <Button variant='secondary' onClick={props.onHide}>CANCEL</Button>
        <Button id='ChatUI-Button-login' onClick={props.onLogin}>LOGIN</Button>
        <Button id='ChatUI-Button-register' onClick={props.onRegister}>REGISTER</Button>
      </Modal.Footer>
    </Modal>
  )
}

function ChatUI() {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isChatbotTyping, setIsChatbotTyping] = useState(false)
    const [isLoadingConversation, setIsLoadingConversation] = useState(true)
    const [showScrollLatestButton, setShowScrollLatestButton] = useState(false);

    const [errorNotification, setErrorNotification] = useState('');
    const [successNotification, setSuccessNotification] = useState('');

    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [isLiked, setIsLiked] = useState(false);
    const [modalShow, setModalShow] = useState(false)
    const [createAccountModalShow, setCreateAccountModalShow] = useState(false)
    const [chatbotData, setChatbotData] = useState({})

    const chatWindowRef = useRef(null);

    const {username} = useContext(AuthContext)
    const {chatbotId} = useContext(AuthContext)
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
    const { isGuest, setIsGuest } = useContext(AuthContext);

    const navigate = useNavigate()
    const navigateToRegister = () => {
      navigate('/Register')
    }
    const navigateToLoginPage = () => {
      navigate('/')
    }

    useEffect(() => { // **dpop09** log the user out when user tries to reload the page
      if (!isLoggedIn && !isGuest) {
        navigateToLoginPage()
      }
    }, [isLoggedIn, setIsLoggedIn, isGuest, setIsGuest]);

    const fetchGreeting = async () => {  // **dpop09 if the conversation history database has been emptied, this function will start a new conversation with the chatbot's greeting
      const data = await clientDatabaseOperations.fetchGreeting(chatbotId)
      if (data.greeting !== null) {
        var is_conversation_updated = await clientDatabaseOperations.insertGreetingIntoDatabase(chatbotId, username, data.greeting, chatbotData.Name) // **dpop09** store the chatbot's greeting into the conversation history database as the first message
        if (is_conversation_updated) {
          setConversation(prevConversation => [...prevConversation, {TextContent: data.greeting, SenderTag: chatbotData.Name, Timestamp: Date.now()}]);
        }
      }
    }

    const fetchChatbotData = async () => {
      const data = await clientDatabaseOperations.getChatbotData(chatbotId)
      setChatbotData(data)
    }

    useEffect(() => { // **dpop09** useEffect calls the fetchConversationHistory() function whenever ChatUI component is rendered, essentially saving and displaying the conversation history to the ChatUI
      const fetchConversationHistory = async () => {
        const data = await clientDatabaseOperations.fetchConversationHistory(chatbotId, username)
        if (data.db_conversation_history_array.length !== 0) {  // **dpop09** the retrieved conversation_history_array is not empty
          setConversation([...data.db_conversation_history_array])
        } else {  // **dpop09** the retrieved conversation_history_array is empty
          fetchGreeting()
        }
      }
      const isChatbotAlreadyLikedByUser = async () => {
        const is_chatbot_liked_by_user = await clientDatabaseOperations.isChatbotLikedByUser(chatbotId, username)
        setIsLiked(is_chatbot_liked_by_user)
      }
      const fetchErrorCodeObject = async () => {
        const error_code_object = await clientDatabaseOperations.getConversationErrorCode(chatbotId, username)
        if (error_code_object !== null) {
          if (error_code_object.ErrorCode !== 0) {
            setHasError(true)
            setErrorMessage('Error Code: ' + error_code_object.ErrorCode)
            setConversation(prevConversation => [...prevConversation, {TextContent: error_code_object.TextContent, SenderTag: error_code_object.SenderTag, Timestamp: error_code_object.Timestamp}])
          }
          else if (error_code_object.ErrorCode === 0) {
            setHasError(false)
            setErrorMessage('')
          }
        }
        return
      }
      const initializeChat = async () => {
        await fetchChatbotData()
        await isChatbotAlreadyLikedByUser() // **dpop09** check if the chatbot is already liked by the user
        await fetchConversationHistory()  // **dpop09** fetch the conversation history from the database
        await fetchErrorCodeObject()
        setIsLoadingConversation(false) // **dpop09** set the loading state to false
      }

      initializeChat()
    }, [])

    // All the auto-scroll functionality is here
    useEffect(() => {
      // Auto-scroll to the latest message
      const chatWindow = chatWindowRef.current;
      if (chatWindow) {
          chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    }, [conversation]);

    // Scroll to latest button function
    const scrollLatest = () => {
      const chatWindow = chatWindowRef.current;
      if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    };

    useEffect(() => {
      const chatWindow = chatWindowRef.current;
      const onScroll = () => {
        // Logic to determine if the 'Scroll to Bottom' button should show
        handleLatestButton();
      };
    
      // Set up the event listener
      chatWindow.addEventListener('scroll', onScroll);
    
      // Clean up the event listener
      return () => chatWindow.removeEventListener('scroll', onScroll);
    }, []);

    const handleLatestButton = () => {
      const chatWindow = chatWindowRef.current;
      if (chatWindow) {
        setShowScrollLatestButton(chatWindow.scrollTop < chatWindow.scrollHeight - chatWindow.clientHeight);
      }
    }
    // End of auto-scroll functionality ~ jareshi

    const likeChatbot = async () => {
      if (isGuest) {
        setCreateAccountModalShow(true)
        return
      } else {
        if (isLiked) {  // **dpop09** unlike the chatbot if already liked
          await clientDatabaseOperations.updateChatbotLikes(username, chatbotId, -1)
          setIsLiked(false)
          setChatbotData(prevChatbotData => ({ ...prevChatbotData, Likes: prevChatbotData.Likes - 1 }))
          setErrorNotification("")
          setSuccessNotification("Chatbot unliked")
          setTimeout(() => { // **dpop09** after 3 seconds, clear the error message
            setSuccessNotification("")
          }, 3000)
        } else {  // **dpop09** like the chatbot if not yet liked
          await clientDatabaseOperations.updateChatbotLikes(username, chatbotId, 1)
          setIsLiked(true)
          setChatbotData(prevChatbotData => ({ ...prevChatbotData, Likes: prevChatbotData.Likes + 1 }))
          setErrorNotification("")
          setSuccessNotification("Chatbot liked")
          setTimeout(() => { // **dpop09** after 3 seconds, clear the error message
            setSuccessNotification("")
          }, 3000)
        }
      }
    }

    const downloadConversation = async () => {
      const result = await clientDatabaseOperations.downloadConversation(chatbotId, chatbotData.Name, username)
      if (!result) { // **dpop09** if the server failed to download the conversation history
        setErrorNotification("Error: There was an issue with downloading the conversation history.")
        setSuccessNotification("")
        setTimeout(() => { // **dpop09** after 3 seconds, clear the error message
          setErrorNotification("")
        }, 3000)
      }
      setSuccessNotification("Conversation history downloaded. Check the root folder of this project.")
      setErrorNotification("")
      setTimeout(() => { // **dpop09** after 3 seconds, clear the success message
        setSuccessNotification("")
      }, 3000)
    }

    const resetConversation = async () => {
      setModalShow(false)
      setHasError(false)
      if (conversation.length <= 1) {  // **dpop09** don't do anything if the conversation array  is already empty or contains only the greeting
        return
      }
      var result = await clientDatabaseOperations.deleteConversation(chatbotId, username)
      if (!result) { // **dpop09** if the server failed to download the conversation history
        setErrorNotification("Error: There was an issue with trying to delete the conversation history.")
        setSuccessNotification("")
        setTimeout(() => { // **dpop09** after 3 seconds, clear the error message
          setErrorNotification("")
        }, 3000)
      }
      setSuccessNotification("Conversation history deleted")
      setErrorNotification("")
      setTimeout(() => { // **dpop09** after 3 seconds, clear the success message
        setSuccessNotification("")
      }, 3000)
      setConversation([])
      fetchGreeting()
    }


    const addUserMessageToConversation = () => {
      if (message === "") {
        return
      }
      setConversation(prevConversation => [...prevConversation, {TextContent: message, SenderTag: username, Timestamp: Date.now()}]);
      setMessage('')
    };



    const addChatbotMessageToConversation = (parmtr_chatbot_reply) => {
      if (message === "") {
        return
      }
      setConversation(prevConversation => [...prevConversation, {TextContent: parmtr_chatbot_reply.TextContent, SenderTag: parmtr_chatbot_reply.SenderTag, Timestamp: parmtr_chatbot_reply.Timestamp}])
    }



    const sendMessage = async () => {
      if (message === "") { // **dpop09** don't do anything if the message box is empty
        return
      }
      setIsChatbotTyping(true)  // **dpop09** start the bubble message indacating chatbot is typing
      const chatbot_response = await clientChatbotOperations.sendMessage(chatbotId, username, message, chatbotData.Name, 0)
      setIsChatbotTyping(false) // **dpop09** end the bubble message
      setMessage('')
      if (chatbot_response.ErrorCode === 0) {
        setHasError(false)
        return chatbot_response
      } else if (chatbot_response.ErrorCode !== 0) {
        setHasError(true)
        return chatbot_response
      }
    };
  


    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addUserMessageToConversation()  // **dpop09** user's message should display immediately in the ChatUI independently from chatbot's reply
        sendMessage().then(chatbot_reply => { // **dpop09** addChatbotMessageToConversation() depends on the async sendMessage()
          addChatbotMessageToConversation(chatbot_reply)
        })
      }
    };



    const handleSend = (event) => {
      event.preventDefault()
      addUserMessageToConversation()  // **dpop09** user's message should display immediately in the ChatUI independently from chatbot's reply
      sendMessage().then(chatbot_reply => { // **dpop09** addChatbotMessageToConversation() depends on the async sendMessage()
        addChatbotMessageToConversation(chatbot_reply)
      })
    }
  
    const formatDateTime = (timestamp) => { // **dpop09** convert the timestamp to a readable datetime format
      const date = new Date(timestamp);
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
      return date.toLocaleDateString('en-US', options);
    }

    const generateNewResponse = async () => {
      if (hasError) { // **dpop09** button is clicked to generate new chatbot response without error
        setHasError(false)
        setConversation(prevConversation => prevConversation.slice(0, -1));
        setIsChatbotTyping(true)  // **dpop09** start the bubble message indacating chatbot is typing
        const chatbot_response = await clientChatbotOperations.sendMessage(chatbotId, username, message, chatbotData.Name, 1)
        setIsChatbotTyping(false) // **dpop09** end the bubble message
        setMessage('')
        if (chatbot_response.ErrorCode === 0) {
          setHasError(false)
          return chatbot_response
        } else if (chatbot_response.ErrorCode !== 0) {
          setHasError(true)
          return chatbot_response
        }
      } else { // **dpop09** button is clicked to generate new chatbot response
        const regenerate_message = 'Give me a similar but different response to my last message.'
        // Remove the last message from the conversation
        setConversation(prevConversation => prevConversation.slice(0, -1));
        setIsChatbotTyping(true)  // **dpop09** start the bubble message indacating chatbot is typing
        const chatbot_response = await clientChatbotOperations.sendMessage(chatbotId, username, regenerate_message, chatbotData.Name, 2)
        setIsChatbotTyping(false) // **dpop09** end the bubble message
        setMessage('')
        if (chatbot_response.ErrorCode === 0) {
          setHasError(false)
          return chatbot_response
        } else if (chatbot_response.ErrorCode !== 0) {
          setHasError(true)
          return chatbot_response
        }
      }
    }

    const handleRegenerateResponse = (event) => {
      event.preventDefault()
      generateNewResponse().then(chatbot_reply => { // **dpop09** addChatbotMessageToConversation() depends on the async sendMessage()
        setConversation(prevConversation => [...prevConversation, {TextContent: chatbot_reply.TextContent, SenderTag: chatbot_reply.SenderTag, Timestamp: chatbot_reply.Timestamp}])
      })
    }

    const copyToClipboard = async (parmtr_text) => {
      try {
        await navigator.clipboard.writeText(parmtr_text); // **dpop09** copy the message content to the clipboard
        setErrorNotification("")
        setSuccessNotification("Copied to clipboard")
        setTimeout(() => { // **dpop09** after 3 seconds, clear the error message
          setSuccessNotification("")
        }, 3000)
      } catch (err) {
        setSuccessNotification("")
        setErrorNotification("Copy to clipboard failed")
        setTimeout(() => { // **dpop09** after 3 seconds, clear the error message
          setErrorNotification("")
        }, 3000)
      }
    }

    return (
      <Container id="ChatUI-Container">
        <div id='ChatUI-div-top'>
          <h1 id="ChatUI-h1-Name">{chatbotData.Name}</h1> 
          <h1 id="ChatUI-h1-Creator">@{chatbotData.Creator} </h1>
        </div> 
        <div id="ChatUI-Row-header">
          <Button id={isLiked ? 'ChatUI-Button-unlikeChatbot' : 'ChatUI-Button-likeChatbot'} onClick={likeChatbot}>
            <img id='ChatUI-img-likeChatbot' src={isLiked ? thumbsUpIconMint : thumbsUpIcon } alt="Like Chatbot" />
            <p id={isLiked ? 'ChatUI-p-unlikeChatbot' : 'ChatUI-p-likeChatbot'}>{chatbotData.Likes}</p>
          </Button>
          {errorNotification && <p id="ChatUI-p-error">{errorNotification}</p>}
          {successNotification && <p id="ChatUI-p-success">{successNotification}</p>}
          <div id='ChatUI-div-headerbuttons-flexbox'>
            <Button id='ChatUI-Button-download-conversation' onClick={downloadConversation}></Button>
            <Button id="ChatUI-Button-reset-conversation" onClick={() => setModalShow(true)}></Button>
          </div>
          <DeleteConversationModal show={modalShow} onHide={() => setModalShow(false)} onConfirm={resetConversation}/>
        </div>
        <div id={isLoadingConversation ? 'ChatUI-div-chatWindow-loading' : 'ChatUI-div-chatWindow'} ref={chatWindowRef}>
          {isLoadingConversation ? (
            <div id='ChatUI-div-loader'></div>
          ) : (
            conversation.map((message, index) => (
              <div key={index} className="ChatUI-div-exchangeContainer">
                {index % 2 === 0 && (
                  <div id='ChatUI-div-botMessage-container'>
                    <div id='ChatUI-div-botMessage-flexbox'>
                      <div id='ChatUI-div-botMessage-metadata'>
                        <img id='ChatUI-img-botMessage-avatar' src={chatbotData.ImageData ? `data:image/jpeg;base64,${chatbotData.ImageData}` : mistralAvatar} ></img>
                        <p id='ChatUI-p-botMessage-sendertag'>{chatbotData.Name}</p>
                        <p id='ChatUI-p-botMessage-timestamp'>{formatDateTime(message.Timestamp)}</p> 
                      </div>
                      <div id='ChatUI-div-botMessage-buttons'>
                        <Button id='ChatUI-Button-clipboard' onClick={() => copyToClipboard(message.TextContent)}></Button>
                        {index === conversation.length - 1 && index !== 0 && <Button  id='ChatUI-Button-regenerateMessage' onClick={handleRegenerateResponse}></Button>}
                      </div>
                    </div>
                    <div className={`ChatUI-div-botMessage ${hasError ? 'ChatUI-div-botMessage-error' : ''}`}>
                      <h6>{message.TextContent}</h6>
                    </div>
                  </div>
                )} {/* every even index in conversation array is a chatbot message */}
                {index % 2 === 1 && (
                  <div id='ChatUI-div-userMessage-container'>
                    <div id='ChatUI-div-userMessage-flexbox'>
                      <div id='ChatUI-div-userMessage-buttons'>
                        <Button id='ChatUI-Button-clipboard' onClick={() => copyToClipboard(message.TextContent)}></Button>
                      </div>
                      <div id='ChatUI-div-userMessage-metadata'>
                        <p id='ChatUI-p-userMessage-timestamp'>{formatDateTime(message.Timestamp)}</p>
                        <p id='ChatUI-p-userMessage-sendertag'>{message.SenderTag}</p>
                        <img id='ChatUI-img-userMessage-avatar' src={userIcon} ></img>
                      </div>
                    </div>
                    <div className="ChatUI-div-userMessage"><h6>{message.TextContent}</h6></div>
                  </div>
                )}  {/* every odd index in conversation array is a user message */}
              </div>
            ))
          )}
          {isChatbotTyping && (
            <div className="ChatUI-typing">
              <span className="ChatUI-circle scaling"></span>
              <span className="ChatUI-circle scaling"></span>
              <span className="ChatUI-circle scaling"></span>
            </div>
          )}
        </div>
        <Button id="ChatUI-Button-scroll-to-latest" onClick={scrollLatest} style={{ display: showScrollLatestButton ? 'block' : 'none' }}/>
        <div id="ChatUI-div-inputgroup">
            <Form.Control id='ChatUI-FormControl-usertext' type='text' placeholder='Type your message here...' disabled={isChatbotTyping || hasError}
            value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown}></Form.Control>
          <Button
            id={`ChatUI-Button-send-message${message.trim() !== '' ? '-active' : ''}`}
            onClick={handleSend}
            
          >
          </Button>
        </div>
        <CreateAccountModal 
          show={createAccountModalShow} 
          onHide={() => setCreateAccountModalShow(false)} 
          onLogin={() => {
            setCreateAccountModalShow(false)
            navigateToLoginPage()
          }}
          onRegister={() => {
            setCreateAccountModalShow(false);
            navigateToRegister()
          }} 
        />
      </Container>
    );    
  }
  
  export default ChatUI;