const express = require('express')
const router = express.Router()
const dbOperations = require('./apis/databaseOperations')
const bcryptOperations = require('./apis/bcryptOperations')
const { v4: uuid4 } = require('uuid')
const cryptoOperations = require('./apis/cryptoOperations')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
const pdf = require('pdf-parse')
const path = require('path')

const CHATBOT_DATA_COLLECTION_NAME = "Chatbots"
const BYTES_IN_A_MEGABYTE = 1048576

router.post('/search-chatbots', async (req, res) => {
    try {
        const { name, visibility } = req.body;
        const db = await dbOperations.connect();
        const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
        const regex = new RegExp(name, 'i'); // 'i' for case-insensitive matching
        const searchedChatbots = await collection.find({
            Name: { $regex: regex },
            Visibility: visibility
        }).toArray();
        res.status(200).send({ searchedChatbots });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
router.post('/insert', async (req,res) => {
    try {
        const {parmtr_collection_name, parmtr_field_value_object} = req.body
        var bool_result = await dbOperations.insert(parmtr_collection_name, parmtr_field_value_object)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/insertMany', async (req,res) => {
    try {
        const {parmtr_collection_name, parmtr_field_value_object_array} = req.body
        var bool_result = await dbOperations.insertMany(parmtr_collection_name, parmtr_field_value_object_array)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/update', async (req,res) => {
    try {
        const {parmtr_collection_name, parmtr_target_field_value_object, parmtr_new_field_value_object} = req.body
        var bool_result = await dbOperations.update(parmtr_collection_name, parmtr_target_field_value_object, parmtr_new_field_value_object)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/delete', async (req,res) => {
    try {
        const {parmtr_collection_name, parmtr_field_value_object} = req.body
        var bool_result = await dbOperations.delete(parmtr_collection_name, parmtr_field_value_object)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/deleteAll', async (req,res) => {
    try {
        const {parmtr_collection_name} = req.body
        var bool_result = await dbOperations.deleteAll(parmtr_collection_name)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/fetch-messages', async (req,res) => {
    try {
        const {parmtr_chatbot_id, parmtr_username} = req.body
        const input_field_value_object = {
            ChatbotID : parmtr_chatbot_id,
            Username : parmtr_username
        }
        let db_conversation_history_array = await dbOperations.fetchConversationHistoryToDisplay(input_field_value_object)
        if (db_conversation_history_array === null) {
            db_conversation_history_array = []
            res.status(200).send({db_conversation_history_array})
        }
        else {
           db_conversation_history_array = db_conversation_history_array.map(message_object => {
            const decrypted_text_content = cryptoOperations.decrypt(message_object.TextContent)
            return {
                ...message_object,
                TextContent: decrypted_text_content
            }
            })

            res.status(200).send({db_conversation_history_array}) 
        }
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/fetch-greeting', async (req,res) => {
    try {
        const {chatbot_id} = req.body
        const input_field_value_object = {
            ChatbotID: chatbot_id
        }
        var greeting = await dbOperations.fetchGreeting(input_field_value_object)
        res.status(200).send({greeting})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/insert-new-user-into-database', async (req,res) => {
    try {
        var {parmtr_email, parmtr_username, parmtr_password} = req.body

        // **dpop09** hash the user-created password
        var hashed_password = await bcryptOperations.hashPassword(parmtr_password)

        // **dpop09** finally insert the user-created account info with the hashed password into the database
        var bool_result = await dbOperations.insertNewUserIntoDatabase(parmtr_email, parmtr_username, hashed_password) 

        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/is-user-credentials-matched', async (req,res) => {
    try {
        var bool_result = false // **dpop09** assume login failure as default until proven successful
        const {parmtr_username, parmtr_password} = req.body

        // **dpop09** fetch the hashed password corresponding to the user-input username
        const hashed_password = await dbOperations.fetchHashedPassword(parmtr_username)

        // **dpop09** compare the user-input password and the hashed password
        bool_result = await bcryptOperations.comparePasswordToHash(parmtr_password, hashed_password)

        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/fetch-popular-chatbot-data', async (req,res) => {
    try {
        var db_chatbot_data_array = await dbOperations.fetchPopularChatbots() // **dpop09** grab the 10 most popular chatbots from database     
        res.status(200).send({db_chatbot_data_array})
    } catch (error) {
        res.status(400).send(error)
    }
})

async function extractPDFText(filePath) {   // **dpop09** helper function to convert the pdf to text to store in the db
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data
    } catch (error) {
        console.error('ERROR extracting PDF text:', error)
        return null
    }
}
router.post('/insert-chatbot-into-db', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req,res) => {
    try {
        let code_result = 0
        const {
            name: parmtr_input_name,
            greeting: parmtr_input_greeting,
            personality: parmtr_input_personality,
            visibility: parmtr_input_visibility,
            whitelistArray: parmtr_input_whitelist_array,
            role: parmtr_input_role,
            creatorUsername: parmtr_input_creator_username,
        } = req.body;

        const files = req.files; // **dpop09** the uploaded file if any
        let extracted_pdf_text = null
        let imageData = null;

        // Set 'file' to the first element of files['file'] array, or null if it doesn't exist
        const file = files['file'] ? files['file'][0] : null;
        // Set 'image' to the first element of files['image'] array, or null if it doesn't exist
        const image = files['image'] ? files['image'][0] : null;

        if (file) { // **dpop09** validate the uploaded file
            if (file.mimetype === 'application/pdf') {  // **dpop09** must be pdf format
                if (file.size <= BYTES_IN_A_MEGABYTE) {  // **dpop09** must be at most 1mb or roughly 20 pages of text
                    extracted_pdf_text = await extractPDFText(file.path)
                } else {
                    code_result = 2 
                }
            } else {
                code_result = 1
            }
        }

        if (image) {
            if (['image/jpeg', 'image/png'].includes(image.mimetype)) {
                if (image.size <= 3 * BYTES_IN_A_MEGABYTE) { // 3 MB size limit for images
                    // Read the image file and encode its content
                    const imageBuffer = await fs.promises.readFile(image.path);
                    imageData = imageBuffer.toString('base64'); // Convert to Base64
                } else {
                    code_result = 5; // Image size limit exceeded
                }
            } else {
                code_result = 4; // Unsupported image type
            }
        }

        var input_field_value_object = {
            ChatbotID: uuid4(), // **dpop09** generate a random alpha-numeric UUID as opposed to incrementing integers
            Name: parmtr_input_name, 
            Greeting: parmtr_input_greeting,
            Personality: parmtr_input_personality,
            Visibility: parmtr_input_visibility,
            WhitelistArray: parmtr_input_whitelist_array === "null" || !parmtr_input_whitelist_array
                ? []
                : parmtr_input_whitelist_array.split(',').map(username => username.trim()), // This splits the string by commas and trims whitespace from each username
            Role: parmtr_input_role,
            Creator: parmtr_input_creator_username, 
            Likes: 0,
            FineTuningData: extracted_pdf_text,
            ImageData: imageData
        }

        if (code_result === 0) {    // **dpop09** if the uploaded file fails validation, chatbot will not be inserted into the db
            let is_inserted = await dbOperations.insert(CHATBOT_DATA_COLLECTION_NAME, input_field_value_object)
            if (!is_inserted) {
                code_result = 3
            }
        }
        res.status(200).send({code_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/insert-greeting-into-db', async (req,res) => {
    try {
        const {parmtr_chatbot_id, parmtr_username, parmtr_greeting_content, parmtr_chatbot_name} = req.body

        input_field_value_object = {
            ChatbotID: parmtr_chatbot_id,
            Username: parmtr_username,
            MessageArray: [{
                TextContent: cryptoOperations.encrypt(parmtr_greeting_content),
                SenderTag: parmtr_chatbot_name === "" ? await dbOperations.fetchChatbotName(parmtr_chatbot_id) : parmtr_chatbot_name,
                Timestamp: Date.now()
            }],
            ErrorCodeObject: null
        }
        var bool_result = await dbOperations.insert("Conversations", input_field_value_object)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post("/find-email", async (req,res) => {
    try {
        const {parmtr_collection_name, parmtr_field_value_object} = req.body
        var email = await dbOperations.findEmail(parmtr_collection_name, parmtr_field_value_object)
        res.status(200).send({email})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/delete-conversation', async (req,res) => {
    try {
        const {parmtr_chatbot_id, parmtr_username} = req.body
        const input_field_value_object = {
            ChatbotID : parmtr_chatbot_id,
            Username : parmtr_username
        }
        const bool_result = await dbOperations.deleteConversation(input_field_value_object)

        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/fetch-created-chatbot-data', async (req,res) => {
    try {
        const {parmtr_username} = req.body
        const input_field_value_object = {
            Creator: parmtr_username
        }
        var db_chatbot_data_array = await dbOperations.fetchCreatedChatbots(input_field_value_object) // **dpop09** grab all user created chatbots from database
        res.status(200).send({db_chatbot_data_array})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/fetch-chatbot-id', async (req,res) => {
    try {
        const {parmtr_username, parmtr_chatbot_name, parmtr_chatbot_greeting, parmtr_chatbot_visibility} = req.body
        const input_field_value_object = {
            Creator: parmtr_username,
            Name: parmtr_chatbot_name,
            Greeting: parmtr_chatbot_greeting,
            Visibility: parmtr_chatbot_visibility
        }
        const chatbot_id = await dbOperations.fetchChatbotID(input_field_value_object)
        res.status(200).send({chatbot_id})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/insert-chatbot-id-into-user-profiles', async (req,res) => {
    try {
        const {parmtr_username, parmtr_chatbot_id} = req.body
        const filter_field_value_object = {
            username: parmtr_username
        }
        const update_operation = {
            $set: {ChatbotID: parmtr_chatbot_id}
        }
        const bool_result = await dbOperations.insertChatbotIDIntoUserProfiles(filter_field_value_object, update_operation)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/get-chatbot-id-from-user-profiles', async (req,res) => {
    try {
        const {parmtr_username} = req.body
        const input_field_value_object = {
            username: parmtr_username,
        }
        const chatbot_id = await dbOperations.fetchChatbotIDFromUserProfiles(input_field_value_object)
        res.status(200).send({chatbot_id})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/update-password', async (req,res) => {
    try {
        const {parmtr_email, parmtr_new_password} = req.body
 
        // **dpop09** hash the new password first
        const hashed_password = await bcryptOperations.hashPassword(parmtr_new_password)

        // **dpop09** finally update the old password with the new hashed password
        const bool_result = await dbOperations.updatePassword(parmtr_email, hashed_password)
        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/is-email-in-database', async (req,res) => {
    try {
        const {parmtr_email} = req.body

        // **dpop09** return true if the email is in the database
        const bool_result = await dbOperations.isEmailInDatabase(parmtr_email)

        res.status(200).send({bool_result})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/get-chatbot-name', async (req,res) => {
    try {
        const {parmtr_chatbot_id} = req.body
        const chatbot_name = await dbOperations.fetchChatbotName(parmtr_chatbot_id)
        res.status(200).send({chatbot_name})
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/fetch-chatbot-likes', async (req,res) => {
    try {
        const { parmtr_chatbot_id } = req.body
        const input_field_value_object = {
            ChatbotID: parmtr_chatbot_id
        }
        const chatbot_likes = await dbOperations.fetchChatbotLikes(input_field_value_object)
        res.status(200).send({ chatbot_likes })
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/update-chatbot-likes', async (req,res) => {
    try {
        // **dpop09** update the number of likes of the chatbot
        const {parmtr_username, parmtr_chatbot_id, parmtr_number} = req.body
        const filter_field_value_object = {
            ChatbotID: parmtr_chatbot_id
        }
        let chatbot_likes = await dbOperations.fetchChatbotLikes(filter_field_value_object)
        const update_operation = {
            $set: {Likes: chatbot_likes + parmtr_number}
        }
        let bool_result = await dbOperations.updateChatbotLikes(filter_field_value_object, update_operation)

        // **dpop09** update the liked array of the user's profile
        const filter_field_value_object2 = {
            username: parmtr_username
        }
        let update_operation2
        if (parmtr_number === 1) {  // **dpop09** if the user likes the chatbot, push the chatbot id into the liked array of the user's profile
            update_operation2 = {
                $push: {LikedArray: parmtr_chatbot_id}
            }
        } else if (parmtr_number === -1) {  // **dpop09** if the user unlikes the chatbot, pull the chatbot id from the liked array of the user's profile
            update_operation2 = {
                $pull: {LikedArray: parmtr_chatbot_id}
            }
        }
        bool_result = await dbOperations.updateChatbotLikesInUserProfiles(filter_field_value_object2, update_operation2)
        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/is-chatbot-liked-by-user', async (req,res) => {
    try {
        const {parmtr_username, parmtr_chatbot_id} = req.body
        const input_field_value_object = {
            username: parmtr_username
        }
        const filter_field_value_object = { // **dpop09** check if the user has liked the chatbot
            LikedArray: {$in: [parmtr_chatbot_id]}
        }
        const bool_result = await dbOperations.isChatbotLikedByUser(input_field_value_object, filter_field_value_object)
        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/check-whitelisted-usernames-not-exist', async (req,res) => {
    try {
        const {parmtr_usernames_array} = req.body
        const nonexistent_usernames_array = await dbOperations.checkWhitelistedUsernamesNotExist(parmtr_usernames_array)
        res.status(200).send({nonexistent_usernames_array})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/get-shared-chatbot-data', async (req,res) => {
    try {
        const {parmtr_username} = req.body
        const input_field_value_object = {
            WhitelistArray: parmtr_username
        }
        const db_chatbot_data_array = await dbOperations.getSharedChatbotData(input_field_value_object)
        res.status(200).send({db_chatbot_data_array})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/create-guest-account', async (req,res) => {
    try {
        // **dpop09** create a guest account in the format of 'Guest' + 8 random alphanumeric characters
        const guest_username = 'Guest' + uuid4().slice(-8)

        // **dpop09** return a boolean indicating if the guest account inserted into the database
        const bool_result = await dbOperations.createGuestAccount(guest_username)
        if (!bool_result) {
            res.status(400).send(null)
        }
        res.status(200).send({guest_username})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/delete-guest-account', async (req,res) => {
    try {
        const {parmtr_username} = req.body

        // **dpop09** delete all conversation that involve the guest account
        const delete_conversations_result = await dbOperations.deleteConversationsByUsername(parmtr_username)

        // **dpop09** return a boolean indicating if the guest account is deleted
        const bool_result = await dbOperations.deleteAccount(parmtr_username)

        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/delete-all-chatbots-by-creator', async (req,res) => {
    try {
        const {parmtr_username} = req.body

        // **dpop09** fetch all chatbot ids that the user created
        const chatbot_ids_to_delete_array = await dbOperations.fetchChatbotIDsByCreator(parmtr_username)

        // **dpop09** remove the chatbot ids that the user created from the liked array of the user's profile
        const remove_likes_result = await dbOperations.removeLikesFromUserProfilesByChatbotIDs(chatbot_ids_to_delete_array)
        
        // **dpop09** delete all conversations that involved the chatbot ids that the user created
        const remove_conversations_result = await dbOperations.deleteConversationsByChatbotIDs(chatbot_ids_to_delete_array)
        
        // **dpop09** finally delete all chatbots that the user created
        const delete_chatbots_result = await dbOperations.deleteAllChatbotsByCreator(parmtr_username)

        const bool_result = delete_chatbots_result

        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/delete-selected-public-chatbots', async (req,res) => {
    try {
        const {parmtr_chatbot_id_array} = req.body

        // **dpop09** return a boolean indicating if the selected chatbots are deleted
        const bool_result = await dbOperations.deleteSelectedPublicChatbots(parmtr_chatbot_id_array)

        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/update-all-chatbots-by-creator-to-deleted', async (req,res) => {
    try {
        const {parmtr_username} = req.body

        // **dpop09** update all chatbots that the user created from the creator's username to 'deleted'
        const bool_result = await dbOperations.updateAllChatbotsByCreatorToDeleted(parmtr_username)

        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/is-username-in-database', async (req,res) => {
    try {
        const {parmtr_username} = req.body

        // **dpop09** return a boolean indicating if the username is in the database
        const bool_result = await dbOperations.isUsernameInDatabase(parmtr_username)

        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post('/update-email', async (req, res) => {
    try {
        const { parmtr_username, parmtr_new_email } = req.body;
        const bool_result = await dbOperations.updateEmail(parmtr_username, parmtr_new_email);
        res.status(200).send({ bool_result });
    } catch (error) {
        res.status(400).send(error);
    }
})
router.post('/delete-chatbot', async (req, res) => {
    try {
        const { parmtr_chatbot_id } = req.body;

        // **dpop09** remove the chatbot ids that the user created from the liked array of the user's profile
        const remove_likes_result = await dbOperations.removeLikesFromUserProfilesByTargetChatbotID(parmtr_chatbot_id)
        
        // **dpop09** delete all conversations that involved the chatbot ids that the user created
        const remove_conversations_result = await dbOperations.deleteConversationsByTargetChatbotID(parmtr_chatbot_id)

        // **dpop09** delete the chatbot from the database
        const bool_result = await dbOperations.deleteChatbot(parmtr_chatbot_id);
        res.status(200).send({ bool_result });
    } catch (error) {
        res.status(400).send(error);
    }
})
router.post('/delete-account', async (req, res) => {
    try {
        const { parmtr_username } = req.body;

        // **dpop09** delete all conversations that involved the to-be-deleted username
        const remove_conversations_result = await dbOperations.deleteConversationsByUsername(parmtr_username)

        // **dpop09** delete all private chatbots created by the to-be-deleted user
        const delete_private_chatbots_result = await dbOperations.deletePrivateChatbotsByCreator(parmtr_username)

        // **dpop09** fetch all of the to-be-deleted user's liked chatbot ids
        const liked_chatbot_ids_array = await dbOperations.getLikedChatbotIDsByTargetUsername(parmtr_username)
        // **dpop09** then decrement the like count of all of the liked chatbots
        const decrement_like_count_result = await dbOperations.decrementLikeCountByChatbotIDs(liked_chatbot_ids_array)

        // **dpop09** remove the to-be-deleted username from the public/whitelisted usernames array of all of the shared whitelisted chatbots
        const remove_from_shared_whitelisted_chatbots_result = await dbOperations.removeFromSharedWhitelistedChatbotsByUsername(parmtr_username)

        // **dpop09** delete any whitelisted chatbots that have an empty whitelisted usernames array
        const delete_empty_whitelisted_chatbots_result = await dbOperations.deleteEmptyWhitelistedChatbots()

        // **dpop09** change all of the to-be-deleted user's public & remaining whitelist chatbot's creator to 'deleted'
        const update_chatbots_result = await dbOperations.updateAllChatbotsByCreatorToDeleted(parmtr_username)

        // **dpop09** finally delete the account from the database
        const bool_result = await dbOperations.deleteAccount(parmtr_username);

        res.status(200).send({ bool_result });
    } catch (error) {
        res.status(400).send(error);
    }
})
router.post('/fetch-email', async (req, res) => {
    try {
        const { parmtr_username} = req.body;
        const email_result = await dbOperations.fetchEmail(parmtr_username);
        res.status(200).send({email_result});
    } catch (error) {
        res.status(400).send(error);
    }
})
router.post('/get-history-chatbots', async (req, res) => {
    try {
        const { parmtr_username } = req.body;

        // **dpop09** return an array of sorted chatbot ids based on the last time that the user have interacted with it
        const chatbot_ids_array = await dbOperations.getHistoryChatbotIDsByTargetUsername(parmtr_username);

        // **dpop09** return an array of chatbot objects that the user have already interacted with
        const chatbot_objects_array = await dbOperations.getHistoryChatbotsByChatbotIDs(chatbot_ids_array);

        res.status(200).send({ chatbot_objects_array });
    } catch (error) {
        res.status(400).send(error);
    }
})
router.post('/get-chatbot-data', async (req, res) => {
    try {
        const { parmtr_chatbot_id } = req.body;
        const chatbot_data = await dbOperations.getChatbotData(parmtr_chatbot_id);
        res.status(200).send({ chatbot_data });
    } catch (error) {
        res.status(400).send(error);
    }
})
router.post("/get-conversation-error-code", async (req,res) => {
    try {
        const {parmtr_chatbot_id, parmtr_username} = req.body
        const error_code_object = await dbOperations.getConversationErrorCode(parmtr_chatbot_id, parmtr_username)
        res.status(200).send({error_code_object})
    } catch(error) {
        res.status(400).send(error)
    }
})
router.post("/download-conversation", async (req,res) => {
    try {
        const {parmtr_chatbot_id, parmtr_chatbot_name, parmtr_username} = req.body
        let bool_result = true

        // **dpop09** dynamically create the file name
        const file_name = `${parmtr_chatbot_name}-${parmtr_username}-conversation.txt`;

         // **dpop09** define the path to the root directory of the project
         const root_directory = path.join(__dirname, '../'); // Adjust the path as needed
         const file_path = path.join(root_directory, file_name);

        const conversation_array = await dbOperations.getEntireConversation(parmtr_chatbot_id, parmtr_username)

        // **dpop09** helper function to format each conversation item
        const formatConversationItem = (item) => {
            return `Sender: ${item.SenderTag}\nTimestamp: ${new Date(item.Timestamp).toLocaleString()}\nMessage: ${cryptoOperations.decrypt(item.TextContent)}\n\n`;
        };
        
        // **dpop09** the file content by concatenating formatted items
        const file_content = conversation_array.map(formatConversationItem).join('');

        // **dpop09** write the file content to the text file
        fs.writeFile(file_path, file_content, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                bool_result = false;
            }
        });
        res.status(200).send({bool_result})
    } catch(error) {
        res.status(400).send(error)
    }
})

module.exports = router