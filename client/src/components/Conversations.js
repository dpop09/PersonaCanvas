import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext';
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import mistralAvatar from '../images/mistral-avatar.png'
import thumbsupIcon from '../images/thumbsup-icon.png'
import '../styling/styling.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import userIcon from '../images/user-icon.png'
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations';

function Conversations() {

    const { setChatbotId } = useContext(AuthContext)
    const { username } = useContext(AuthContext)

    const [historyChatbotCards, setHistoryChatbotCards] = useState([]);
    const [isHistoryChatbotCardsLoading, setIsHistoryChatbotCardsLoading] = useState(true);
    const [conversation, setConversation] = useState([]);
    const [isLoadingConversation, setIsLoadingConversation] = useState(true)
    const [hasError, setHasError] = useState(false);
    const [chatbotData, setChatbotData] = useState({})

    const navigateToLoginPage = () => {
        navigate('/') //navigates to the login page
      }
      const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
      const { isGuest, setIsGuest } = useContext(AuthContext);
      useEffect(() => { // **dpop09** log the user out when user tries to reload the page
        if (!isLoggedIn && !isGuest) {
          navigateToLoginPage()
        }
      }, [isLoggedIn, setIsLoggedIn, isGuest, setIsGuest]);

    useEffect(() => {
        const fetchHistoryChatbotCards = async () => {
            const data = await clientDatabaseOperations.getHistoryChatbots(username);
            setHistoryChatbotCards(data);
            setIsHistoryChatbotCardsLoading(false);
        };
        fetchHistoryChatbotCards();
    }, [])

    const navigate = useNavigate();
    const navigateToChat = (parmtr_chatbot_id) => {
        setChatbotId(parmtr_chatbot_id)
        navigate('/ChatUI') //navigates to the chat page
    }

    const formatDateTime = (timestamp) => { // **dpop09** convert the timestamp to a readable datetime format
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        return date.toLocaleDateString('en-US', options);
      }

    const handleMouseEnter = async (parmtr_chatbot_id) => {
        const fetchConversationHistory = async () => {
            const data = await clientDatabaseOperations.fetchConversationHistory(parmtr_chatbot_id, username)
            setConversation([...data.db_conversation_history_array])
        }
        const fetchChatbotData = async () => {
            const data = await clientDatabaseOperations.getChatbotData(parmtr_chatbot_id)
            setChatbotData(data)
        }
        fetchConversationHistory()
        fetchChatbotData()
        setIsLoadingConversation(false)
    }

    return (
        <Container id='Conversations-Container'>
            <div id='Conversations-div-top'>
                <h1>My Conversations</h1>
            </div>
            <div id='Conversations-div-section'>
                <Row><h2>Continue Chatting</h2></Row>
                <div id={isHistoryChatbotCardsLoading ? 'Conversations-div-chatbot-cards-container-loading' : 'Conversations-div-chatbot-cards-container'}>
                {isHistoryChatbotCardsLoading ? (
                    <div id='Conversations-div-cards-loader'></div>
                ) : (
                    historyChatbotCards.length !== 0 ? (
                    historyChatbotCards.map((chatbot, index) => (
                        <Card key={index} id='Conversations-Card-chatbot-card' onClick={() => navigateToChat(chatbot.ChatbotID)} onMouseEnter={() =>handleMouseEnter(chatbot.ChatbotID)}>
                        <div id='Conversations-div-card-top'>
                            <Card.Img 
                                id='Conversations-CardImg-avatar' 
                                variant='top' 
                                src={chatbot.ImageData ? `data:image/jpeg;base64,${chatbot.ImageData}` : mistralAvatar} 
                            />
                            <Card.Title id='Conversations-CardTitle-name'>{chatbot.Name}</Card.Title>
                            <Card.Text id='Conversations-CardText-greeting'>
                            {chatbot.Greeting.length > 68 ? chatbot.Greeting.slice(0,68) + '...' : chatbot.Greeting}  {/* display only the first 68 characters*/}
                            </Card.Text>
                        </div>
                        <div id='Conversations-div-card-bottom'>
                            <Card.Text id='Conversations-CardText-creator'>@{chatbot.Creator}</Card.Text>
                            <div id='Conversations-div-likes-flexbox'>
                            <img src={thumbsupIcon} alt='thumbsup-icon'></img>
                            <Card.Text id='Conversations-CardText-likes'>{chatbot.Likes}</Card.Text>
                            </div>
                        </div>
                        </Card>
                    ))
                    ) : (
                    <div id='Conversations-div-empty'><p>Click on a chatbot card in the home page to start a conversation.</p></div>
                    )
                )}
                </div>
            </div>
            <Row><h2>Preview</h2></Row>
            <div id={isLoadingConversation ? 'Conversations-div-chatWindow-loading' : 'Conversations-div-chatWindow'}>
            {isLoadingConversation ? (
                <div id='Conversations-div-empty'><p>Hover over a chatbot card to see your conversation.</p></div>
            ) : (
                conversation.map((message, index) => (
                <div key={index} className="Conversations-div-exchangeContainer">
                    {index % 2 === 0 && (
                    <div id='Conversations-div-botMessage-container'>
                        <div id='Conversations-div-botMessage-flexbox'>
                            <div id='Conversations-div-botMessage-metadata'>
                                <img id='Conversations-img-botMessage-avatar' src={chatbotData.ImageData ? `data:image/jpeg;base64,${chatbotData.ImageData}` : mistralAvatar} ></img>
                                <p id='Conversations-p-botMessage-sendertag'>{chatbotData.Name}</p>
                                <p id='Conversations-p-botMessage-timestamp'>{formatDateTime(message.Timestamp)}</p> 
                            </div>
                        </div>
                        <div className={`Conversations-div-botMessage ${hasError ? 'Conversations-div-botMessage-error' : ''}`}>
                        <h6>{message.TextContent}</h6>
                        </div>
                    </div>
                    )} {/* every even index in conversation array is a chatbot message */}
                    {index % 2 === 1 && (
                    <div id='Conversations-div-userMessage-container'>
                        <div id='Conversations-div-userMessage-flexbox'>
                        <div id='Conversations-div-userMessage-metadata'>
                            <p id='Conversations-p-userMessage-timestamp'>{formatDateTime(message.Timestamp)}</p>
                            <p id='Conversations-p-userMessage-sendertag'>{message.SenderTag}</p>
                            <img id='Conversations-img-userMessage-avatar' src={userIcon} ></img>
                        </div>
                        </div>
                        <div className="Conversations-div-userMessage"><h6>{message.TextContent}</h6></div>
                    </div>
                    )}  {/* every odd index in conversation array is a user message */}
                </div>
                ))
            )}
            </div>
        </Container>
    );
}

export default Conversations