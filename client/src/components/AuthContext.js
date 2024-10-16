import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);    // **dpop09** login status of user
    const [isGuest, setIsGuest] = useState(false);  // **dpop09** guest status
    const [username, setUsername] = useState('')    // **dpop09** username status
    const[email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const[chatbotId, setChatbotId] = useState('')
    const[chatbotLikes, setChatbotLikes] = useState('')
    const[verificationCode, setVerificationCode] = useState('')
    
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isGuest, setIsGuest, username, setUsername, email, setEmail, password, setPassword, chatbotId, setChatbotId, chatbotLikes, setChatbotLikes, verificationCode, setVerificationCode }}>
            {children}
        </AuthContext.Provider>
    );
};