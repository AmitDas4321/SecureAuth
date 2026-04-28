require('dotenv').config();

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME,
      script: "server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx"
    }
  ]
};