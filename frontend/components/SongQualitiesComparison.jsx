// Song data display component (post-swipe-right)

import React from 'react';

const SongQualitiesComparison = ({ inputSongData, comparedSongData }) => {
  if (!inputSongData || !comparedSongData) return null;
  
  const qualitiesToShow = ['Song Name', 'Artist(s)', 'Year', 'Duration', 'Tempo', 'Key and Mode'];

  return (
    <div className="song-qualities-comparison">
      <div className="song-box">
        <ul>
          {qualitiesToShow.map((quality) => (
            <li key={quality}><text>{quality}:</text> {inputSongData[quality] ?? "Data not available"}</li>
          ))}
        </ul>
      </div>

      <div className="song-box">
        <ul>
          {qualitiesToShow.map((quality) => (
            <li key={quality}><text>{quality}:</text> {comparedSongData[quality] ?? "Data not available"}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default SongQualitiesComparison;
