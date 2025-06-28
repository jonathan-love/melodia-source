// Rotating language component at homepage

import React, { useEffect, useState, useCallback } from 'react';

const names = ['French', 'English', 'Spanish', 'Chinese', 'Arabic', 'Latvian', 'Italian', 'German', 'Portuguese', 'Japanese', 'Korean', 'Russian'];

const LangComponent = () => {
  const [newName, setNewName] = useState("English");
  const [animateKey, setAnimateKey] = useState(0);

  const shuffle = useCallback(() => {
    const index = Math.floor(Math.random() * names.length);
    setNewName(names[index]);
    setAnimateKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const intervalID = setInterval(shuffle, 3000);
    return () => clearInterval(intervalID);
  }, [shuffle]);

  return (
    <span key={animateKey} className="animated-text" style={{ fontSize: '30px' }}>
      {newName}
    </span>
  );
};

export default LangComponent;