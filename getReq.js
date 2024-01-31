const axios = require('axios');

const apiUrl = 'http://localhost:3000/users/search/john'; // Replace with your actual API endpoint

axios.get(apiUrl)
  .then((response) => {
    console.log('API Response:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });