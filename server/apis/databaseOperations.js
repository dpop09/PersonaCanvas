const { MongoClient, ServerApiVersion } = require("mongodb")
const cryptoOperations = require("./cryptoOperations")
require('dotenv').config()

const URI = process.env.MONGODB_API_KEY // **dpop09** grab api key from .env file
const DATABASE_NAME = "PersonaCanvasDatabases"
const CHATBOT_DATA_COLLECTION_NAME = "Chatbots"
const CONVERSATION_DATA_COLLECTION_NAME = "Conversations"
const USER_DATA_COLLECTION_NAME = "UserProfiles"

const client = new MongoClient(URI, {   // **dpop09** MongoClient is the object that references the connection to project database
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

const dbOperations = {  // **dpop09** object literal to store and access all of the database functions
    connect: async function() {     // **dpop09** helper function to ensure connection to project database in MongoDB remote server
        try {
            await client.connect()
            return client.db(DATABASE_NAME)
        } catch(error) {
            console.log(error)
        }
    },
    insert: async function(parmtr_collection_name, parmtr_field_value_object) { // **dpop09** inserts into collection a {field:value} object
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(parmtr_collection_name)
            const insert_result = await collection.insertOne(parmtr_field_value_object)
            return insert_result.insertedId != null // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            console.log(error)
            return false
        }
    },
    insertMany: async function(parmtr_collection_name, parmtr_field_value_object_array) {   // **dpop** inserts more than one {field:value} objects into collection
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(parmtr_collection_name)
            const insertMany_result = await collection.insertMany(parmtr_field_value_object_array)
            return insertMany_result.insertedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            console.log(error)
            return false
        }
    },
    update: async function(parmtr_collection_name, parmtr_old_field_value_object, parmtr_new_field_value_object) { // **dpop** updates a {field:value} object in collection with a new {field:value} object
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(parmtr_collection_name)
            const update_result = await collection.updateOne(parmtr_old_field_value_object, parmtr_new_field_value_object)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            console.log(error)
            return false
        }
    },
    delete: async function(parmtr_collection_name, parmtr_target_field_value_object) { // **dpop** deletes a {field:value} object from collection
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(parmtr_collection_name)
            const delete_result = await collection.deleteOne(parmtr_target_field_value_object)
            return delete_result.deletedCount > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            console.log(error)
            return false
        }
    },
    deleteAll: async function(parmtr_collection_name) { // **dpop** deletes everything from collection
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(parmtr_collection_name)
            const deleteAll_result = await collection.deleteMany({})
            return deleteAll_result.deletedCount > 0    // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            console.log(error)
            return false
        }
    },
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Chatbots: Functions related to chatbots' creation, deletion, and querying.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    fetchGreeting: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const find_result = await collection.find(parmtr_field_value_object).toArray() // {email: hc7822@wayne.edu}
            if (find_result.length === 0) {
                return null
            }
            return find_result[0].Greeting
        } catch (error) {
            return null
        }
    },
    fetchPopularChatbots: async function() {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const chatbots_data = await collection.find({Visibility: "public"}, {projection: { ChatbotID: 1, Name: 1, Greeting: 1, Creator: 1, Likes: 1, ImageData: 1}}).sort({Likes: -1}).limit(10).toArray() // **dpop09** find all instances of public chatbots
            if (chatbots_data.length === 0) {   // **dpop09** return an empty array if there are no public chatbots in collection
                return []
            }
            return chatbots_data
        } catch (error) {
            console.error(error)
            return []
        }
    },
    fetchCreatedChatbots: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const chatbots_data = await collection.find(parmtr_field_value_object, {projection: { ChatbotID: 1, Name: 1, Greeting: 1, Creator: 1, Likes: 1, ImageData: 1}}).toArray() // **dpop09** find all instances of the user's created chatbots
            if (chatbots_data.length === 0) {   // **dpop09** return an empty array if there chatbots created by the user in collection
                return []
            }
            return chatbots_data
        } catch (error) {
            console.error(error)
            return []
        }
    },
    fetchFineTuningData: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const find_result = await collection.find(parmtr_field_value_object).toArray()
            if (find_result[0].length > 0) {
                return null
            }
            return find_result[0].FineTuningData 
        } catch (error) {
            return null
        }
    },
    fetchChatbotID: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const find_result = await collection.find(parmtr_field_value_object).toArray() // {email: hc7822@wayne.edu}
            return find_result[0].ChatbotID
        } catch (error) {
            return null
        }
    },
    fetchChatbotName: async function(parmtr_chatbot_id) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id
            }
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const find_result = await collection.find(input_field_value_object).toArray()
            if (find_result.length === 0) {
                return null
            }
            return find_result[0].Name
        } catch (error) {
            return null
        }
    },
    fetchChatbotLikes: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const find_result = await collection.find(parmtr_field_value_object).toArray()
            if (find_result.length === 0) {
                return null
            }
            return find_result[0].Likes
        } catch (error) {
            return null
        }
    },
    updateChatbotLikes: async function(parmtr_filter_field_value_object, parmtr_set_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME)
            const update_result = await collection.updateOne(parmtr_filter_field_value_object, parmtr_set_field_value_object)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            return false
        }
    },
    getSharedChatbotData: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const find_result = await collection.find(parmtr_field_value_object).toArray();
            return find_result
        } catch (error) {
            return null
        }
    },
    fetchChatbotIDsByCreator: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                Creator: parmtr_username
            }
            const input_projection_object = {
                ChatbotID: 1,
                _id: 0
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const find_result = await collection.find(input_field_value_object, input_projection_object).toArray();
            const chatbotIDs = find_result.map(doc => doc.ChatbotID)
            return chatbotIDs
        } catch (error) {
            return null
        }
    },
    deleteAllChatbotsByCreator: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                Creator: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteMany(input_field_value_object)
            return delete_result.acknowledged > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    deleteSelectedPublicChatbots: async function(parmtr_chatbot_id_array) {
        try {
            const input_field_value_object = {
                ChatbotID: {$in: parmtr_chatbot_id_array}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteMany(input_field_value_object)
            return delete_result.deletedCount > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    updateAllChatbotsByCreatorToDeleted: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                Creator: parmtr_username
            }
            const update_operation = {
                $set: {Creator: 'deleted'}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const update_result = await collection.updateMany(input_field_value_object, update_operation)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            return false
        }
    },
    deleteChatbot: async function(parmtr_chatbot_id) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteOne(input_field_value_object)
            return delete_result.deletedCount > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    deletePrivateChatbotsByCreator: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                Creator: parmtr_username,
                Visibility: 'private'
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteMany(input_field_value_object)
            return delete_result.deletedCount > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    decrementLikeCountByChatbotIDs: async function(parmtr_chatbot_id_array) {
        try {
            const input_field_value_object = {
                ChatbotID: {$in: parmtr_chatbot_id_array}
            }
            const update_operation = {
                $inc: {Likes: -1}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const update_result = await collection.updateMany(input_field_value_object, update_operation)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            return false
        }
    },
    removeFromSharedWhitelistedChatbotsByUsername: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                Visibility: 'whitelist',
                WhitelistArray: parmtr_username
            }
            const update_operation = {
                $pull: {WhitelistArray: parmtr_username}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const update_result = await collection.updateMany(input_field_value_object, update_operation)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            return false
        }
    },
    deleteEmptyWhitelistedChatbots: async function() {
        try {
            const input_field_value_object = {
                Visibility: 'whitelist',
                WhitelistArray: { $size: 0 }
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteMany(input_field_value_object);
            return delete_result.deletedCount > 0;
        } catch(error) {
            console.log(error);
            return false;
        }
    },
    getHistoryChatbotsByChatbotIDs: async function(parmtr_chatbot_ids_array) {
        try {
            const input_field_value_object = {
                ChatbotID: {$in: parmtr_chatbot_ids_array}
            }
            const filter_field_value_object = { // **dpop09** filter the results to only include the following fields
                projection: { ChatbotID: 1, Name: 1, Greeting: 1, Creator: 1, Likes: 1, ImageData: 1}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const find_result = await collection.find(input_field_value_object, filter_field_value_object).toArray();
            if (find_result.length < 1) {
                return []
            }
            // **dpop09** sort the chatbot array based on the order of the parmtr_chatbot_ids_array
            const sorted_result = parmtr_chatbot_ids_array.map(chatbotID => 
                find_result.find(chatbot => chatbot.ChatbotID === chatbotID)
            ).filter(chatbot => chatbot !== undefined); // **dpop09** filter out any null values
            return sorted_result
        } catch(error) {
            console.log(error);
            return []
        }
    },
    getChatbotData: async function(parmtr_chatbot_id) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id
            }
            const filter_field_value_object = { // **dpop09** filter the results to only include the following fields
                projection: {Name: 1, Greeting: 1, Creator: 1, Likes: 1, ImageData: 1}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CHATBOT_DATA_COLLECTION_NAME);
            const find_result = await collection.find(input_field_value_object, filter_field_value_object).toArray();
            if (find_result.length < 1) {
                return null
            }
            return find_result[0]
        } catch(error) {
            console.log(error);
            return null
        }
    },
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
User Profiles: Functions related to user profiles, authentication, and user-related updates.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    fetchHashedPassword: async function(parmtr_username) { // **dpop09** inserts into collection a {field:value} object
        try {
            const input_field_value_object = {
                username: parmtr_username
            }
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const find_result = await collection.find(input_field_value_object).toArray()
            if (find_result.length === 0) {
                return ""   // **dpop09** return an empty string. empty strings will always fail hash compares
            }
            const password = find_result[0].password    // **dpop09** return the hashed password belonging to the username
            return password
        } catch (error) {
            console.error(error)
            return ""
        }
    },
    findEmail: async function(parmtr_collection_name, parmtr_field_value_object) {   // *dpop09* searches in collection for {field:value} object then returns it
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(parmtr_collection_name)
            const find_result = await collection.find(parmtr_field_value_object).toArray()
            if (find_result.length === 0) {
                return null
            }
            var emailResult = find_result[0].email
            return emailResult   // *dpop09* return a boolean value indicating the success of the database operation
        } catch (error) {
            console.log(error)
            return false
        }
    },
    insertChatbotIDIntoUserProfiles: async function(parmtr_filter_field_value_object, parmtr_set_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const update_result = await collection.updateOne(parmtr_filter_field_value_object, parmtr_set_field_value_object)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            console.log(error)
            return false
        }
    },
    fetchChatbotIDFromUserProfiles: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const find_result = await collection.find(parmtr_field_value_object).toArray() // {email: hc7822@wayne.edu}
            return find_result[0].ChatbotID
        } catch (error) {
            return null
        }
    },
    updatePassword: async function(parmtr_email, parmtr_hashed_password) {
        try {
            const filter_field_value_object = {
                email: parmtr_email
            }
            const update_operation = {
                $set: {password: parmtr_hashed_password}
            }
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const update_result = await collection.updateOne(filter_field_value_object, update_operation)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    isEmailInDatabase: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const find_result = await collection.find(parmtr_field_value_object).toArray() // {email: hc7822@wayne.edu}
            if (find_result.length === 0) {
                return false
            }
            return true
        } catch (error) {
            return false
        }
    },
    updateChatbotLikesInUserProfiles: async function(parmtr_filter_field_value_object, parmtr_set_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const update_result = await collection.updateOne(parmtr_filter_field_value_object, parmtr_set_field_value_object)
            return update_result.modifiedCount > 0  // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            return false
        }
    },
    checkWhitelistedUsernamesNotExist: async function(parmtr_usernames_array) {
        try {
            const db = await dbOperations.connect();
            const collection = db.collection(USER_DATA_COLLECTION_NAME);
            const query = { username: { $in: parmtr_usernames_array } };
            const find_result = await collection.find(query).toArray();
            const found_usernames = find_result.map(result => result.username);
            return parmtr_usernames_array.filter(username => !found_usernames.includes(username));
        } catch (error) {
            return null
        }
    },
    isChatbotLikedByUser: async function(parmtr_field_value_object, parmtr_filter_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const query = {
                username: parmtr_field_value_object.username,
                LikedArray: { $in: [parmtr_filter_field_value_object.LikedArray.$in[0]] }
            };
            const find_result = await collection.findOne(query);
            return find_result !== null;     // **dpop09** return a boolean value indicating whether the user has already liked the chatbot
        } catch (error) {
            return false
        }
    },
    createGuestAccount: async function(parmtr_guest_username) {
        try {
            const input_field_value_object = {
                username: parmtr_guest_username,
            }
            const db = await dbOperations.connect();
            const collection = db.collection(USER_DATA_COLLECTION_NAME);
            const insert_result = await collection.insertOne(input_field_value_object);
            return insert_result.acknowledged === true  // **dpop0** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    removeLikesFromUserProfilesByChatbotIDs: async function(parmtr_chatbot_Ids_array) {
        try {
            const input_update_object = {
                LikedArray: { $in: parmtr_chatbot_Ids_array}
            }
            const input_update_operation_object = {
                $pullAll: { LikedArray: parmtr_chatbot_Ids_array}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(USER_DATA_COLLECTION_NAME);
            const update_result = await collection.updateMany(input_update_object, input_update_operation_object)
            return update_result.modifiedCount > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    isEmailInDatabase: async function(parmtr_email) {
        try {
            const input_field_value_object = {
                email: parmtr_email
            }
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const find_result = await collection.find(input_field_value_object).toArray() // {email: hc7822@wayne.edu}
            if (find_result.length === 0) {
                return false
            }
            return true
        } catch (error) {
            return false
        }
    },
    isUsernameInDatabase: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                username: parmtr_username
            }
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const find_result = await collection.find(input_field_value_object).toArray() // {email: hc7822@wayne.edu}
            if (find_result.length === 0) {
                return false
            }
            return true
        } catch (error) {
            return false
        }
    },
    insertNewUserIntoDatabase: async function(parmtr_email, parmtr_username, parmtr_password) {
        try {
            const input_field_value_object = {
                email: parmtr_email,
                username: parmtr_username,
                password: parmtr_password
            }
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const insert_result = await collection.insertOne(input_field_value_object)
            return insert_result.acknowledged === true
        } catch (error) {
            return false
        }
    },
    fetchEmail: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                username: parmtr_username,
            }
            const db = await dbOperations.connect()
            const collection = db.collection(USER_DATA_COLLECTION_NAME)
            const find_result = await collection.find(input_field_value_object).toArray()
            return find_result[0].email
        } catch (error) {
            return null
        }
    },
    removeLikesFromUserProfilesByTargetChatbotID: async function(parmtr_chatbot_id) {
        try {
            const input_update_object = {
                LikedArray: { $in: [parmtr_chatbot_id]}
            }
            const input_update_operation_object = {
                $pullAll: { LikedArray: [parmtr_chatbot_id]}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(USER_DATA_COLLECTION_NAME);
            const update_result = await collection.updateMany(input_update_object, input_update_operation_object)
            return update_result.modifiedCount > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    updateEmail: async function(parmtr_username, parmtr_new_email) {
        try {
            const input_field_value_object = {
                username: parmtr_username
            }
            const input_update_object = {
                $set: { email: parmtr_new_email}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(USER_DATA_COLLECTION_NAME);
            const update_result = await collection.updateOne(input_field_value_object, input_update_object);
            return update_result.modifiedCount > 0;
        } catch(error) {
            console.log(error);
            return false;
        }
    },
    deleteAccount: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                username: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(USER_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteOne(input_field_value_object);
            return delete_result.deletedCount > 0;
        } catch(error) {
            console.log(error);
            return false;
        }
    },
    getLikedChatbotIDsByTargetUsername: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                username: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(USER_DATA_COLLECTION_NAME);
            const find_result = await collection.find(input_field_value_object).toArray()
            if (find_result.length < 1) {   // **dpop09** if the document doesn't exist, return null
                return null
            }
            // **dpop09** filter out any null values
            const likedChatbotIDs = find_result[0].LikedArray.filter(id => id && typeof id === "string")
            return likedChatbotIDs
        } catch(error) {
            return null
        }
    },
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Conversations: Functions that are specific to conversations, including fetching, updating, and deleting conversations.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    fetchMessageWithSenderTags: async function(parmtr_collection_name, parmtr_field_value_object) {   // **dpop** specialized db function to fetch conversation history with chatbot
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(parmtr_collection_name)
            const find_result = await collection.find(parmtr_field_value_object).toArray()
            if (find_result.length < 1) {   // **dpop09** if the document doesn't exist, return null
                return null
            }
            const decrypted_message_content = cryptoOperations.decrypt(find_result[0].MessageContent)   // **dpop09** decrypt the message content from the database
            return `[${find_result[0].Sender}]: ${decrypted_message_content}`   // **dpop** returns the message content with the sender tag attached to it. Important for context prompting.
    
        } catch(error) {
            return null
        }
    },
    fetchConversationHistoryToDisplay: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME)
            const find_result = await collection.find(parmtr_field_value_object).toArray()
            if (find_result[0].length > 0) {
                return null
            }
            return find_result[0].MessageArray   
        } catch(error) {
            return null
        }
    },
    pushMessageToConversation: async function(parmtr_entities_field_value_object, parmtr_MessageObject_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME)
            const update_result = await collection.updateOne(parmtr_entities_field_value_object, parmtr_MessageObject_field_value_object)
            if (update_result.modifiedCount < 1) {
                return false
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },
    deleteConversation: async function(parmtr_field_value_object) {
        try {
            const db = await dbOperations.connect()
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME)
            const delete_result = await collection.deleteOne(parmtr_field_value_object)
            return delete_result.deletedCount > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch(error) {
            console.log(error)
            return false
        }
    },
    deleteConversationsByChatbotIDs: async function(parmtr_chatbot_ids_array) {
        try {
            const input_field_value_object = {
                ChatbotID: { $in: parmtr_chatbot_ids_array}
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteMany(input_field_value_object)
            return delete_result.acknowledged > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    deleteConversationsByTargetChatbotID: async function(parmtr_chatbot_id) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteMany(input_field_value_object)
            return delete_result.acknowledged > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    deleteConversationsByUsername: async function(parmtr_username) {
        try {
            const input_field_value_object = {
                Username: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
            const delete_result = await collection.deleteMany(input_field_value_object)
            return delete_result.acknowledged > 0   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            return false
        }
    },
    getHistoryChatbotIDsByTargetUsername: async function(parmtr_username) {
        try {
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
            
            const pipeline = [
                { $match: { Username: parmtr_username } },
                { $unwind: '$MessageArray' },
                { $sort: { 'MessageArray.Timestamp': -1 } },
                { 
                    $group: {
                        _id: '$ChatbotID',
                        lastMessage: { $first: '$MessageArray' }
                    }
                },
                { $sort: { 'lastMessage.Timestamp': -1 } },
                { $project: { _id: 1 } }
            ];
            
            const sortedChatbotIDs = await collection.aggregate(pipeline).toArray();
            
            if (sortedChatbotIDs.length < 1) {
                return [];
            }
            
            return sortedChatbotIDs.map(doc => doc._id);
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    deleteLastTwoMessagesFromConversation: async function(parmtr_chatbot_id, parmtr_username) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id,
                Username: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
    
            // First $pop to remove the last element
            await collection.updateOne(input_field_value_object, {
                $pop: { MessageArray: 1 }
            });
    
            // Second $pop to remove what is now the last element
            const update_result = await collection.updateOne(input_field_value_object, {
                $pop: { MessageArray: 1 }
            });
    
            return update_result.modifiedCount === 1;   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    updateErrorCodeInDatabase: async function (parmtr_chatbot_id, parmtr_username, parmtr_error_code) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id,
                Username: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
            const update_result = await collection.updateOne(input_field_value_object, {
                $set: { ErrorCodeObject: parmtr_error_code }
            });
            //console.log(update_result.modifiedCount === 1);
            return update_result.modifiedCount === 1;   // **dpop09** return a boolean value indicating the success of the database operation
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    getConversationErrorCode: async function (parmtr_chatbot_id, parmtr_username) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id,
                Username: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
            const find_result = await collection.find(input_field_value_object).toArray();
            if (find_result.length === 0) {
                return null;
            }
            return find_result[0].ErrorCodeObject;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getEntireConversation: async function (parmtr_chatbot_id, parmtr_username) {
        try {
            const input_field_value_object = {
                ChatbotID: parmtr_chatbot_id,
                Username: parmtr_username
            }
            const db = await dbOperations.connect();
            const collection = db.collection(CONVERSATION_DATA_COLLECTION_NAME);
            const find_result = await collection.find(input_field_value_object).toArray();
            if (find_result.length === 0) {
                return [];
            }
            return find_result[0].MessageArray;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
}
module.exports = dbOperations   // **dpop09** export object literal for outside use