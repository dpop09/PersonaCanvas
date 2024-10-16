

/*
**dpop09**
clientDatabaseOperations defines a set of client-side functions for interacting with a server to perform database operations
*/
const ROUTING_PORT = "http://localhost:3001/"

export const clientDatabaseOperations = {
    insert: async function(parmtr_collection_name, parmtr_field_value_object) {
        try {
            const response = await fetch(ROUTING_PORT + "insert", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_collection_name, parmtr_field_value_object })
            })
            if (!response.ok) {
                console.log('FAILURE: "insert" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "insert" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    insertMany: async function(parmtr_collection_name, parmtr_field_value_object_array) {
        try {
            const response = await fetch(ROUTING_PORT + "insertMany", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_collection_name, parmtr_field_value_object_array })
            })
            if (!response.ok) {
                console.log('FAILURE: "inseryMany" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "inseryMany" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    update: async function(parmtr_collection_name, parmtr_target_field_value_object, parmtr_new_field_value_object) {
        try {
            const response = await fetch(ROUTING_PORT + "update", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_collection_name, parmtr_target_field_value_object, parmtr_new_field_value_object })
            })
            if (!response.ok) {
                console.log('FAILURE: "update" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "update" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    delete: async function(parmtr_collection_name, parmtr_field_value_object) {
        try {
            const response = await fetch(ROUTING_PORT + "delete", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_collection_name, parmtr_field_value_object })
            })
            if (!response.ok) {
                console.log('FAILURE: "delete" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "delete" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    deleteAll: async function(parmtr_collection_name) {
        try {
            const response = await fetch(ROUTING_PORT + "deleteAll", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_collection_name })
            })
            if (!response.ok) {
                console.log('FAILURE: "deleteAll" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "deleteAll" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    insertNewUserIntoDatabase: async function(parmtr_email, parmtr_username, parmtr_password) {
        try {
            const response = await fetch(ROUTING_PORT + "insert-new-user-into-database", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_email, parmtr_username, parmtr_password })
            })
            if (!response.ok) {
                console.log('FAILURE: "insert-new-user-info-database" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "insert-new-user-info-database" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    isUserCredentialsMatched: async function(parmtr_username, parmtr_password) {
        try {
            const response = await fetch(ROUTING_PORT + "is-user-credentials-matched", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_username, parmtr_password })
            })
            if (!response.ok) {
                console.log('FAILURE: "is-user-credentials-matched" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "is-user-credentials-matched" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    }, 
    insertChatbotIntoDatabase: async function(parmtr_input_name, parmtr_input_greeting, parmtr_input_personality, parmtr_input_visibility, parmtr_input_whitelist_array, parmtr_input_role, parmtr_input_creator_username, parmtr_input_file, parmtr_input_image) {
        try {
            const form_data = new FormData()
            form_data.append('name', parmtr_input_name)
            form_data.append('greeting', parmtr_input_greeting)
            form_data.append('personality', parmtr_input_personality)
            form_data.append('visibility', parmtr_input_visibility)
            form_data.append('whitelistArray', parmtr_input_whitelist_array)
            form_data.append('role', parmtr_input_role)
            form_data.append('creatorUsername', parmtr_input_creator_username)

            if (parmtr_input_file !== null) {
                form_data.append('file', parmtr_input_file)
            }
            // Check if parmtr_input_image is not null
            if (parmtr_input_image !== null) {
                // Append the image to the form data
                form_data.append('image', parmtr_input_image);
            }

            const response = await fetch(ROUTING_PORT + "insert-chatbot-into-db", {
                method: 'POST',
                mode: 'cors',
                body: form_data
            })
            if (!response.ok) {
                console.log('FAILURE: "insert-chatbot-into-db" route was not processed by the server correctly.')
                return -1
            } else {
                console.log('SUCCESS: "insert-chatbot-into-db" route was processed by the server without error.')
                var result = await response.json()
                return result.code_result
            }
        } catch (error) {
            console.error(error)
            return -1
        }
    },
    findEmail: async function(parmtr_collection_name, parmtr_field_value_object) {
        try {
            const response = await fetch(ROUTING_PORT + "find-email", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_collection_name, parmtr_field_value_object })
            })
            if (!response.ok) {
                console.log('FAILURE: "find-email" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "find-email" route was processed by the server without error.')
                var result = await response.json()
                return result.email
            }
        } catch (error) {
            console.error(error)
            return false
        }
    }, 
    getPopularChatbotData: async function() {
        try {
            const response = await fetch(ROUTING_PORT + "fetch-popular-chatbot-data", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
            if (!response.ok) {
                console.log('FAILURE: "fetch-popular-chatbot-data" route was not processed by the server correctly.')
                return
            } else {
                console.log('SUCCESS: "fetch-popular-chatbot-data" route was processed by the server without error.')
                var result = await response.json()
                return result.db_chatbot_data_array
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    insertGreetingIntoDatabase: async function(parmtr_chatbot_id, parmtr_username, parmtr_greeting_content, parmtr_chatbot_name) {
        try {
            const response = await fetch(ROUTING_PORT + "insert-greeting-into-db", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_chatbot_id, parmtr_username, parmtr_greeting_content, parmtr_chatbot_name })
            })
            if (!response.ok) {
                console.log('FAILURE: "insert-greeting-into-db" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "insert-greeting-into-db" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    fetchConversationHistory: async function(parmtr_chatbot_id, parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "fetch-messages", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_chatbot_id, parmtr_username }),
            })
            if (!response.ok) {
                console.log('FAILURE: "fetch-messages" route was not processed by the server correctly.')
                return null
            } else {
                console.log('SUCCESS: "fetch-messages" route was processed by the server without error.')
                const data = await response.json()
                return data
            } 
        } catch (error) {
            console.error()
            return null
        }
    },
    fetchGreeting: async function(parmtr_chatbot_id) {
        try {
            const response = await fetch(ROUTING_PORT + "fetch-greeting", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatbot_id: parmtr_chatbot_id }),
            })
            if (!response.ok) {
                console.log('FAILURE: "fetch-greeting" route was not processed by the server correctly.')
                return null
            } else {
                console.log('SUCCESS: "fetch-greeting" route was processed by the server without error.')
                const data = await response.json()
                return data
            } 
        } catch (error) {
            console.error()
            return null
        }
    },
    deleteConversation: async function(parmtr_chatbot_id, parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "delete-conversation", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_chatbot_id, parmtr_username })
            })
            if (!response.ok) {
                console.log('FAILURE: "delete-conversation" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "delete-conversation" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    searchChatbotsByName: async function(searchQuery) {
        try {
            const response = await fetch(ROUTING_PORT + "search-chatbots", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: searchQuery, visibility: 'public' })
            });
            if (!response.ok) {
                console.log('FAILURE: "search-chatbots" route was not processed by the server correctly.');
                return [];
            } else {
                console.log('SUCCESS: "search-chatbots" route was processed by the server without error.');
                const result = await response.json();
                return result.searchedChatbots; // Ensure your server sends back this key
            }
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getCreatedChatbotData: async function(parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "fetch-created-chatbot-data", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({parmtr_username})
            })
            if (!response.ok) {
                console.log('FAILURE: "fetch-created-chatbot-data" route was not processed by the server correctly.')
                return
            } else {
                console.log('SUCCESS: "fetch-created-chatbot-data" route was processed by the server without error.')
                var result = await response.json()
                return result.db_chatbot_data_array
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    getChatbotID: async function(parmtr_username, parmtr_chatbot_name, parmtr_chatbot_greeting, parmtr_chatbot_visibility) {
        try {
            const response = await fetch(ROUTING_PORT + "fetch-chatbot-id", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({parmtr_username, parmtr_chatbot_name, parmtr_chatbot_greeting, parmtr_chatbot_visibility})
            })
            if (!response.ok) {
                console.log('FAILURE: "fetch-chatbot-id" route was not processed by the server correctly.')
                return null
            } else {
                console.log('SUCCESS: "fetch-chatbot-id" route was processed by the server without error.')
                var result = await response.json()
                return result.chatbot_id
            }
        } catch (error) {
            console.error(error)
            return null
        }
    },
    insertChatbotIDIntoUserProfiles: async function(parmtr_chatbot_id, parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "insert-chatbot-id-into-user-profiles", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({parmtr_chatbot_id, parmtr_username})
            })
            if (!response.ok) {
                console.log('FAILURE: "insert-chatbot-id-into-user-profiles" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "insert-chatbot-id-into-user-profiles" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    getChatbotIDFromUserProfiles: async function(parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "get-chatbot-id-from-user-profiles", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({parmtr_username})
            })
            if (!response.ok) {
                console.log('FAILURE: "get-chatbot-id-from-user-profiles" route was not processed by the server correctly.')
                return null
            } else {
                console.log('SUCCESS: "get-chatbot-id-from-user-profiles" route was processed by the server without error.')
                var result = await response.json()
                return result.chatbot_id
            }
        } catch (error) {
            console.error(error)
            return null
        }
    },
    deleteAccount: async function(parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "delete-account", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_username })
            })
            if (!response.ok) {
                console.log('FAILURE: "delete-account" route was not processed by the server correctly.')
                return false
            } else {
                console.log('SUCCESS: "delete-account" route was processed by the server without error.')
                var result = await response.json()
                return result.bool_result
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
   updatePassword: async function(parmtr_email, parmtr_new_password) {
       try {
           const response = await fetch(ROUTING_PORT + "update-password", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_email, parmtr_new_password })
           })
           if (!response.ok) {
               console.log('FAILURE: "update-password" route was not processed by the server correctly.')
               return false
           }
           else {
               console.log('SUCCESS: "update-password" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   isEmailInDatabase: async function(parmtr_email) {
       try {
           const response = await fetch(ROUTING_PORT + "is-email-in-database", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_email })
           })
           if (!response.ok) {
               console.log('FAILURE: "is-email-in-database" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "is-email-in-database" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   getChatbotName: async function(parmtr_chatbot_id) {
       try {
           const response = await fetch(ROUTING_PORT + "get-chatbot-name", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_chatbot_id })
           })
           if (!response.ok) {
               console.log('FAILURE: "get-chatbot-name" route was not processed by the server correctly.')
               return null
           }
           else {
               console.log('SUCCESS: "get-chatbot-name" route was processed by the server without error.')
               var result = await response.json()
               return result.chatbot_name
           }
       }
       catch (error) {
           console.error(error)
           return null
       }
   },
   fetchChatbotLikes: async function(parmtr_chatbot_id) {
       try {
           const response = await fetch(ROUTING_PORT + "fetch-chatbot-likes", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_chatbot_id })
           })
           if (!response.ok) {
               console.log('FAILURE: "fetch-chatbot-likes" route was not processed by the server correctly.')
               return null
           }
           else {
               console.log('SUCCESS: "fetch-chatbot-likes" route was processed by the server without error.')
               var result = await response.json()
               return result.chatbot_likes
           }
       } catch (error) {
           console.error(error)
           return null
       }
   },
   updateChatbotLikes: async function(parmtr_username,parmtr_chatbot_id, parmtr_number) {
       try {
           const response = await fetch(ROUTING_PORT + "update-chatbot-likes", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_username, parmtr_chatbot_id, parmtr_number })
           })
           if (!response.ok) {
               console.log('FAILURE: "update-chatbot-likes" route was not processed by the server correctly.')
               return false
           }
           else {
               console.log('SUCCESS: "update-chatbot-likes" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       }
       catch (error) {
           console.error(error)
           return false
       }
   },
   isChatbotLikedByUser: async function(parmtr_chatbot_id, parmtr_username) {
       try {
           const response = await fetch(ROUTING_PORT + "is-chatbot-liked-by-user", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_chatbot_id, parmtr_username })
           })
           if (!response.ok) {
               console.log('FAILURE: "is-chatbot-liked-by-user" route was not processed by the server correctly.')
               return false
           }
           else {
               console.log('SUCCESS: "is-chatbot-liked-by-user" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   checkWhitelistedUsernamesNotExist: async function(parmtr_usernames_array) {
       try {
            const response = await fetch(ROUTING_PORT + "check-whitelisted-usernames-not-exist", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_usernames_array })
            })
            if (!response.ok) {
                console.log('FAILURE: "check-whitelisted-usernames-not-exist" route was not processed by the server correctly.')
                return null
            } else {
                console.log('SUCCESS: "check-whitelisted-usernames-not-exist" route was processed by the server without error.')
                var result = await response.json()
                return result.nonexistent_usernames_array
            }
       } catch (error) {
           console.error(error)
           return null
       }
   },
   getSharedChatbotData: async function(parmtr_username) {
       try {
           const response = await fetch(ROUTING_PORT + "get-shared-chatbot-data", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_username })
           })
           if (!response.ok) {
               console.log('FAILURE: "get-shared-chatbot-data" route was not processed by the server correctly.')
               return null
           } else {
               console.log('SUCCESS: "get-shared-chatbot-data" route was processed by the server without error.')
               var result = await response.json()
               return result.db_chatbot_data_array
           }
       } catch (error) {
           console.error(error)
           return null
       }
   },
   createGuestAccount: async function() {
    try {
        const response = await fetch(ROUTING_PORT + "create-guest-account", {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
        if (!response.ok) {
            console.log('FAILURE: "create-guest-account" route was not processed by the server correctly.')
            return null
        } else {
            console.log('SUCCESS: "create-guest-account" route was processed by the server without error.')
            var result = await response.json()
            return result.guest_username
        }
    } catch (error) {
        console.error(error)
        return null
    }
   },
   deleteGuestAccount: async function(parmtr_username) {
       try {
           const response = await fetch(ROUTING_PORT + "delete-guest-account", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_username })
           })
           if (!response.ok) {
               console.log('FAILURE: "delete-guest-account" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "delete-guest-account" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   deleteAllChatbotsByCreator: async (parmtr_username) => {
       try {
           const response = await fetch(ROUTING_PORT + "delete-all-chatbots-by-creator", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_username })
           })
           if (!response.ok) {
               console.log('FAILURE: "delete-all-chatbots-by-creator" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "delete-all-chatbots-by-creator" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   deleteSelectedPublicChatbots: async (parmtr_chatbot_id_array) => {
       try {
           const response = await fetch(ROUTING_PORT + "delete-selected-public-chatbots", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_chatbot_id_array })
           })
           if (!response.ok) {
               console.log('FAILURE: "delete-selected-public-chatbots" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "delete-selected-public-chatbots" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   deleteChatbot: async (parmtr_chatbot_id) => {
       try {
           const response = await fetch(ROUTING_PORT + "delete-chatbot", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_chatbot_id })
           })
           if (!response.ok) {
               console.log('FAILURE: "delete-chatbot" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "delete-chatbot" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   updateAllChatbotsByCreatorToDeleted: async (parmtr_username) => {
       try {
           const response = await fetch(ROUTING_PORT + "update-all-chatbots-by-creator-to-deleted", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_username })
           })
           if (!response.ok) {
               console.log('FAILURE: "update-all-chatbots-by-creator-to-deleted" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "update-all-chatbots-by-creator-to-deleted" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
    },
   isEmailInDatabase: async function(parmtr_email) {
       try {
           const response = await fetch(ROUTING_PORT + "is-email-in-database", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_email })
           })
           if (!response.ok) {
               console.log('FAILURE: "is-email-in-database" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "is-email-in-database" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   isUsernameInDatabase: async function(parmtr_username) {
       try {
           const response = await fetch(ROUTING_PORT + "is-username-in-database", {
               method: 'POST',
               mode: 'cors',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ parmtr_username })
           })
           if (!response.ok) {
               console.log('FAILURE: "is-username-in-database" route was not processed by the server correctly.')
               return false
           } else {
               console.log('SUCCESS: "is-username-in-database" route was processed by the server without error.')
               var result = await response.json()
               return result.bool_result
           }
       } catch (error) {
           console.error(error)
           return false
       }
   },
   updateEmail: async function(parmtr_username, parmtr_new_email) {
        try {
            const response = await fetch(ROUTING_PORT + "update-email", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_username, parmtr_new_email })
            });
            if (!response.ok) {
                console.log('FAILURE: "update-email" route was not processed by the server correctly.');
                return false;
            } else {
                console.log('SUCCESS: "update-email" route was processed by the server without error.');
                var result = await response.json();
                return result.bool_result;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    fetchEmail: async function(parmtr_username){
        try {
            const response = await fetch(ROUTING_PORT + "fetch-email", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_username })
            });
            if (!response.ok) {
                console.log('FAILURE: "fetch-email" route was not processed by the server correctly.');
                return null;
            } else {
                console.log('SUCCESS: "fetch-email" route was processed by the server without error.');
                var result = await response.json();
                return result.email_result;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getHistoryChatbots: async function(parmtr_username){
        try {
            const response = await fetch(ROUTING_PORT + "get-history-chatbots", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({parmtr_username})
            });
            if (!response.ok) {
                console.log('FAILURE: "get-history-chatbots" route was not processed by the server correctly.');
                return null;
            } else {
                console.log('SUCCESS: "get-history-chatbots" route was processed by the server without error.');
                var result = await response.json();
                return result.chatbot_objects_array;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getChatbotData: async function(parmtr_chatbot_id) {
        try {
            const response = await fetch(ROUTING_PORT + "get-chatbot-data", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_chatbot_id })
            });
            if (!response.ok) {
                console.log('FAILURE: "get-chatbot-data" route was not processed by the server correctly.');
                return null;
            } else {
                console.log('SUCCESS: "get-chatbot-data" route was processed by the server without error.');
                var result = await response.json();
                return result.chatbot_data;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getConversationErrorCode: async function(parmtr_chatbot_id, parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "get-conversation-error-code", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_chatbot_id, parmtr_username })
            });
            if (!response.ok) {
                console.log('FAILURE: "get-conversation-error-code" route was not processed by the server correctly.');
                return null;
            } else {
                console.log('SUCCESS: "get-conversation-error-code" route was processed by the server without error.');
                var result = await response.json();
                return result.error_code_object;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    downloadConversation: async function(parmtr_chatbot_id, parmtr_chatbot_name, parmtr_username) {
        try {
            const response = await fetch(ROUTING_PORT + "download-conversation", {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parmtr_chatbot_id, parmtr_chatbot_name, parmtr_username }),
            });
            if (!response.ok) {
                console.log('FAILURE: "download-conversation" route was not processed by the server correctly.');
                return false;
            } else {
                console.log('SUCCESS: "download-conversation" route was processed by the server without error.');
                const data = await response.json();
                return data.bool_result;
            }
        } catch (error) {
            console.error()
            return false
        }
    }
}