// Full dataset display page

import React, { useState, useEffect } from "react";
import axios from "axios";

function rounding(num) {
  if (num === 0) return 0;
  return Math.round(num * 1000) / 1000;
}

// Converts ms to s for legibility
function msConvert(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${formattedSeconds}`;
}

const SongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColumns, setSelectedColumns] = useState({
    name: true,
    artists: true,
    year: true,
    language: true,
    duration: true,
    tempo: true,
    liveness: true,
    valence: true,
    danceability: true,
    energy: true,
    id: true,
    instrumentalness: true,
    key: true,
    mode: true,
    acousticness: true,
    loudness: true
  });

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/songs');
        setSongs(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching songs.");
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSelectedColumns((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="songs-page">
      <h2>View All <strong>Songs</strong> in the <strong>Database!</strong></h2>
      <p>Untick/tick columns to hide/show them</p>

      <div className="column-controls">
        <div className="checkboxes">
          <label>
            <input
              type="checkbox"
              name="name"
              checked={selectedColumns.name}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Name
          </label>
          <label>
            <input
              type="checkbox"
              name="artists"
              checked={selectedColumns.artists}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Artists
          </label>
          <label>
            <input
              type="checkbox"
              name="year"
              checked={selectedColumns.year}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Year
          </label>
          <label>
            <input
              type="checkbox"
              name="language"
              checked={selectedColumns.language}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Language
          </label>
          <label>
            <input
              type="checkbox"
              name="duration"
              checked={selectedColumns.duration}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Duration
          </label>
          <label>
            <input
              type="checkbox"
              name="tempo"
              checked={selectedColumns.tempo}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Tempo
          </label>
          <label>
            <input
              type="checkbox"
              name="liveness"
              checked={selectedColumns.liveness}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Liveness
          </label>
          <label>
            <input
              type="checkbox"
              name="valence"
              checked={selectedColumns.valence}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Valence
          </label>
          <label>
            <input
              type="checkbox"
              name="danceability"
              checked={selectedColumns.danceability}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Danceability
          </label>
          <label>
            <input
              type="checkbox"
              name="energy"
              checked={selectedColumns.energy}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Energy
          </label>
          <label>
            <input
              type="checkbox"
              name="id"
              checked={selectedColumns.id}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            ID
          </label>
          <label>
            <input
              type="checkbox"
              name="instrumentalness"
              checked={selectedColumns.instrumentalness}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Instrumentalness
          </label>
          <label>
            <input
              type="checkbox"
              name="key"
              checked={selectedColumns.key}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Key
          </label>
          <label>
            <input
              type="checkbox"
              name="mode"
              checked={selectedColumns.mode}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Mode
          </label>
          <label>
            <input
              type="checkbox"
              name="acousticness"
              checked={selectedColumns.acousticness}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Acousticness
          </label>
          <label>
            <input
              type="checkbox"
              name="loudness"
              checked={selectedColumns.loudness}
              onChange={handleCheckboxChange}
            />
            <span class="checkmark"></span>
            Loudness
          </label>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            {selectedColumns.name && <th>Name</th>}
            {selectedColumns.artists && <th>Artists</th>}
            {selectedColumns.year && <th>Year</th>}
            {selectedColumns.language && <th>Language</th>}
            {selectedColumns.duration && <th>Duration</th>}
            {selectedColumns.tempo && <th>Tempo</th>}
            {selectedColumns.explicit && <th>Explicit</th>}
            {selectedColumns.liveness && <th>Liveness</th>}
            {selectedColumns.valence && <th>Valence</th>}
            {selectedColumns.danceability && <th>Danceability</th>}
            {selectedColumns.energy && <th>Energy</th>}
            {selectedColumns.id && <th>ID</th>}
            {selectedColumns.instrumentalness && <th>Instrumentalness</th>}
            {selectedColumns.key && <th>Key</th>}
            {selectedColumns.mode && <th>Mode</th>}
            {selectedColumns.acousticness && <th>Acousticness</th>}
            {selectedColumns.loudness && <th>Loudness</th>}
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={index}>
              {selectedColumns.name && <td>{song.name}</td>}
              {selectedColumns.artists && <td>{song.artists.replace(/[\[\]']+/g, '')}</td>}
              {selectedColumns.year && <td>{song.year}</td>}
              {selectedColumns.language && <td>{song.language}</td>}
              {selectedColumns.duration && <td>{msConvert(song.duration_ms)}</td>}
              {selectedColumns.tempo && <td>{rounding(song.tempo)}</td>}
              {selectedColumns.explicit && <td>{song.explicit}</td>}
              {selectedColumns.liveness && <td>{rounding(song.liveness)}</td>}
              {selectedColumns.valence && <td>{rounding(song.valence)}</td>}
              {selectedColumns.danceability && <td>{rounding(song.danceability)}</td>}
              {selectedColumns.energy && <td>{rounding(song.energy)}</td>}
              {selectedColumns.id && <td>{song.id}</td>}
              {selectedColumns.instrumentalness && <td>{rounding(song.instrumentalness)}</td>}
              {selectedColumns.key && <td>{song.key}</td>}
              {selectedColumns.mode && <td>{song.mode}</td>}
              {selectedColumns.acousticness && <td>{rounding(song.acousticness)}</td>}
              {selectedColumns.loudness && <td>{rounding(song.loudness)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongsPage;
