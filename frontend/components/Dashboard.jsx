// Main homepage vertical dashboard component

import React, { useRef, useState, useEffect } from 'react';
import RecommendationsList from './RecommendationsList';
import LyricsDisplay from './LyricsDisplay';
import SongQualitiesComparison from './SongQualitiesComparison';
import WordDefinitionPopup from './WordDefinitionPopup';
import LangComponent from './LangComponent';
import SongSearch from './SongSearch';
import logo from '../assets/images/logo.png';

const Dashboard = ({
  songName,
  setSongName,
  selectedLanguage,
  languageOptions,
  handleInputChange,
  dashboardRef,
  handleLanguageChange,
  handleFormSubmit,
  setSpotifyLink,
  recommendations,
  emotions,
  loading,
  errorMessage,
  lyrics,
  handleWordClick,
  wordDefinition,
  clickedWord,
  trackMetadata,
  handleLikeSong,
  likedSongs
}) => {
  const searchRef = useRef(null);
  const recommendationsRef = useRef(null);
  const lyricsRef = useRef(null);
  const dataRef = useRef(null);

  const languageNames = [
    'French', 'English', 'Spanish', 'Chinese', 'Arabic', 'Latvian', 'Latin',
    'Gaelic', 'Italian', 'German', 'Portuguese', 'Japanese', 'Korean', 'Russian'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(true);
  
  const currentSong = recommendations[currentIndex];

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!songName.trim() || !selectedLanguage) {
      alert("Please enter a valid song name and select a language.");
      return;
    }
  
    setScrollLocked(false);
    handleFormSubmit(e);
    scrollToSection(recommendationsRef);
  };

  useEffect(() => {
    if (recommendations.length > 0 && trackMetadata[recommendations[currentIndex].name]) {
      const link = trackMetadata[recommendations[currentIndex].name].spotify_url;
      setSpotifyLink(link);
    }
  }, [currentIndex, recommendations, trackMetadata]);

  return (
    <div className="dashboard" ref={dashboardRef} style={{ scrollSnapType: 'y mandatory', overflowY: scrollLocked ? 'hidden' : 'scroll', height: '100vh' }}>
      {/* Search Section */}
      <div className="page-section search-section" ref={searchRef}>
        <div className="logo-container">
          <img src={logo} alt="App Logo" className="logo" />
        </div>
        <h2>
          Hello! I'm learning a new language.<br />
          Help me find songs I'd like in <LangComponent />.
        </h2>
        <p>
          Enter a song name and select a language to begin. You'll be shown one song at a time.<br />
          Pick and choose what you enjoy, and add new music to your playlist!
        </p>
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-row">
            {/* Song Search Component */}
            <SongSearch songName={songName} setSongName={setSongName} />
            {/* Language Selection Dropdown */}
            <select className="languages" value={selectedLanguage} onChange={handleLanguageChange} required>
              <option value="">Language</option>
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            <button type="submit" className="search-btn"><i className="fas fa-search"></i></button>
          </div>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>

      {/* Recommendations Section */}
      <div className="page-section recommendations-section" ref={recommendationsRef}>
        <h2>Here's Your <strong>Recommendation!</strong></h2>
        <p>
          Click the left arrow to swipe left and load the next recommendation.<br />
          If you like the song, click the right arrow to view the lyrics and data comparison!
        </p>
        <div className="recommendations-container">
          <div className="recommendations-box">
            <form onSubmit={handleFormSubmit} className="next-form">
              <button type="submit" className="swipe-left">
                <i className="fa-solid fa-left-long"></i><br />Swipe Left
              </button>
            </form>
          </div>
          <div className="recommendations-box-center">
            {loading ? (
              <p>Loading...</p>
            ) : (
              recommendations.length > 0 && (
                <RecommendationsList recommendations={recommendations} lyrics={lyrics} handleWordClick={handleWordClick} trackMetadata={trackMetadata}/>
              )
            )}
          </div>
          <div className="recommendations-box">
            <button
              className="swipe-right"
              onClick={() => {
                handleLikeSong(currentSong);
                console.log("Liked song:", currentSong);
                scrollToSection(dataRef);
              }}
            >
              <i className="fa-solid fa-right-long"></i><br />
              Swipe Right
            </button>
          </div>
        </div>
      </div>

      {/* Song Comparison Section */}
      <div className="page-section data-section" ref={dataRef}>
        <h2>That Sounds Familiar!<br />How Do They <strong>Compare?</strong></h2>
        <div className="emotional-chart-container">
          <div className="emotional-chart">
            <iframe
              src={`http://localhost:5000/static/selection_chart.html?${Date.now()}`}
              title="Emotion Plot 1"
              className="emotions-plot"
            />
          </div>
          <div className="emotional-chart">
            <iframe
              src={`http://localhost:5000/static/recommended_chart.html?${Date.now()}`}
              title="Emotion Plot 2"
              className="emotions-plot"
            />
          </div>
        </div>
        <div className="song-data-container">
          {recommendations.length > 0 && emotions?.songQualities && (
            <SongQualitiesComparison inputSongData={emotions.songQualities.input_song} comparedSongData={emotions.songQualities.recommended_song}/>
          )}
        </div>
      </div>

      {/* Lyrics Section */}
      <div className="page-section lyrics-section" ref={lyricsRef}>
        <div className="lyrics-title">
          <h2>And Here Are The <strong>Lyrics!</strong></h2>
          <p>
            Click the left arrow to swipe left and load the next recommendation.<br />
            If you like the song, click the right arrow to see the lyrics and data comparison!
          </p>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          recommendations.length > 0 && (
            <>
              {recommendations.map((song) => (
                <LyricsDisplay key={song.name} songName={song.name} lyrics={lyrics[song.name]}/>
              ))}
            </>
          )
        )}
        <button className="sidebar-btn back-to-top" onClick={() => scrollToSection(searchRef)}>Back to Top</button>
      </div>

      {/* Word Definition Popup */}
      {wordDefinition && clickedWord && (
        <WordDefinitionPopup word={clickedWord} definition={wordDefinition}/>
      )}
    </div>
  );
};

export default Dashboard;