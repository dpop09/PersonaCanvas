const ROUTING_PORT = "http://localhost:3001/"


export const clientEmailOperations = {
    //function for sending email
    sendEmail: async function(input_email, email_content) {
        try {
            //send POST request to emailRouter/sendEmail route
            const response = await fetch(ROUTING_PORT + "emailRouter/sendEmail", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input_email, email_content })
            })
            //check if response if successful
            if (!response.ok) {
                console.log('FAILURE: "emailRouter/sendEmail" route was not processed by the server correctly.')
                return false //return false if request fails
            } else {
                console.log('SUCCESS: "emailRouter/sendEmail" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    }, 
    sendEmailToPersonaCanvas: async function(input_email, email_content){
        try {
            const response = await fetch(ROUTING_PORT + "emailRouter/sendEmailToPersonaCanvas", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input_email, email_content })
            })
            if (!response.ok) {
                console.log('FAILURE: "emailRouter/sendEmailToPersonaCanvas" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "emailRouter/sendEmailToPersonaCanvas" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }    
    }
}