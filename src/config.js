require('dotenv').config();

module.exports = {
  API_ADMIN_KEY: process.env.API_ADMIN_KEY,
  API_PRIVATE_KEY: process.env.API_PRIVATE_KEY,
  API_PUBLIC_KEY: process.env.API_PUBLIC_KEY,
  API_URL: process.env.API_URL || 'https://verify.stage.vouched.id/api',
  API_GRAPHQL_URL: process.env.API_GRAPHQL_URL || 'https://verify.stage.vouched.id/graphql',
  ONBOARD_URL: process.env.ONBOARD_URL || 'https://onboard.stage.vouched.id/api',
};
