import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import "../styles/Intro.scss";

function Intro({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="intro-overlay">
      <div className="intro-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle p-${i+1}`}></div>
        ))}
      </div>
      
      <div className="intro-content">
        <div className="logo-reveal">
          <Sparkles className="sparkle-icon" size={40} />
        </div>
        <h1 className="intro-title">Zainussunna</h1>
        <p className="intro-subtitle">Academy Of Integrated Studies</p>
        <div className="intro-line"></div>
      </div>
    </div>
  );
}

export default Intro;
