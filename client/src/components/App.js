/* 
**dpop09**
App component is the root component. This will contain all of the routes to the other pages of the website
*/

import React, { useEffect } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import ChatbotCreationUI from './ChatbotCreationUI'
import Home from './Home'
import { AuthContext, AuthProvider } from './AuthContext'
import NavBar from './NavBar'
import AboutUs from './AboutUs'
import Profile from './Profile'
import ChatUI from './ChatUI'
import EmailVerify from './EmailVerify'
import UpdatePassword from './UpdatePassword'
import ForgotPasswordVerifyEmail from './ForgotPasswordVerifyEmail'
import Conversations from './Conversations'

function App() {

  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/ChatbotCreationUI" element={<ChatbotCreationUI />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path='/Conversations' element={<Conversations/>}/>
          <Route path="/ChatUI" element={<ChatUI/>}/>
          <Route path="/EmailVerify" element={<EmailVerify/>}/>
          <Route path="/ForgotPasswordVerifyEmail" element={<ForgotPasswordVerifyEmail/>}/>
          <Route path='/UpdatePassword' element={<UpdatePassword />} />
      </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App