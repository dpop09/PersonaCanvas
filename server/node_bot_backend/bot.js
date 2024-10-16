const express = require('express');
const net = require('net');
const { Readable } = require('stream');
const botApp = express.Router();
const dbOperations = require('../apis/databaseOperations')
const cryptoOperations = require('../apis/cryptoOperations');
require('dotenv').config()

const PYTHON_SERVER_IP = process.env.PYTHON_SERVER_IP
const INPUT_PORT = 4000;  // Port to send requests to the Python server
const CHATBOTID_DELIMITER = `|@~@|`
const CONVERSATION_MESSAGE_DELIMITER = `&~*~&`

const fetchConversationHistory = async (parmtr_chatbot_id, parmtr_username) => {
    const input_conversation_field_value_object = {
        ChatbotID: parmtr_chatbot_id,
        Username: parmtr_username
    }
    let db_conversation_history_array = await dbOperations.fetchConversationHistoryToDisplay(input_conversation_field_value_object)
    let conversation_history_array = db_conversation_history_array.map(message_object => {
        const decrypted_text_content = cryptoOperations.decrypt(message_object.TextContent)
        const message_with_sender_tag = `[${message_object.SenderTag}]: ${decrypted_text_content}${CONVERSATION_MESSAGE_DELIMITER}`
        return message_with_sender_tag
    })
   return conversation_history_array
}
const addUserMessageToDatabase = async (parmtr_chatbot_id, parmtr_user_message, parmtr_username) => {
    const filter_conversations_field_value_object = {
        ChatbotID: parmtr_chatbot_id,
        Username: parmtr_username,
    }
    const input_MessageObject_field_value_object = {
        $push: {
            MessageArray: {
                TextContent: cryptoOperations.encrypt(parmtr_user_message),
                SenderTag: parmtr_username,
                Timestamp: Date.now()
            }
        }
    }
    const bool_result = await dbOperations.pushMessageToConversation(filter_conversations_field_value_object, input_MessageObject_field_value_object)
    return bool_result
}
const addChatbotMessageToDatabase = async (parmtr_chatbot_id, parmtr_username, parmtr_chatbot_message, parmtr_chatbot_name) => {
    const filter_conversations_field_value_object = {
        ChatbotID: parmtr_chatbot_id,
        Username: parmtr_username,
    }
    const input_MessageObject_field_value_object = {
        $push: {
            MessageArray: {
                TextContent: cryptoOperations.encrypt(parmtr_chatbot_message),
                SenderTag: parmtr_chatbot_name,
                Timestamp: Date.now()
            }
        }
    }
    const bool_result = await dbOperations.pushMessageToConversation(filter_conversations_field_value_object, input_MessageObject_field_value_object)
    return bool_result
}
const preProcessing = (parmtr_user_message, parmtr_username, parmtr_chatbot_name) => {
    return (`[${parmtr_username}]: `.concat(parmtr_user_message)).concat(`${CONVERSATION_MESSAGE_DELIMITER}[${parmtr_chatbot_name}]: `)
}


let error_code = null // **dpop09** will be overwritten if there is an actual error

botApp.post('/message', async (req, res) => {
    try {
        let {parmtr_chatbot_id, parmtr_username, parmtr_user_message, parmtr_chatbot_name, parmtr_flag} = req.body; // **dpop09** grab the user message from the chatUI

        let conversation_history_array = await fetchConversationHistory(parmtr_chatbot_id, parmtr_username)   // **dpop09** fetch all of the conversation history message by message.
        
        if (parmtr_flag !== 1) { // **dpop09** if the flag is 1, then the user is regenerating a message to resolve the error. in that case, we just resend the prompt with no additional input
            const is_user_message_inserted_to_db = await addUserMessageToDatabase(parmtr_chatbot_id, parmtr_user_message, parmtr_username)    // **dpop09** insert the user message into the database

            user_message_with_sender_tags = preProcessing(parmtr_user_message, parmtr_username, parmtr_chatbot_name)       // **dpop09** Concatenate the user's message to add character names for context [Human]: and [Chatbot]:
            conversation_history_array.push(user_message_with_sender_tags)    // **dpop09** Push the edited user message to the conversation history array
        } else {
            conversation_history_array.push(` [${parmtr_chatbot_name}]: `)
        }

        let chatbot_response = null
        let conversation_history_string = conversation_history_array.toString() // **dopo09** convert conversation_history_array to a string
        let filtered_conversation_history_string = conversation_history_string.replace(/,\s*\[/g, '[') // **dpop09** remove array artifacts

        let filtered_conversation_history_string_with_chatbot_id = `${parmtr_chatbot_id}${CHATBOTID_DELIMITER}${filtered_conversation_history_string}`

        const createConversationHistoryStream = (parmtr_data_string) => {
            let index = 0;
            const CHUNK_SIZE = 1024; // Size of each chunk in bytes
            return new Readable({
                read() {
                    while (index < parmtr_data_string.length) {
                        const chunk = parmtr_data_string.slice(index, index + CHUNK_SIZE);
                        index += CHUNK_SIZE;
                        if (!this.push(chunk)) {
                            return; // Pause reading if push returns false
                        }
                    }
                    this.push(null); // Push null to signal end of stream
                }
            });
        }
        
        const fetchLLMResponseFromPythonServer = () => {
            return new Promise((resolve, reject) => {
                const client = new net.Socket()
                client.connect(INPUT_PORT, PYTHON_SERVER_IP, async () => {
                    console.log('Connecting to the remote Python server.')
                    const conversation_stream = createConversationHistoryStream(filtered_conversation_history_string_with_chatbot_id)
                    conversation_stream.pipe(client)
                })
                client.on('data', async (data) => {
                    chatbot_response = data.toString()
                    client.destroy()    // **dpop09** kill the client
                    resolve(data.toString())    // **dpop09** resolve the promise
                })
                client.on('close', async () => {
                    console.log('Connection and sending over the conversation history with the remote Python server is closed.')
                })
                client.on('error', async (err) => {
                    console.error('Connection failed: ' + err.message)
                    reject(err) // **dpop09** reject the promise
                })
            })
        }

        //sendChatbotIdToPythonServer()
        chatbot_response = await fetchLLMResponseFromPythonServer()

        chatbot_response = chatbot_response.replace(new RegExp(`\\[${parmtr_chatbot_name}\\]:\\s*`, 'g'), '');
        chatbot_response = chatbot_response.replace(new RegExp(`${parmtr_chatbot_name}:\\s*`, 'g'), '');
        chatbot_response = chatbot_response.replace(new RegExp(`\\[${parmtr_username}\\]`, 'g'), parmtr_username);
        // **dpop09** remove square brackets if they are the very first or very last characters, considering whitespace
        chatbot_response = chatbot_response.replace(/^\s*\[|\]\s*$/g, '');
        // **dpop09** remove patterns like '"key": ' even if there is whitespace before the key
        chatbot_response = chatbot_response.replace(/\s*['"][^'"]+['"]:\s/, '');
        // **dpop09** remove a square bracket at the start considering whitespace
        chatbot_response = chatbot_response.replace(/^\s*\[/, '');
        // **dpop09** remove [" or "] at the start or end, considering whitespace
        chatbot_response = chatbot_response.replace(/^\s*\["|"\]\s*$/g, '');
        // **dpop09** remove single quotes at the start or end, considering whitespace
        chatbot_response = chatbot_response.replace(/^\s*'|'\s*$/g, "");
        // **dpop09** remove double quotes at the start or end, considering whitespace
        chatbot_response = chatbot_response.replace(/^\s*"|"$/g, "");
        // **dpop09** remove a leading quote that may have whitespace before it
        chatbot_response = chatbot_response.replace(/^\s*"/, '');

        if (chatbot_response === 'Error Code of 2: The Remote Server encountered an error processing your query, please try again later.') { // **dpop09** if there is an error from the remote python server even after successful connection
            error_code = 2 // **dpop09** set the error code to 2 indicating there was an error from the remote server side
            chatbot_response = {    // **dpop09** format the chatbot_response in an object for display
                TextContent: chatbot_response,
                SenderTag: parmtr_chatbot_name,
                Timestamp: Date.now(),
                ErrorCode: error_code
            }
            const is_error_code_added_to_db = await dbOperations.updateErrorCodeInDatabase(parmtr_chatbot_id, parmtr_username, chatbot_response) // **dpop09** add the error code to the db
            res.status(200).json({ chatbot_response })
        } else {
            error_code = 0 // **dpop09** set the error code to 0 indicating there was no error
            if (parmtr_flag === 2) { // **dpop09** delete the last two messages in the conversation history
                const are_last_two_messages_deleted = await dbOperations.deleteLastTwoMessagesFromConversation(parmtr_chatbot_id, parmtr_username)
            }
            const is_chatbot_message_added_to_db = await addChatbotMessageToDatabase(parmtr_chatbot_id, parmtr_username, chatbot_response, parmtr_chatbot_name) // **dpop09** add the chatbot message to the db
            if (!is_chatbot_message_added_to_db) {  // **dpop09** send a null to the client if the database operation fails
                res.status(200).json(null)  
            } else {
                chatbot_response = {    // **dpop09** format the chatbot_response in an object for display
                    TextContent: chatbot_response,
                    SenderTag: parmtr_chatbot_name,
                    Timestamp: Date.now(),
                    ErrorCode: error_code
                }
                const is_error_code_added_to_db = await dbOperations.updateErrorCodeInDatabase(parmtr_chatbot_id, parmtr_username, null) // **dpop09** add the error code to the db
                res.status(200).json({ chatbot_response });   // **dpop09** send the chatbot reply to the client for display
            }
        }
    } catch (error) {
        let {parmtr_chatbot_id, parmtr_username, parmtr_chatbot_name} = req.body;
        error_code = 1 // **dpop09** set the error code to 1 indicating there was an error trying to connect to the remote server
        error_code_object = {
            TextContent: `Error Code of ${error_code}: Server was not able to connect to the remote server. Please try again later.`,
            SenderTag: parmtr_chatbot_name,
            Timestamp: Date.now(),
            ErrorCode: error_code
        }
        const is_error_code_added_to_db = await dbOperations.updateErrorCodeInDatabase(parmtr_chatbot_id, parmtr_username, error_code_object)
        res.status(400).json({ error_code_object })
    }
});

module.exports = botApp;