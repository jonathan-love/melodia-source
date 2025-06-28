// Information about the project (same as README file)

import React, { useState, useEffect } from "react";

const InfoPage = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("info.txt")
      .then((data) => setText(data))
      .catch((err) => console.error("Failed to load file:", err));
  }, []);

  return (
    <div className='info-page'>
      <h2>Project <strong>README</strong> content</h2>
      <pre>{text}</pre>
    </div>
  );
};

export default InfoPage;
