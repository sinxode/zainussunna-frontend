import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/NotFound.scss';

const NotFound = () => {
  return (
    <>
      <Navbar />
      <main className="not-found-page">
        <div className="container">
          <div className="not-found-card">
            <div className="icon-wrapper">
              <Compass size={80} className="not-found-icon" />
            </div>
            <h1>404</h1>
            <h2>Path Not Found</h2>
            <p>
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable. Let's get you back on track.
            </p>
            <div className="not-found-actions">
              <Link to="/" className="btn btn-primary">
                <Home size={18} style={{ marginRight: '8px' }} />
                <span>Back to Home</span>
              </Link>
              <button className="btn btn-secondary" onClick={() => window.history.back()}>
                <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
