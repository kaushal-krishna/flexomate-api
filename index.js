// app.js
const express = require('express');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const PORT_USERS_API = 3000;
const PORT_COLLECTIONS_API = 3001;
const mongoURL = 'mongodb+srv://florixer:Kau93043@flexomate-cluster.bzqxpj3.mongodb.net/flexomate_db?retryWrites=true&w=majority';

app.use(bodyParser.json());

let db;

// Connect to MongoDB
MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db('flexomate_db');

    // Users API - CRUD Operations

    // Create a new user
    app.post('/users', async (req, res) => {
      try {
        await db.collection('users').insertOne(req.body);
        res.status(200).json({ message: 'User creation initiated!' });
      } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: 'User creation failed.' });
      }
    });

    // Get all users
    app.get('/users', async (req, res) => {
      try {
        const users = await db.collection('users').find().toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Get user by username
    app.get('/users/:username', async (req, res) => {
      const { username } = req.params;
      try {
        const user = await db.collection('users').findOne({ username });
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Search users by partial username match
    app.get('/users/search/:partialUsername', async (req, res) => {
      const { partialUsername } = req.params;
      try {
        const regex = new RegExp(partialUsername, 'i');
        const users = await db.collection('users').find({ username: { $regex: regex } }).toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Update user information
    app.patch('/users/:id', async (req, res) => {
      const { id } = req.params;
      const { username, email } = req.body;
      try {
        const result = await db.collection('users').findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { username, email } },
          { returnDocument: 'after' }
        );
        res.json({ message: 'User Updated Successfully!' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    });

    // Delete user by ID
    app.delete('/users/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await db.collection('users').findOneAndDelete({ _id: new ObjectId(id) });
        res.json({ message: 'User Deleted Successfully!' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Collections API - CRUD Operations

    // Create a new library
    app.post('/libraries', async (req, res) => {
      try {
        await db.collection('libraries').insertOne(req.body);
        res.status(200).json({ message: 'Library creation initiated!' });
      } catch (error) {
        console.error('Error creating library:', error.message);
        res.status(500).json({ message: 'Library creation failed.' });
      }
    });

    // Get all libraries
    app.get('/libraries', async (req, res) => {
      try {
        const libraries = await db.collection('libraries').find().toArray();
        res.status(200).json(libraries);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Get library by ID
    app.get('/libraries/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const library = await db.collection('libraries').findOne({ _id: new ObjectId(id) });

        if (!library) {
          return res.status(404).json({ message: 'Library not found' });
        }

        res.status(200).json(library);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.get('/spotify/download/:id', async (req, res) => {
  trapp.get('/spotify/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const externalApiResponse = await axios.get(`https://api.spotifydown.com/download/${id}`, {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Origin': 'https://spotifydown.com',
        'Referer': 'https://spotifydown.com/',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    });
    
    // Send the external API response as your API response
    res.json(externalApiResponse.data);
  } catch (error) {
    console.error('Error making external API request:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
    // Root endpoint
    app.get('/', async (req, res) => {
      res.status(200).json({ message: 'API Server is working fine!' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    // Users API Server
    app.listen(PORT_USERS_API, () => {
      console.log(`Users API Server is running on port ${PORT_USERS_API}`);
    });

    // Collections API Server
    app.listen(PORT_COLLECTIONS_API, () => {
      console.log(`Collections API Server is running on port ${PORT_COLLECTIONS_API}`);
    });

  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
