const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const mongoURI = process.env.MONGODB_URI;

/* Get all users from all collections */
const getAllUsers = async (req, res) => {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const usersDb = client.db("users");
    const collections = await usersDb.listCollections().toArray();
    const allUsers = {};

    // Fetch users from each collection
    await Promise.all(
      collections.map(async (collection) => {
        const collectionName = collection.name;
        const users = await usersDb.collection(collectionName).find().toArray();
        allUsers[collectionName] = users;
      }),
    );
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  } finally {
    await client.close();
  }
}

/* Search users in all collections */
const searchUsers = async (req, res) => {
  const client = new MongoClient(mongoURI);
  try {
    const reqParams = req.query;
    await client.connect();
    const usersDb = client.db("users");
    const collections = await usersDb.listCollections().toArray();
    const searchResults = [];

    // Search for users matching the query in each collection
    for (const collection of collections) {
      const users = await usersDb.collection(collection.name).find({
        $or: [
          { name: { $regex: new RegExp(reqParams.q, 'i') } },
          { username: { $regex: new RegExp(reqParams.q, 'i') } }
        ]
      }, { projection: { name: 1, username: 1, images: 1, _id: 0 } }).toArray();

      searchResults.push(...users);
    }
    res.status(200).json({
      searchResults: searchResults
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed getting Search Results.",
      error: error.message
    });
  } finally {
    await client.close();
  }
}

/* Create a user account */
const createUserAccount = async (req, res) => {
  const reqBody = req.body;
  const userInfo = {
    "_id": null,
    "name": {
      "first": reqBody.firstName,
      "last": reqBody.lastName || null
    },
    "username": reqBody.username,
    "email": {
      "primary": reqBody.email,
      "secondary": null
    },
    "gender": reqBody.gender,
    "dob": reqBody.dob,
    "profession": reqBody.profession,
    "company": null,
    "account": {
      "type": reqBody.accountType,
      "isPrivate": true,
      "status": "active"
    },
    "images": {
      "profile": {
        "src": "https://0.gravatar.com/avatar/f18370ec3562e3cd21fa469e2b582bd741115e5fd8b094c34d952a5871562a87?size=512",
        "width": 400,
        "height": 400
      },
      "banner": {
        "src": "https://miro.medium.com/v2/resize:fit:828/format:webp/1*92adf06PCF91kCYu1nPLQg.jpeg",
        "width": 728,
        "height": 270
      }
    },
    "collection": {
      "id": 128265169159425
    },
    "connections": {
      "mates": {
        "totalCount": 2,
        "items": [
          {
            "id": 84485327,
            "following": true,
            "follower": false,
            "isClose": true,
            "chat": {
              "id": 432658765294515
            }
          },
          {
            "id": 56734598,
            "following": false,
            "follower": true,
            "isClose": true,
            "chat": {
              "id": 456987136597426
            }
          }
        ]
      },
      "following": {
        "totalCount": 2,
        "items": [
          {
            "id": 65278489,
            "mate": false,
            "follower": true,
            "isClose": false
          },
          {
            "id": 58293890,
            "mate": false,
            "follower": false,
            "isClose": true
          }
        ]
      },
      "followers": {
        "totalCount": 2,
        "items": [
          {
            "id": 12389042,
            "mate": false,
            "following": false,
            "isClose": true
          },
          {
            "id": 23903781,
            "mate": false,
            "following": false,
            "isClose": true
          }
        ]
      }
    }
  };
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const usersDb = client.db("users");

    // Check if the username already exists in any collection
    const collections = await usersDb.listCollections().toArray();
    for (const collection of collections) {
      const existingUser = await usersDb.collection(collection.name).findOne({ username: reqBody.username });
      if (existingUser) {
        return res.status(400).json({ message: "Username has already been taken." });
      }
    }

    // If username is not taken, create the user
    await usersDb.collection(`Users_${reqBody.continent}`).insertOne(userInfo);

    res.status(200).json({
      message: "User creation initiated!",
      userInfo: userInfo
    });
  } catch (error) {
    res.status(500).json({
      message: "User creation failed.",
      error: error.message
    });
  } finally {
    if (client) await client.close();
  }
};

/* Delete a user account */
const deleteUserAccount = async (req, res) => {
  const reqParams = req.params;
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const usersDb = client.db("users");
    const collections = await usersDb.listCollections().toArray();

    let userFound = false;

    for (const collection of collections) {
      const result = await usersDb.collection(collection.name).findOne({ username: reqParams.username });
      if (result) {
        await usersDb.collection(collection.name).deleteOne({ username: reqParams.username });
        userFound = true;
        res.status(200).json({
          message: `User with username ${reqParams.username} deleted successfully from collection ${collection.name}.`
        });
        break;
      }
    }

    if (!userFound) {
      res.status(404).json({
        message: `User with username ${reqParams.username} not found in any collection.`
      });
    }

  } catch (error) {
    res.status(500).json({
      message: "User deletion failed.",
      error: error.message
    });
  } finally {
    await client.close();
  }
};

module.exports = {
  getAllUsers,
  searchUsers,
  createUserAccount,
  deleteUserAccount
}