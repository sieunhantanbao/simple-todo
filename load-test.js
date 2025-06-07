const axios = require('axios');

const TARGET_URL = 'http://sd2411-my-todo-alb-1775934983.us-east-1.elb.amazonaws.com/api-docs/';
const CONCURRENCY = 50; // how many concurrent requests per interval
const INTERVAL = 1000; // milliseconds between batches

async function sendRequest() {
  try {
    const response = await axios.get(TARGET_URL);
    console.log(`Status: ${response.status}`);
  } catch (err) {
    console.error(`Error: ${err.response?.status || err.message}`);
  }
}

function startLoadTest() {
  setInterval(() => {
    for (let i = 0; i < CONCURRENCY; i++) {
      sendRequest();
    }
  }, INTERVAL);
}

startLoadTest();
