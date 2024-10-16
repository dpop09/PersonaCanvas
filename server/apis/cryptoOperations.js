const crypto = require('crypto')
require('dotenv').config()

const ENCRYPTION_KEY = Buffer.from(process.env.CRYPTO_KEY, 'hex')   // **dpop** convert the crypto_key stored in the .env from hexadecimal to binary

const cryptoOperations = {
    encrypt: function(parmtr_input_text) {
        if (parmtr_input_text === null)
            return null
        const iv = crypto.randomBytes(16)   // **dpop09** generate a 16 byte initialization vector
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)    // **dpop09 create a cipher instance using AES algorithm
        let encrypted_text = cipher.update(parmtr_input_text)   // **dpop09 encrypt the text
        encrypted_text = Buffer.concat([encrypted_text, cipher.final()])
        return { iv: iv.toString('hex'), encryptedData: encrypted_text.toString('hex')} // **dpop09** convert to a more readable format
    },
    decrypt: function(parmtr_input_text) {
        if (parmtr_input_text === null)
            return null
        let iv = Buffer.from(parmtr_input_text.iv, 'hex');  // **dpop09** must convert the iv and encrypted text back to their binary form
        let encrypted_text = Buffer.from(parmtr_input_text.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted_text = decipher.update(encrypted_text);   // **dpop09** decrypt the text
        decrypted_text = Buffer.concat([decrypted_text, decipher.final()]);
        return decrypted_text.toString();   // **dpop09** return as a string
    },
    generateKey: function() {   // **dpop09** function is for development purposes
        const key_buffer = crypto.randomBytes(32)  // **dpop09** key should be 32 bytes for aes-256-cbc
        const key_hex = key_buffer.toString('hex')  // **dpop09** convert to hexadecimal for better readability
        return key_key
    }
}

module.exports = cryptoOperations