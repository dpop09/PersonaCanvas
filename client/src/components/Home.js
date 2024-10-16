import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext';
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import mistralAvatar from '../images/mistral-avatar.png'
import thumbsupIcon from '../images/thumbsup-icon.png'
import '../styling/styling.css'
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import { clientDatabaseOperations } from '../apis/clientDatabaseOperations';

function Home() {
  const [popularChatbotCards, setPopularChatbotCards] = useState([])
  const [createdChatbotCards, setCreatedChatbotCards] = useState([])
  const [sharedChatbotCards, setSharedChatbotCards] = useState([])
  const [isPopularChatbotCardsLoading, setIsPopularChatbotCardsLoading] = useState(true)
  const [isCreatedChatbotCardsLoading, setIsCreatedChatbotCardsLoading] = useState(true)
  const [isSharedChatbotCardsLoading, setIsSharedChatbotCardsLoading] = useState(true)

  const { username } = useContext(AuthContext)
  const { setChatbotId } = useContext(AuthContext)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);


  const navigate = useNavigate()
  const navigateToChat = (parmtr_chatbot_id) => {
    setChatbotId(parmtr_chatbot_id)
    navigate('/ChatUI') //navigates to the chat page
  }

  const navigateToLoginPage = () => {
    navigate('/')
  }
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { isGuest, setIsGuest } = useContext(AuthContext);
  useEffect(() => { // **dpop09** log the user out when user tries to reload the page
    if (!isLoggedIn && !isGuest) {
      navigateToLoginPage()
    }
  }, [isLoggedIn, setIsLoggedIn, isGuest, setIsGuest]);

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent the default form submit action if using a submit button
    if (searchQuery === '' || searchQuery.length > 20) { // **dpop09** search query cannot be empty or more than 20 characters
        return;
    }
    if (searchQuery.trim()) {
        const searchResults = await clientDatabaseOperations.searchChatbotsByName(searchQuery);
        setSearchResults(searchResults); // Update the searchResults state with the new search results
        setShowSearchResults(true); // Make the search results section visible
        setTimeout(() => {
          setShowSearchResults(false);
        }, 60000); // 60000 milliseconds = 60 seconds
    } else {
        setShowSearchResults(false); // Hide the search results section if the search query is empty
    }
};

  useEffect(() => { // **dpop09** chatbot cards are displayed upon component rendering
    const fetchPopularChatbots = async () => {
      const data = await clientDatabaseOperations.getPopularChatbotData()  // **dpop09** fetch the chatbot data from the database to display in card form for the 10 most liked public chatbots
      setPopularChatbotCards(data)
      setIsPopularChatbotCardsLoading(false)
    }
    const fetchCreatedChatbots = async () => {
      const data = await clientDatabaseOperations.getCreatedChatbotData(username) // **dpop09** fetch the chatbot data from the database to display in card form for the chatbots created by the user
      setCreatedChatbotCards(data)
      setIsCreatedChatbotCardsLoading(false)
    }
    const fetchSharedChatbots = async () => {
      const data = await clientDatabaseOperations.getSharedChatbotData(username) // **dpop09** fetch the chatbot data from the database to display in card form for the chatbots shared with the user
      setSharedChatbotCards(data)
      setIsSharedChatbotCardsLoading(false)
    }
    
    fetchPopularChatbots()
    fetchCreatedChatbots()
    fetchSharedChatbots()
  }, [])
  
  return(
    <Container id='Home-Container'>
      <div id='Home-div-top'>
        {username !== '' ? (<h1>Welcome, {username}</h1>) : null}
      </div>
      <div id='Home-div-section'>
        <Row><h2>Most Liked</h2></Row>
        <div id={isPopularChatbotCardsLoading ? 'Home-div-chatbot-cards-container-loading' : 'Home-div-chatbot-cards-container'}>
          {isPopularChatbotCardsLoading ? (
            <div id='Home-div-cards-loader'></div>
          ) : (
            popularChatbotCards.length !== 0 ? (
              popularChatbotCards.map((chatbot, index) => (
                <Card key={index} id='Home-Card-chatbot-card' onClick={() => navigateToChat(chatbot.ChatbotID)}>
                  <div id='Home-div-card-top'>
                    <Card.Img 
                        id='Home-CardImg-avatar' 
                        variant='top' 
                        src={chatbot.ImageData ? `data:image/jpeg;base64,${chatbot.ImageData}` : mistralAvatar} 
                    />
                    <Card.Title id='Home-CardTitle-name'>{chatbot.Name}</Card.Title>
                    <Card.Text id='Home-CardText-greeting'>
                      {chatbot.Greeting.length > 68 ? chatbot.Greeting.slice(0,68) + '...' : chatbot.Greeting}  {/* display only the first 68 characters*/}
                    </Card.Text>
                  </div>
                  <div id='Home-div-card-bottom'>
                    <Card.Text id='Home-CardText-creator'>@{chatbot.Creator}</Card.Text>
                    <div id='Home-div-likes-flexbox'>
                      <img src={thumbsupIcon} alt='thumbsup-icon'></img>
                      <Card.Text id='Home-CardText-likes'>{chatbot.Likes}</Card.Text>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div id='Home-div-empty'><p>No public chatbots available</p></div>
            )
          )}
        </div>
      </div>
      {isGuest ? null : (
        <div id='Home-div-section'>
          <Row><h2>Your Created Chatbots</h2></Row>
          <div id={isCreatedChatbotCardsLoading ? 'Home-div-chatbot-cards-container-loading' : 'Home-div-chatbot-cards-container'}>
            {isCreatedChatbotCardsLoading ? (
              <div id='Home-div-cards-loader'></div>
            ) : (
              createdChatbotCards.length !== 0 ? (
                createdChatbotCards.map((chatbot, index) => (
                  <Card key={index} id='Home-Card-chatbot-card' onClick={() => navigateToChat(chatbot.ChatbotID, chatbot.Name)}>
                    <div id='Home-div-card-top'>
                      <Card.Img 
                          id='Home-CardImg-avatar' 
                          variant='top' 
                          src={chatbot.ImageData ? `data:image/jpeg;base64,${chatbot.ImageData}` : mistralAvatar} 
                      />
                      <Card.Title id='Home-CardTitle-name'>{chatbot.Name}</Card.Title>
                      <Card.Text id='Home-CardText-greeting'>
                        {chatbot.Greeting.length > 68 ? chatbot.Greeting.slice(0,68) + '...' : chatbot.Greeting}  {/* display only the first 68 characters*/}
                      </Card.Text>
                    </div>
                    <div id='Home-div-card-bottom'>
                      <Card.Text id='Home-CardText-creator'>@{chatbot.Creator}</Card.Text>
                      <div id='Home-div-likes-flexbox'>
                        <img src={thumbsupIcon} alt='thumbsup-icon'></img>
                        <Card.Text id='Home-CardText-likes'>{chatbot.Likes}</Card.Text>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div id='Home-div-empty'><p>Create a character chatbot by clicking on the plus sign in the navigation bar above.</p></div>
              )
            )}
          </div>
        </div>
      )}
      {isGuest ? null : (
        <div id='Home-div-section'>
        <Row><h2>Shared With You</h2></Row>
        <div id={isSharedChatbotCardsLoading ? 'Home-div-chatbot-cards-container-loading' : 'Home-div-chatbot-cards-container'}>
          {isSharedChatbotCardsLoading ? (
            <div id='Home-div-cards-loader'></div>
          ) : (
            sharedChatbotCards.length !== 0 ? (
              sharedChatbotCards.map((chatbot, index) => (
                <Card key={index} id='Home-Card-chatbot-card' onClick={() => navigateToChat(chatbot.ChatbotID, chatbot.Name)}>
                  <div id='Home-div-card-top'>
                    <Card.Img 
                        id='Home-CardImg-avatar' 
                        variant='top' 
                        src={chatbot.ImageData ? `data:image/jpeg;base64,${chatbot.ImageData}` : mistralAvatar} 
                    />
                    <Card.Title id='Home-CardTitle-name'>{chatbot.Name}</Card.Title>
                    <Card.Text id='Home-CardText-greeting'>
                      {chatbot.Greeting.length > 68 ? chatbot.Greeting.slice(0,68) + '...' : chatbot.Greeting}  {/* display only the first 68 characters*/}
                    </Card.Text>
                  </div>
                  <div id='Home-div-card-bottom'>
                    <Card.Text id='Home-CardText-creator'>@{chatbot.Creator}</Card.Text>
                    <div id='Home-div-likes-flexbox'>
                      <img src={thumbsupIcon} alt='thumbsup-icon'></img>
                      <Card.Text id='Home-CardText-likes'>{chatbot.Likes}</Card.Text>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div id='Home-div-empty'><p>You have no chatbots shared with you.</p></div>
            )
          )}
        </div>
      </div>
      )}
      <div id='Home-div-section'>
      <Row><h2>Search by Name</h2></Row>
        <Form onSubmit={handleSearch} id="Home-Form-search">
          <Form.Label id="Home-Label-search">
            Search for a public chatbot by name:
          </Form.Label>
          <div id="Home-Form-search-inputgroup">
            <Form.Control
              id='Home-FormControl-search'
              type='text'
              placeholder='Wayne Campus Bot'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="primary" type="submit" id="Home-Button-search">SEARCH</Button>
          </div>
        </Form>
        {/* Search results are conditionally rendered below the search bar */}
        {showSearchResults && (
          <>
            <Row><h2>Search Results</h2></Row>
            <div id='Home-div-chatbot-cards-container'>
                {searchResults.length > 0 ? (
                    searchResults.map((chatbot, index) => (
                        <Card key={index} id='Home-Card-chatbot-card' onClick={() => navigateToChat(chatbot.ChatbotID)}>
                            <div id='Home-div-card-top'>
                              <Card.Img 
                                  id='Home-CardImg-avatar' 
                                  variant='top' 
                                  src={chatbot.ImageData ? `data:image/jpeg;base64,${chatbot.ImageData}` : mistralAvatar} 
                              />
                                <Card.Title id='Home-CardTitle-name'>{chatbot.Name}</Card.Title>
                                <Card.Text id='Home-CardText-greeting'>
                                    {chatbot.Greeting.length > 68 ? `${chatbot.Greeting.slice(0, 68)}...` : chatbot.Greeting}
                                </Card.Text>
                            </div>
                            <div id='Home-div-card-bottom'>
                                <Card.Text id='Home-CardText-creator'>@{chatbot.Creator}</Card.Text>
                                <div id='Home-div-likes-flexbox'>
                                    <img src={thumbsupIcon} alt='thumbs up icon' />
                                    <Card.Text id='Home-CardText-likes'>{chatbot.Likes}</Card.Text>
                                </div>
                            </div>
                        </Card>
                    ))
                      ) : (
                          <div id='Home-div-empty'><p>No chatbots found matching your search.</p></div>
                      )}
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export default Home