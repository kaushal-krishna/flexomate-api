const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const topTracksJsonFilePath = path.join(__dirname, "../../json/top_tracks.json");
const spotifyListTopTracks = async (req, res) => {
  try {
    const data = await fs.readFile(topTracksJsonFilePath, "utf8");
    const topTracks = JSON.parse(data);
    res.status(200).json({ topTracks });
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const spotifyGetTopTracks = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://spotify-downloader1.p.rapidapi.com/trackList/playlist/37i9dQZEVXbLZ52XmnySJg",
      {
        headers: {
          "X-RapidAPI-Key":
            "b2fd7811a0msha2d668dfd2c45bap100a30jsn22bc61f46071",
          "X-RapidAPI-Host": "spotify-downloader1.p.rapidapi.com",
        },
      },
    );
    fs.truncate(topTracksJsonFilePath, 0, (err) => {
  if (err) throw err;
  console.log("topTracksJsonFilePath was truncated");
});
    fs.writeFile(topTracksJsonFilePath, JSON.stringify(data), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return;
      }
    });
    console.log("Done Updating Top Tracks");
    res.status(200).json({
      message: "getTopTracks request has been invoked",
    });
  } catch (error) {
    console.error("Error handling getTopTracks Request:", error);
    res.status(500).json({
      message: "Couldn't invoke getTopTracks request",
    });
  }
};
const spotifyDownloadTrack = async (req, res) => {
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
      },
    );

    res.json(externalApiResponse.data);
  } catch (error) {
    res.status(500).json({
      error: "Unable to make download request",
    });
  }
};

module.exports = {
  spotifyGetTopTracks,
  spotifyListTopTracks,
  spotifyDownloadTrack
}
