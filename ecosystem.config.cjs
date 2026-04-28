module.exports = {
  apps: [
    {
      name: "secureauth",
      script: "server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx"
    }
  ]
};