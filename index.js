// index.js
const express = require("express");
const axios = require("axios");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoURL = "mongodb+srv://florixer:Kau93043@flexomate-cluster.bzqxpj3.mongodb.net/users?retryWrites=true&w=majority";

app.use(cors());
app.use(bodyParser.json());
let db;

process.env.TZ = "Asia/Kolkata"

MongoClient.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((client) => {
    console.log("Connected to MongoDB");
    db = client.db("users");

/* app.get("/add_continents", async (req, res) => {
  try {
    const continents = ["Africa", "Antarctica", "Asia", "Europe", "North_America", "Oceania", "South_America"];
    const collections = continents.map(continent => `Users_${continent}`);
    
    await Promise.all(collections.map(async (collection) => {
      try {
        await db.createCollection(collection);
        console.log(`Collection ${collection} created successfully`);
      } catch (error) {
        console.error(`Error creating collection ${collection}:`, error);
      }
    }));

    res.status(200).json({ message: "Continents collections added successfully" });
  } catch (error) {
    console.error("Error adding continents collections:", error.message);
    res.status(500).json({ message: "Failed to add continents collections" });
  }
}); */
        app.post("/users/add", async (req, res) => {
      try {
        const userData = req.body;
        await db.collection(`Users_${userData.continent}`).insertOne(userData);
        res.status(200).json({
          message: "User creation initiated!",
          info: userData 
        });
      } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(500).json({
          message: "User creation failed.",
        });
      }
    });

    app.get("/users", async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();
    const allUsers = {};

    await Promise.all(collections.map(async (collection) => {
      const collectionName = collection.name;
      const users = await db.collection(collectionName).find().toArray();
      allUsers[collectionName] = users;
    }));

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/users/delete", async (req, res) => {
  try {
    // delete all users of continent in query
    const { continent } = req.query;
    await db.collection(`Users_${continent}`).deleteMany({});
    res.status(200).json({
      message: "User deletion initiated!" ,
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      message: "User deletion failed.",
    });
  }
})

    app.post("/libraries", async (req, res) => {
      try {
        await db.collection("libraries").insertOne(req.body);
        res.status(200).json({
          message: "Library creation initiated!",
        });
      } catch (error) {
        console.error("Error creating library:", error.message);
        res.status(500).json({
          message: "Library creation failed.",
        });
      }
    });

    app.get("/spotify/download/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const externalApiResponse = await axios.get(
          `https://api.spotifydown.com/download/${id}`,
          {
            headers: {
              Accept: "*/*",
              "Accept-Encoding": "gzip, deflate, br",
              "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
              Origin: "https://spotifydown.com",
              Referer: "https://spotifydown.com/",
              "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
              "Sec-Ch-Ua-Mobile": "?1",
              "Sec-Ch-Ua-Platform": '"Android"',
              "Sec-Fetch-Dest": "empty",
              "Sec-Fetch-Mode": "cors",
              "Sec-Fetch-Site": "same-site",
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            },
          }
        );

        res.json(externalApiResponse.data);
      } catch (error) {
        console.error("Error making external API request:", error.message);
        res.status(500).json({
          error: "Internal Server Error",
        });
      }
    });

    const getTopTracks = async () => {
      try {
        const { data } = await axios.get(
          "https://spotify-downloader1.p.rapidapi.com/trackList/playlist/37i9dQZEVXbLZ52XmnySJg",
          {
            headers: {
              "X-RapidAPI-Key":
                "b2fd7811a0msha2d668dfd2c45bap100a30jsn22bc61f46071",
              "X-RapidAPI-Host": "spotify-downloader1.p.rapidapi.com",
            },
          }
        );
        fs.truncate("json/top_tracks.json", (err) => {
          if (err) throw err;
          console.log("json/top_tracks.json was truncated");
        });
        fs.writeFile("json/top_tracks.json", JSON.stringify(data), (err) => {
          if (err) {
            console.error("Error writing to file:", err);
            return;
          }
        });
        console.log("Done Updating Top Tracks");
      } catch (error) {
        console.error("Error retrieving top tracks:", error);
      }
    };

    cron.schedule("0 0 0 * * *", getTopTracks);

    app.get("/spotify/top_tracks", async (req, res) => {
      try {
        fs.readFile("json/top_tracks.json", function (err, data) {
          if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ message: "Failed to retrieve top tracks" });
            return;
          }
          const topTracks = JSON.parse(data);
          res.status(200).json({ topTracks });
        });
      } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    app.get("/spotify/get_top_tracks", async (req, res) => {
      try {
        getTopTracks();
        res.status(200).json({message: "getTopTracks() has been invoked"})
      } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).json({ message: "Couldn't invoke getTopTracks()" });
      }
    });

    app.get("/", async (req, res) => {
      res.status(200).json({
        message: "API Server is working fine!",
        tz: new Date().toLocaleString(),
      });
    });

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        message: "Something went wrong!",
      });
    });

    app.listen(PORT, () => {
      console.log(`API Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
