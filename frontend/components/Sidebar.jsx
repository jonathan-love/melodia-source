// Sidebar component

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logomini from '../assets/images/logo-mini.png';

const Sidebar = ({ songName, spotifyLink, dashboardRef }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [scrollLocked, setScrollLocked] = useState(true);

  const toggleSidebar = () => setIsOpen(prevState => !prevState);

  const navigate = useNavigate();

  const goHome = () => {
    if (dashboardRef?.current) {
      dashboardRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Open Spotify link (if available)
  const openSpotifyLink = () => {
    if (spotifyLink) {
      window.open(spotifyLink, "_blank");
    } else {
      console.error("No Spotify link available.");
    }
  };

  const handleExportCSV = () => {
    window.open("http://localhost:5000/export-liked-songs", "_blank");
  };

  const handleClearLikedSongs = async () => {
    try {
      await axios.post("http://localhost:5000/clear-liked-songs");
      console.log("Liked songs cleared.");
    } catch (err) {
      console.error("Failed to clear liked songs:", err);
    }
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <button onClick={toggleSidebar} className="sidebar-toggle-btn"><i className="fa-solid fa-bars"></i></button>

        <div className="logo-mini-container">
          <img src={logomini} alt="Mini Logo" className="logo-mini" />
        </div>

        <div className="sidebar-submenu">
          <h3>Navigation</h3>
          <Link to="/">
            <button className="sidebar-btn" onClick={goHome}><i className="fas fa-home"></i> Home</button>
          </Link>
          <Link to="pages/data">
            <button className="sidebar-btn"><i className="fas fa-chart-line"></i> Analytics</button>
          </Link>
          <Link to="pages/info">
            <button className="sidebar-btn"><i className="fas fa-question-circle"></i> Information</button>
          </Link>
          <Link to="pages/songs">
            <button className="sidebar-btn"><i className="fas fa-database"></i> Database</button>
          </Link>
        </div>

        <div className="sidebar-submenu">
          <h3>Save & Export</h3>
          <Link to="pages/liked">
            <button className="sidebar-btn"><i className="fas fa-heart"></i> Liked Songs</button>
          </Link>
          <button className="sidebar-btn" onClick={handleExportCSV}><i className="fas fa-file-csv"></i> Export 'Liked' to CSV</button>
        </div>

        <div className="sidebar-submenu">
          <h3>Settings</h3>
          <button className="sidebar-btn" onClick={() => window.location.reload()}><i className="fas fa-trash-alt"></i> Reload Session</button>
          <button className="sidebar-btn" onClick={handleClearLikedSongs}><i className="fas fa-heart-crack"></i> Clear Liked Songs</button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
