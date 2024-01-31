const axios = require('axios');

const apiUrl = 'https://flexomate-api.cyclic.app/users/search/john'; // Replace with your actual API endpoint

axios.get(apiUrl)
  .then((response) => {
    console.log('API Response:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });
