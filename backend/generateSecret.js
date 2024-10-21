const crypto = require('crypto');
const generateSecret = () => {
    return crypto.randomBytes(32).toString('base64');
};

console.log(generateSecret());