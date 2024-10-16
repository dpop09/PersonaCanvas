const ROUTING_PORT = "http://localhost:3001/"

export const clientChatbotOperations = {
    sendMessage: async function(parmtr_chatbot_id, parmtr_username, parmtr_user_message, parmtr_chatbot_name, parmtr_flag) {
        try {
            const response = await fetch(ROUTING_PORT + "bot/message", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_chatbot_id, parmtr_username, parmtr_user_message, parmtr_chatbot_name, parmtr_flag }),
            });
            if (!response.ok) {
                console.log('FAILURE: "bot/message" route was not processed by the server correctly.');
                const data = await response.json();
                return data.error_code_object;
            } else {
                console.log('SUCCESS: "bot/message" route was processed by the server without error.');
                const data = await response.json();
                return data.chatbot_response;
            }
        } catch (error) {
            console.error()
            return null
        }  
    },
};

export default clientChatbotOperations;