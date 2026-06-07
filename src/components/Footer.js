import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Send, MapPin, Phone, Mail } from "lucide-react";
import "../styles/Footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Main Content Area */}
        <div className="footer-main">
          {/* Brand Section - Centered Logo and Name */}
          <div className="footer-brand">
            <div className="brand-header">
              <Link to="/">
                <img src={require("../assets/logos/logo.png")} alt="Zainussunna Academy" className="brand-logo" />
                <div className="brand-text">
                  <h2>Zainussunna Academy</h2>
                  <h3>Academy Of Integrated Studies</h3>
                </div>
              </Link>
            </div>
            <p className="brand-description">
              Nurturing authentic Islamic scholarship through structured learning 
              and scholarly mentorship. Shaping the scholars of tomorrow.
            </p>
            <div className="social-links">
              <a href="https://facebook.com/zainussunna_academy" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={20} strokeWidth={1.5} />
              </a>
              <a href="https://instagram.com/zainussunna_academy" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a href="https://youtube.com/@zainussunnamedia" target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Middle Row - Explore and Get in Touch in 2-column layout */}
          <div className="footer-info-row">
            <div className="footer-links">
              <h4>Explore</h4>
              <ul>
                <li><Link to="/about">About Academy</Link></li>
                <li><Link to="/programs">Academic Programs</Link></li>
                <li><Link to="/faculty">Our Faculty</Link></li>
                <li><Link to="/admissions">Admissions</Link></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4>Get in Touch</h4>
              <ul className="contact-list">
                <li>
                  <MapPin size={18} className="contact-icon" />
                  <span>Vadakkekkad, Thrissur, Kerala</span>
                </li>
                <li>
                  <Phone size={18} className="contact-icon" />
                  <a href="tel:+919037601403">+91 90376 01403</a>
                </li>
                <li>
                  <Mail size={18} className="contact-icon" />
                  <a href="mailto:info@zainussunna.com">info@zainussunna.com</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Subscribe for the latest news and academic updates.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-wrapper">
                <input type="email" placeholder="Enter your email" required />
                <button type="submit" aria-label="Subscribe">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Section - Legal */}
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Zainussunna Academy. All rights reserved.
          </p>
          <div className="legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span className="separator"></span>
            <Link to="/terms-conditions">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
