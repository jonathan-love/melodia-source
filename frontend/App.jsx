import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import DataPage from './pages/DataPage';
import SongsPage from './pages/SongsPage';
import LikedPage from './pages/LikedPage';
import InfoPage from './pages/InfoPage';
import './styles/style.css';

const App = () => {
  const [songName, setSongName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [lyrics, setLyrics] = useState({});
  const [emotions, setEmotions] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wordDefinition, setWordDefinition] = useState(null);
  const [trackMetadata, setTrackMetadata] = useState({});
  const [clickedWord, setClickedWord] = useState("");
  const [likedSongs, setLikedSongs] = useState([]);
  const [spotifyLink, setSpotifyLink] = useState("");
  
  const dashboardRef = useRef(null);

  // Language codes for the dropdown
  const languageOptions = ["en", "fr", "es", "de", "it", "id", "pt", "el", "ro", "so"];

  const handleInputChange = (e) => setSongName(e.target.value);

  const handleLanguageChange = (e) => setSelectedLanguage(e.target.value);

  // Handles form submission for fetching recommendations
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!songName || !selectedLanguage) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/recommendations?song_name=${songName}&language=${selectedLanguage}`
      );
      if (response.data.length > 0) {
        setRecommendations(response.data);
      } else {
        setErrorMessage("No songs found with that name. Try finding one in the Database page!");
        setRecommendations([]);
      }
    } catch (error) {
      setErrorMessage("Error fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Fetches Spotify metadata (via Spoify API)
  const fetchSpotifyLink = useCallback(async (song) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-spotify-link?song_name=${encodeURIComponent(song.name)}`);
      setTrackMetadata(prev => ({
        ...prev,
        [song.name]: {
          spotify_url: response.data.spotify_url,
          album_art: response.data.album_art,
          artist: response.data.artist,
        }
      }));
    } catch (error) {
      console.error("Error fetching Spotify link:", error);
    }
  }, []);

  // Saves right-swiped songs to liked songs
  const handleLikeSong = async (song) => {
    if (!likedSongs.some(s => s.name === song.name)) {
      setLikedSongs(prev => [...prev, song]);

      try {
        await axios.post("http://localhost:5000/like-song", song);
      } catch (err) {
        console.error("Failed to save liked song:", err);
      }
    }
  };

  // Fetches song lyrics for current song
  const fetchLyrics = async (recommendedSongs) => {
    let lyricsData = {};
    for (let song of recommendedSongs) {
      try {
        const response = await axios.get(
          `http://localhost:5000/lyrics?song_name=${song.name}`
        );
        const songLyrics = response.data[0];
        lyricsData[song.name] = songLyrics;
      } catch (error) {
        lyricsData[song.name] = { original: "Lyrics not available.", translated: "Lyrics not available." };
      }
    }
    setLyrics(lyricsData);
  };

  // Fetches track metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      let metadataMap = {};
      for (let song of recommendations) {
        try {
          const response = await axios.get(
            `http://localhost:5000/track-metadata?song_name=${encodeURIComponent(song.name)}`
          );
          metadataMap[song.name] = response.data;
        } catch (error) {
          console.error(`Error fetching metadata for ${song.name}`, error);
          metadataMap[song.name] = null;
        }
      }
      setTrackMetadata(metadataMap);
    };

    if (recommendations.length > 0) {
      fetchMetadata();
    }
  }, [recommendations]);

  // Fetches emotional qualities
  const fetchEmotions = useCallback(async (recommendedSongs) => {
    try {
      const response = await axios.post("http://localhost:5000/emotions", {
        input_song: songName,
        recommended_songs: recommendedSongs.map((song) => song.name),
      });
      console.log("Fetched emotions:", response.data);
      setEmotions({
        songQualities: response.data.track_metadata,
        emotions: response.data.emotion_results,
      });
    } catch (error) {
      console.error("Error fetching emotions:", error);
    }
  }, [songName]);

  // Fetches Spotify links, lyrics, and sentiments
  useEffect(() => {
    if (recommendations.length > 0) {
      recommendations.forEach((song) => {
        fetchSpotifyLink(song);
      });
    }
  }, [recommendations, fetchSpotifyLink]);

  useEffect(() => {
    if (recommendations.length > 0) {
      fetchLyrics(recommendations);
      fetchEmotions(recommendations);
    }
  }, [recommendations, fetchEmotions]);

  const handleWordClick = async (word) => {
    setClickedWord(word);
    setWordDefinition(null);
    try {
      const response = await axios.get(`http://localhost:5000/define-word?word=${word}`);
      setWordDefinition(response.data.definition);
    } catch (error) {
      setWordDefinition("Definition not found.");
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar songName={songName} spotifyLink={trackMetadata[songName]?.spotify_url} dashboardRef={dashboardRef} />
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard
                dashboardRef={dashboardRef}
                setSpotifyLink={setSpotifyLink}
                songName={songName}
                setSongName={setSongName}
                selectedLanguage={selectedLanguage}
                languageOptions={languageOptions}
                handleInputChange={handleInputChange}
                handleLanguageChange={handleLanguageChange}
                handleFormSubmit={handleFormSubmit}
                recommendations={recommendations}
                loading={loading}
                errorMessage={errorMessage}
                emotions={emotions}
                lyrics={lyrics}
                handleWordClick={handleWordClick}
                wordDefinition={wordDefinition}
                trackMetadata={trackMetadata}
                clickedWord={clickedWord}
                likedSongs={likedSongs}
                handleLikeSong={handleLikeSong}
              />}
            />
            <Route path="pages/data" element={<DataPage />} />
            <Route path="pages/songs" element={<SongsPage />} />
            <Route path="pages/liked" element={<LikedPage />} />
            <Route path="pages/info" element={<InfoPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
