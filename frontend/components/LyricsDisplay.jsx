// Recommendation section of homepage (Spotify player, cos sim. score)

import React from "react";

const LyricsDisplay = ({ songName, lyrics }) => {
  {/* Trim lines for individual hover translations */}
  const cleanUpLines = (str) => {
    return str.trim().split("\n").map((line) => line.trim());
  };

  const originalLines = cleanUpLines(lyrics?.original || "");
  const translatedLines = cleanUpLines(lyrics?.translated || "");

  return (
    <div className="lyrics-display"> 
      <div className="wrapper">
        {lyrics ? (
          <div className="lyrics-content">
            <div className="lyrics-column">
              <h2><strong>Original</strong> Lyrics:</h2>
              {originalLines.map((line, index) => ( 
                <p key={index} className="hover-line">
                  <span className="original-line">
                    {line}
                    <span className="tooltip">
                      {translatedLines[index] || ""}
                    </span>
                  </span>
                </p>
              ))}
            </div>
            
            <div className="lyrics-column">
              <h2><strong>Translated</strong> Lyrics:</h2> 
              {translatedLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        ) : (
          // Error message for Genius API lack of lyrics
          <p>Unfortunately, the lyrics aren't available for this one.</p>
        )} 
      </div>
    </div>
  ); 
};

export default LyricsDisplay;
