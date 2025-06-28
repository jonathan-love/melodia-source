// Recommendation section of homepage (Spotify player, cos sim. score)

import React from 'react';

const RecommendationsList = ({ recommendations, lyrics, handleWordClick, trackMetadata }) => {
  return (
    <ul className="song-list">
      {recommendations.map((song) => {
        const meta = trackMetadata[song.name];

        if (!meta) {
          return (
            <li key={song.name} className="song-item">
              <div className="track-info">
                <p className="song-name">{song.name} (Similarity: {song.similarity.toFixed(2)})</p>
                <p className="metadata-unavailable">Metadata not available</p>
              </div>
            </li>
          );
        }

        return (
          <li key={song.name} className="song-item">
            <div className="track-info">
              <div className="track-meta">
                <div className="spotify-player">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${meta.spotify_url.split('track/')[1]}`}
                    width="100%"
                    height="500"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`Spotify player for ${meta.artist} - ${song.name}`}
                  ></iframe>
                  <h3>SIMILARITY SCORE</h3>
                  <strong>{song.similarity.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default RecommendationsList;
