require('dotenv').config();

module.exports = {
  API_KEY: process.env.API_KEY,
  API_URL: process.env.API_URL || 'https://verify.vouched.id/api'
};
