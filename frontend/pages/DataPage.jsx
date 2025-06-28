// Relevant data visualisations page (PCA, etc)

import React from "react";

const DataPage = () => {
  return (
    <div className="data-page">
      <h2>View Data About the <strong>Stored Songs</strong></h2>
      <div className="data-box">
        <h3>Clusters and PCA Visualisation</h3>
        <iframe src="http://localhost:5000/static/pca_plot.html" title="PCA Plot" class="pca-plot"></iframe>
      </div>
      <div className='data-box'>
        <h3>Database Language Distribution</h3>
        <iframe src={`http://localhost:5000/static/language_pie.html?${Date.now()}`} title="Emotion Plot 1" className="emotions-plot"/>
      </div>
      <div className='data-box'>
      <h3>Histogram (Distribution of Duration by Language)</h3>
        <iframe src={`http://localhost:5000/static/histogram.html?${Date.now()}`} title="Emotion Plot 1" className="emotions-plot"/>
      </div>
    </div>
  );
};

export default DataPage;
