const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 443;
const mongoURL = process.env.MONGO_URL ||
'mongodb+srv://florixer:Kau93043@flexomate-cluster.bzqxpj3.mongodb.net/flexomate_db?retryWrites=true&w=majority';
// Use environmental variable or default value
const dbName = 'flexomate_db';
const collectionName = 'users';

app.use(bodyParser.json());

let db;

// Connect to MongoDB
MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);

    // Your routes and other middleware go here...

    // CRUD operations

    // Create
    app.post('/users', async (req, res) => {
      const { username, email } = req.body;
      const collection = db.collection(collectionName);

      try {
        const result = await collection.insertOne({ username, email });
        res.status(200).json({ message: 'User Created Successfully!' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Read all
    app.get('/users', async (req, res) => {
      const collection = db.collection(collectionName);

      try {
        const users = await collection.find().toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Read user by username
    app.get('/users/:username', async (req, res) => {
      const { username } = req.params;
      const collection = db.collection(collectionName);

      try {
        const user = await collection.findOne({ username });

        res.json(user);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Search users by partial username match
    app.get('/users/search/:partialUsername', async (req, res) => {
      const { partialUsername } = req.params;
      const collection = db.collection(collectionName);

      try {
        const regex = new RegExp(partialUsername, 'i');
        const users = await collection.find({ username: { $regex: regex } }).toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Update
    app.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const collection = db.collection(collectionName);

  try {
    const result = await collection.findOneAndUpdate(
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

    // Delete
    app.delete('/users/:id', async (req, res) => {
      const { id } = req.params;
      const collection = db.collection(collectionName);

      try {
        const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });

        res.json({ message: 'User Deleted Successfully!' });
      } catch (error) {
        res.status(500).json({ message: error.message });
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

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
