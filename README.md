# *PersonaCanvas*
This is the capstone project of Rukiyah A, Dan P, Jaberul H, and Rajeev K.

## Rough Description
*PersonaCanvas* is a web application consisted of mainly Node.js and Python.
The front-end and almost all the back-end operations are written using Node.js.
Python is only used for the chatting functionality, as it is able to manage the
Large Language Models (LLMs) that are utilized for the chatbots.

## Core Requirements
As mentioned before, the web application is written using Node.js and Python.
Specifically, it was written in these versions:
Node.js: 20.11.1
Python: 3.12.2
To avoid any issues, please make sure to install these specific versions.

There is also another application that helps in managing the LLMs:
Ollama: 0.1.30
Although it should be noted that the version of Ollama that you install does
not have to be the exact same as the version that was used to develop the
application. After you install Ollama, open the command prompt and run 
`ollama pull mistral`. This will allow you to use the mistall LLM, which
is a part of this program.

## Dependencies
On top of the core requirements, there are also various libraries that are needed.
Here are the dependencies separated into its respective directory:

### Node.js
There are two sets of dependencies for Node.js. They can be installed by simply
running the `npm install` command in their respective directories.

#### Client Directory (.\PersonaCanvas\client\)
- @testing-library/jest-dom: ^5.17.0
- @testing-library/react: ^13.4.0
- @testing-library/user-event: ^13.5.0
- bootstrap: ^5.3.2
- http-proxy-middleware: ^2.0.6
- react: ^18.2.0
- react-bootstrap: ^2.10.1
- react-dom: ^18.2.0
- react-router-dom: ^6.22.0
- react-scripts: 5.0.1
- web-vitals: ^2.1.4

#### Server Directory (.\PersonaCanvas\server\)
- axios: ^1.6.7
- bcrypt: ^5.1.1
- cors: ^2.8.5
- crypto: ^1.0.1
- dotenv: ^16.4.4
- express: ^4.18.2
- mongodb: ^6.3.0
- multer: ^1.4.5-lts.1
- nodemailer: ^6.9.13
- pdf-parse: ^1.1.1
- uuid: ^9.0.1

### Python (.\PersonaCanvas\python_server\)
Python only has a few dependencies that need to be installed.
- pymongo
- socket
- dotenv
- langchain_community

The specific modules that were used from these libraries can be seen in the
Neo_Ollama.py file.

## Quick Note (.env)
There are two .env files that are not a part of the GitHub, as they contain
sensitive data. However, here is what they consisted of so that they can
be recreated with the user's own data:

### (.\PersonaCanvas\server\)
The .env file in this directory contained the following:
- MongoDB API Key
- IP Address of Python Server Running the Python Program
- Crypto Key
- SendGrid API Key
- Gmail Password for PersonaCanvas Email

### (.\PersonaCanvas\python_server)
The .env file in this location is much shorter:
- MongoDB API Key
- Name of MongoDB Database
- Name of MongoDB Collection

## Final Words
That about wraps up everything for the web application. We hope you enjoy using it.
