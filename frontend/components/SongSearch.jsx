// Song suggestion dropdown component

import React, { useEffect, useRef, useState } from "react";

function SongSearch({ songName, setSongName }) {
  const [suggestions, setSuggestions] = useState([]);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch on songName change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (songName.trim()) {
        // Fetch songs from backend if songName not empty
        fetch(`http://localhost:5000/search_songs?q=${encodeURIComponent(songName)}`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
          })
          .then((data) => setSuggestions(data))
          .catch((err) => {
            console.error("Fetch error:", err);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]); 
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [songName]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) && 
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle suggestion click (clear, populate field)
  const handleSuggestionClick = (title) => {
    setSongName(title);
    setSuggestions([]);
  };

  return (
    <div className="song-search-container">
      {/*Search input */}
      <input ref={inputRef} type="text" value={songName} onChange={(e) => setSongName(e.target.value)} placeholder="Enter Song Name" className="song-search-input" required/>
      
      {/* Display suggestions title and artist*/}
      {suggestions.length > 0 && (
        <ul ref={dropdownRef} className="suggestions">
          {suggestions.map((song, index) => (
            <li key={index} onMouseDown={() => handleSuggestionClick(song.name)} className="suggestion-item">
              {song.name} - {song.artists}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongSearch;