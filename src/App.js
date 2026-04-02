import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Intro from "./pages/Intro";
import Home from "./pages/Home";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Achievements from "./pages/Achievements";
import Gallery from "./pages/Gallery";
import Admissions from "./pages/Admissions";
import Contact from "./pages/Contact";
import Faculty from "./pages/Faculty";
import Legal from "./pages/Legal";
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("hasSeenIntro");
    if (!hasSeen) {
      setShowIntro(true);
      sessionStorage.setItem("hasSeenIntro", "true");
    } else {
      setIntroCompleted(true);
    }
    setLoading(false);
  }, []);

  const handleIntroDone = () => {
    setShowIntro(false);
    setIntroCompleted(true);
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {showIntro && <Intro onDone={handleIntroDone} />}
      {!showIntro && (
        <Router>
          <ScrollToTop />
          <Routes>
            <Route
              path="/"
              element={
                <Home key={introCompleted ? "home-viewed" : "home-first"} />
              }
            />
            <Route path="/intro" element={<Intro onDone={() => {}} />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route
              path="/privacy-policy"
              element={<Legal slug="privacy-policy" />}
            />
            <Route
              path="/terms-conditions"
              element={<Legal slug="terms-conditions" />}
            />
            <Route
              path="/refund-policy"
              element={<Legal slug="refund-policy" />}
            />
            <Route
              path="/shipping-policy"
              element={<Legal slug="shipping-policy" />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
