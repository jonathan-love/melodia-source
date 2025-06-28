// Liked songs display page

import React, { useEffect, useState } from "react";
import axios from "axios";

const LikedPage = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch liked songs on start
  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/liked-songs");
        setLikedSongs(response.data);
      } catch (err) {
        console.error("Error fetching liked songs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, []); 

  const handleRemoveSong = async (songName) => {
    try {
      await axios.post("http://localhost:5000/remove-song", { name: songName });

      // Update state on song removal
      setLikedSongs(prevSongs => prevSongs.filter(song => song.name !== songName));
    } catch (err) {
      console.error("Failed to remove song:", err);
    }
  };

  return (
    <div className='dashboard' style={{ scrollSnapType: 'y mandatory', overflowY: 'scroll', height: '100vh' }}>
      <div className="liked-page">
        {loading ? (
          <p>Loading...</p>
        ) : likedSongs.length === 0 ? (
          // Show when there are no liked songs
          <h2>Nothing Yet...<br />Your <strong>Liked Songs</strong> Will Show Up Here!</h2>
        ) : (
          <div className="liked-songs-grid">
            {likedSongs.map((song, index) => (
              <div className="liked-song-card" key={index}>
                {/* Album art */}
                <img
                  src={song.album_art}
                  alt={`${song.name} album art`}
                  className="album-art"
                />
                <div className="song-info">
                  {/* Song name and artist */}
                  <p className="song-name">{song.name}</p>
                  <p className="artist-name">{song.artist}</p>

                  {/* Spotify link button */}
                  {song.spotify_url && (
                    <button
                      className='sidebar-btn spotify-btn'
                      onClick={() => window.open(song.spotify_url, "_blank")}
                    >
                      <i className="fab fa-spotify"></i> Listen on Spotify
                    </button>
                  )}

                  {/* Remove from liked list */}
                  <button
                    className="sidebar-btn remove-btn"
                    onClick={() => handleRemoveSong(song.name)}
                  >
                    <i className="fa-solid fa-user-slash"></i> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedPage;
