const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10

const bcryptOperations = {
    hashPassword: function(parmtr_password) {
        try {
            var salt = bcrypt.genSaltSync(SALT_ROUNDS)  // **dpop09** generate the salts
            var output_hash = bcrypt.hashSync(parmtr_password, salt)   // **dpop09** hash the password with the generated salt
            return output_hash
        } catch (error) {
            console.error(error)
            return
        }
    },
    comparePasswordToHash: async function(parmtr_password, parmtr_hashed_password) {
        try {
            var result = await bcrypt.compare(parmtr_password, parmtr_hashed_password)
            return result
        } catch (error) {
            console.error(error)
            return false
        }
    }
}

module.exports = bcryptOperations