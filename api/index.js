// index.js
const express = require("express");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const { getAllUsers, searchUsers, createUserAccount, loginUserAccount, deleteUserAccount } = require("../routes/users/userAccountProcessor.js")
const { spotifyGetTopTracks, spotifyListTopTracks, spotifyDownloadTrack } =
require("../routes/music/spotifyProcessor.js")
const { sendSignupEmailOtp, verifySignupEmailOtp } = require("../routes/mailer/otpProcessor.js");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

process.env.TZ = "Asia/Kolkata";

app.get("/api", async (req, res) => {
  let clientIp = req.ip;

    // Check if the request is coming from a proxy server
    if (req.headers['x-forwarded-for']) {
      clientIp = req.headers['x-forwarded-for'].split(',')[0].trim();
    }
  res.status(200).json({
    message: "API Server is working fine!",
    tz: new Date().toLocaleString(),
    callerIp: clientIp,
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

MongoClient.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to MongoDB");
    const usersDb = client.db("users");

    /* app.get("/add_continents", async (req, res) => {
      try {
        const continents = ["Africa", "Antarctica", "Asia", "Europe", "North_America", "Oceania", "South_America"];
        const collections = continents.map(continent => `Users_${continent}`);
        
        await Promise.all(collections.map(async (collection) => {
          try {
            await usersDb.createCollection(collection);
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
    app.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
});

    app.get("/api/users", getAllUsers);
    app.get("/api/users/search", searchUsers);
    app.post("/api/users/create_account", createUserAccount);
    app.post("/api/users/login_account", loginUserAccount);
    app.get("/api/users/delete_account/:username", deleteUserAccount);

    app.get("/api/spotify/download/:id", spotifyDownloadTrack);

    cron.schedule("0 0 0 * * *", spotifyGetTopTracks);

    app.get("/api/spotify/top_tracks", spotifyListTopTracks);

    app.get("/spotify/get_top_tracks", spotifyGetTopTracks)
    app.post("/api/mailer/send_signup_email_otp", sendSignupEmailOtp);
    app.post("/api/mailer/verify_signup_email_otp", verifySignupEmailOtp);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
