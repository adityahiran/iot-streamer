require('dotenv').config();

module.exports = async function secrets() {
  const options = {
    apiVersion: 'v1',
    endpoint: 'http://127.0.0.1:8200',
    token: process.env.VAULT_TOKEN
  };

  const vault = require('node-vault')(options);

  return await vault.read('kv/iot-streamer');
};
