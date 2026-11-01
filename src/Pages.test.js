import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import About from "./pages/About";
import Achievements from "./pages/Achievements";
import Gallery from "./pages/Gallery";

// Mock IntersectionObserver
beforeAll(() => {
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(element) {
      this.callback([{ isIntersecting: true, target: element }]);
    }
    unobserve() {}
    disconnect() {}
  };
});

test("renders About without crashing", () => {
  render(
    <Router>
      <About />
    </Router>
  );
});

test("renders Achievements without crashing", () => {
  render(
    <Router>
      <Achievements />
    </Router>
  );
});

test("renders Gallery without crashing", () => {
  render(
    <Router>
      <Gallery />
    </Router>
  );
});
