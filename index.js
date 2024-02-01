const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const mongoURL = 'mongodb+srv://florixer:Kau93043@flexomate-cluster.bzqxpj3.mongodb.net/flexomate_db?retryWrites=true&w=majority';
const dbName = 'flexomate_db';
const usersCollection = 'users';
const librariesCollection = 'libraries';

app.use(bodyParser.json());

let db;

// Connect to MongoDB
MongoClient.connect(mongoURL)
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);

    // CRUD operations: Users

    // Create User
    app.post('/users', async (req, res) => {
      try {
        const result = await db.collection(usersCollection).insertOne(req.body);
        console.log('User Created Successfully!');
        res.status(200).json({ message: 'User creation initiated!' });
      } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: 'User creation failed.' });
      }
    });

    // Read All Users
    app.get('/users', async (req, res) => {
      try {
        const users = await db.collection(usersCollection).find().toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve users.' });
      }
    });

    // Read User by ID
    app.get('/users/id/:id', async (req, res) => {
      try {
        const user = await db.collection(usersCollection).findOne({ _id: new ObjectId(req.params.id) });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve user.' });
      }
    });

    // Update User
    app.patch('/users/:id', async (req, res) => {
      try {
        const result = await db.collection(usersCollection).findOneAndUpdate(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body },
          { returnDocument: 'after' }
        );
        res.status(200).json({ message: 'User Updated Successfully!' });
      } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: 'User update failed.' });
      }
    });

    // Delete User
    app.delete('/users/:id', async (req, res) => {
      try {
        const result = await db.collection(usersCollection).findOneAndDelete({ _id: new ObjectId(req.params.id) });
        res.status(200).json({ message: 'User Deleted Successfully!' });
      } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: 'User deletion failed.' });
      }
    });

    // CRUD operations: Libraries

    // Create Library
    app.post('/libraries', async (req, res) => {
      try {
        const result = await db.collection(librariesCollection).insertOne(req.body);
        console.log('Library Created Successfully!');
        res.status(200).json({ message: 'Library creation initiated!' });
      } catch (error) {
        console.error('Error creating library:', error.message);
        res.status(500).json({ message: 'Library creation failed.' });
      }
    });

    // Read All Libraries
    app.get('/libraries', async (req, res) => {
      try {
        const libraries = await db.collection(librariesCollection).find().toArray();
        res.status(200).json(libraries);
      } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve libraries.' });
      }
    });

    // Read Library by ID
    app.get('/libraries/id/:id', async (req, res) => {
      try {
        const library = await db.collection(librariesCollection).findOne({ _id: new ObjectId(req.params.id) });
        if (!library) {
          return res.status(404).json({ message: 'Library not found' });
        }
        res.status(200).json(library);
      } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve library.' });
      }
    });

    // Root Endpoint
    app.get('/', (req, res) => {
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
