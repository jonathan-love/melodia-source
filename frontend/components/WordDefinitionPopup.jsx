// Translation popup component

import React from 'react';

const WordDefinitionPopup = ({ word, definition }) => {
  return (
    <div className="definition-popup">
      <h4>Definition of "{word}":</h4>
      <p>{definition}</p>
    </div>
  );
};

export default WordDefinitionPopup;
