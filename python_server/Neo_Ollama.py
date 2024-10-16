# Before running this script, please run .\.venv\Scripts\activate

import os
import pymongo
import time
import socket
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain_community import embeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Load environment variables
load_dotenv()

# MongoDB connection setup
mongoDB = os.getenv("MONGODB_CONNECTION_STRING")
DB = os.getenv("MONGODB_DATABASE")
Collect = os.getenv("MONGODB_COLLECTION")

# Configuration for input and output ports
PORT_MESSAGE = 4000
HOST = '0.0.0.0'  # Listen on all network interfaces

try:
    # Initialize MongoDB Atlas client
    client_DB = pymongo.MongoClient(mongoDB)
    db = client_DB[DB]
    collection = db[Collect]
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    exit(1)

# Global variables to help with clearing things
CBID = None
difFLAG = 0
pVector = None
personaID = None
dVector = None
docID = None

# This function splits the original query between the bot ID and the conversation
def split_query(originalQuery):
    IDplusMessage = originalQuery.split('|@~@|')
    return IDplusMessage

def persona_PRO(personaMDB):
    global personaID
    timerStart = time.time()
    personaID = ["1"]
    print("Starting persona...")

    personaVector = Chroma.from_texts(
        [personaMDB],
        collection_name = "persona-Chroma",
        embedding = embeddings.ollama.OllamaEmbeddings(model = 'nomic-embed-text'),
        ids = personaID
    )

    print(f"Persona complete! ({time.time() - timerStart} seconds)")
    return personaVector

def RAG_Processing(rawData):
    global docID
    timerStart = time.time()
    print("Starting RAG...")

    ragText = rawData.get("text") # Extracts the raw text blurb
    ragLINESRaw = ragText.split('\n') # Splits the text using newline characters and stores in string
    ragLINESPro = list(filter(None, ragLINESRaw)) # Some elements are empty, this filters them out
    ragString = " ".join(ragLINESPro) # This combines the processed list into a singular string so it can be split again

    # Setting up a splitter that is based on the number of tokens for each element
    ragSplitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size = 400, chunk_overlap = 0
    )

    ragTokens = ragSplitter.split_text(ragString) # Stores the token split list into a variable
    docID = [str(i) for i in range(1, len(ragTokens) + 1)] # Assigns an id to each element, which makes it easier to be cleared

    docVector = Chroma.from_texts(
        ragTokens,
        collection_name = "rag-Chroma",
        embedding = embeddings.ollama.OllamaEmbeddings(model = 'nomic-embed-text'),
        ids = docID
    )

    print(f"RAG complete! ({time.time() - timerStart} seconds)")
    return docVector

def convo_split(rawConvo):
    return rawConvo.split('&~*~&')


def LLM_generation(query):
    """
    Generates a character-driven response from a language model using a chatbot's role, personality, and fine-tuning data to shape the conversation
    """
    try:
        # Query is split between the bot ID and the conversation data.
        masterString = split_query(query)

        global difFLAG
        global CBID
        global pVector # Calls upon the global personality vector variable
        global dVector # Calls upon the global document vector variable

        botID = masterString[0] # Storing the first element of the query string, which should be the bot ID

        # Receives the chabot ID and compares it to CBID global variable
        if CBID is None: # During the first run, CBID will not be set, thus it is set to the current bot ID
            CBID = botID
        elif CBID != botID: # Now if the new bot ID does not match, it will set off the flag to trigger deletions and update CBID
            print("Different bot detected...")
            difFLAG = 1
            CBID = botID

        if botID is None:
            return "Error: Chatbot ID not found.".encode()
        chatBot = collection.find_one({"ChatbotID": botID})

        if chatBot is None:
            return "Error: Chatbot configuration not found.".encode()
        else:
            role = chatBot.get("Role") # Pulls the role information from the chatbot document
            personality = chatBot.get("Personality") # Pulls the persona data from the chatbot document
            ragData = chatBot.get("FineTuningData") # Pulls the finetuning data from the chatbot document

        model_local = Ollama(model = "mistral") # Sets the model as Mistral-7B-Instruct-v0.2

        if pVector is None: # For the initial run, it will be None, hence why this is here
            pVector = persona_PRO(personality) # Stores the personality vector storage to the global variable
            pRet = pVector.as_retriever() # Sets a retriever for the vector storage
        elif difFLAG == 1: # Now this runs if a different bot has been detected
            print("Initiatin Persona Cleanup...")
            pVector._collection.delete(ids = [personaID[0]]) # Deletes the existing personality vector to avoid personality bleed
            print("Cleanup complete!")
            pVector = persona_PRO(personality) # Embeds the new personality
            if ragData is None:
                difFLAG = 0 # Resets the flag
            else:
                print("Document detected, not resetting flag...")
            pRet = pVector.as_retriever() # Sets a retriever once more
        else:
            pRet = pVector.as_retriever() # Whenever neither of the statements are tripped, this will be used to retrieve the existing vector

        if role == "character":
            start_time = time.time() # Starts a timer to check performance

            if ragData is None: # This portion runs when there is no document in the database
                print("Initiating Character-P...")
                # Sets a template for the LLM to follow
                characterPersonaOnly = """
                System: You are now taking on the traits and behaviors of a character as defined by the personality parameter. 
                When the user messages you, respond in a way that is true to this character's personality, focusing solely on 
                replying to the user's input in an engaging yet concise manner. Do NOT stray into creating a full conversation.
                Personality: {directives}
                Message: {message} 
                Response:
                """

                # Lets the LLM know that this is the template
                prompt = ChatPromptTemplate.from_template(characterPersonaOnly)
                # The actual meat of the program
                chain = (
                    {"directives": pRet, "message": RunnablePassthrough()}
                    | prompt
                    | model_local
                    | StrOutputParser()
                )

                convoPro = convo_split(masterString[1]) # This splits each part of the convo so the dialogue is stored in a list rather than a large string
                print("Generating response...")
                response = chain.invoke(convoPro) # This is where the LLM generation actually starts
                print(response) # Prints the response to the console for debugging purposes

                # Ending the timer that was set for measuring the performance
                end_time = time.time()
                total_duration = end_time - start_time
                print(f"Generation took a total of {total_duration} seconds.")

                return response.encode()

            else: 
                print("Initiating Character-D")
                if dVector is None: # Again, this is for the initialization
                    dVector = RAG_Processing(ragData) # Stores the document vector to the global variable
                    dRet = dVector.as_retriever() # Retriever for the vector storage
                elif difFLAG == 1: # Runs when there is a different bot
                    print("Initiating Document Cleanup...")
                    for i in range(0, len(docID)): # There will be many more elements in this vector, hence why there is a for loop
                        dVector._collection.delete(ids = [docID[i]]) # Clears out the document vector
                    print("Cleanup complete!")
                    dVector = RAG_Processing(ragData) # Stores the new doc
                    difFLAG = 0 # Resets the flag
                    dRet = dVector.as_retriever() # Retriever...need I say more?
                else:
                    dRet = dVector.as_retriever()

                # After this point, it is rinse and repeat, so no more notes
                characterRAG = """
                System: Embody a character shaped by the detailed traits provided in the context, and respond to the user's 
                messages in a manner that aligns with this specific personality. Focus on your character's traits to ensure 
                your reply upholds the defined personality. Do NOT stray into creating a full conversation.
                Personality: {directives}
                Context: {document} 
                Message: {message} 
                Answer:
                """

                ragPrompt = ChatPromptTemplate.from_template(characterRAG)
                ragChain = (
                    {"directives": pRet, "document": dRet, "message": RunnablePassthrough()}
                    | ragPrompt
                    | model_local
                    | StrOutputParser()
                )

                convoPro = convo_split(masterString[1])
                response = ragChain.invoke(convoPro)
                print(response)

                end_time = time.time()
                total_duration = end_time - start_time
                print(f"Generation took a total of {total_duration} seconds.")

                return response.encode()

        # Last note, but this is for the assistant portion
        elif role == "assistant":
            start_time = time.time()

            if ragData is None:
                print("Initiating Assistant-P")
                assistantPersonaOnly = """
                System: You are tasked with answering questions, guided entirely by the specified personality. 
                Focus on embodying this personality in your responses. If the answer is unknown, express this in 
                a manner consistent with the personality. Limit your answers to three sentences and ensure they 
                reflect the unique characteristics of the given personality.
                Personality: {directives}
                Question: {question}
                Answer:
                """

                prompt = ChatPromptTemplate.from_template(assistantPersonaOnly)
                chain = (
                    {"directives": pRet, "question": RunnablePassthrough()}
                    | prompt
                    | model_local
                    | StrOutputParser()
                )

                convoPro = convo_split(masterString[1])
                response = chain.invoke(convoPro)
                print(response)

                end_time = time.time()
                total_duration = end_time - start_time
                print(f"Generation took a total of {total_duration} seconds.")

                return response.encode()

            else:
                print("Initiating Assistant-D...")
                if dVector is None:
                    dVector = RAG_Processing(ragData)
                    dRet = dVector.as_retriever()
                elif difFLAG == 1:
                    print("Initiating Document Cleanup...")
                    for i in range(0, len(docID)):
                        dVector._collection.delete(ids = [docID[i]])
                    print("Cleanup complete!")
                    dVector = RAG_Processing(ragData)
                    difFLAG = 0
                    dRet = dVector.as_retriever()
                else:
                    dRet = dVector.as_retriever()

                assistantRAG = """
                System: You are an assistant for question-answering tasks with a specified personality. 
                Use the following pieces of retrieved context to answer the question. If you don't know the 
                answer, just say that you don't know. Use three sentences maximum, keep the answer concise, and 
                reflect the given personality in your response.
                Personality: {directives}
                Context: {document} 
                Question: {question} 
                Answer: 
                """

                ragPrompt = ChatPromptTemplate.from_template(assistantRAG)
                ragChain = (
                    {"directives": pRet, "document": dRet, "question": RunnablePassthrough()}
                    | ragPrompt
                    | model_local
                    | StrOutputParser()
                )

                convoPro = convo_split(masterString[1])
                response = ragChain.invoke(convoPro)
                print(response)

                end_time = time.time()
                total_duration = end_time - start_time
                print(f"Generation took a total of {total_duration} seconds.\n--------------------------------\n")

                return response.encode()

    except Exception as e:
        # If there is an error, an error message will be shown in console for debugging
        print(f"Error in LLM_generation function: {e}")
        # An error message will be encoded for transport
        return "Error Code of 2: The Remote Server encountered an error processing your query, please try again later.".encode()

def completeMessage(conn):
    print("Receiving message chunks...")
    fragments = []
    while True:
        chunk = conn.recv(1024)
        if not chunk:
            break
        fragments.append(chunk)
    print("Message complete!\n")
    return b''.join(fragments)

def listenfromNodejsServer():
    """
    Listens for incoming connections on PORT_MESSAGE to receive and process queries.
    """
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
            server_socket.bind((HOST, PORT_MESSAGE))
            server_socket.listen()
            print(f"Listening for messages on port {PORT_MESSAGE}...")
            while True:
                connection, address = server_socket.accept()
                with connection:
                    print(f"Connected by {address}")
                    try:
                        data = completeMessage(connection)
                        if data:
                            processed_data = LLM_generation(data.decode())
                            connection.sendall(processed_data)
                        else:
                            print("No data received. Connection closed by client.")
                            break
                    except Exception as conn_e:
                        print(f"Error during connection handling: {conn_e}")
    except Exception as e:
        print(f"Error in listenfromNodejsServer function: {e}")

# Neo Py LLM Server vAPH4.6 by jareshi
if __name__ == "__main__":

    listenfromNodejsServer()