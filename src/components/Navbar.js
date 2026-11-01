import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home,
  BookOpen,
  Award,
  Image,
  GraduationCap,
  Phone,
  Info,
  MessageCircle,
  ArrowRight,
  Menu,
  X
} from "lucide-react";

import "../styles/Navbar.scss";

function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Programs", path: "/programs", icon: BookOpen },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Gallery", path: "/gallery", icon: Image },
    { name: "Admissions", path: "/admissions", icon: GraduationCap },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <div className="container">
        <div className="logo" onClick={() => navigate("/")}>
          <img src={require("../assets/logos/logo.png")} alt="Logo" />
          <div className="academy-name">
            <h1>Zainussunna</h1>
            <h2>Academy</h2>
          </div>
        </div>

        <nav className="nav-menu">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  className={`nav-a ${
                    item.path === "/" 
                      ? location.pathname === "/" 
                      : location.pathname.startsWith(item.path) 
                        ? "active" 
                        : ""
                  }`}
                  to={item.path}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button className="btn btn-primary desktop-only" onClick={() => navigate("/admissions")}>
          <span>Enquire Now</span>
          <ArrowRight size={18} style={{ marginLeft: '8px' }} />
        </button>

        <button
          className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
        </button>
      </div>

      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}></div>

      <div className={`mobile-menu-panel ${mobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <div className="logo" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>
            <img src={require("../assets/logos/logo.png")} alt="Logo" />
            <div className="academy-name">
              <h1>Zainussunna</h1>
              <h2>Academy</h2>
            </div>
          </div>
          <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
        <nav className="mobile-nav">
          <ul>
            {navItems.map((item, index) => (
              <li 
                key={item.path} 
                style={{ 
                  transitionDelay: mobileMenuOpen ? `${index * 50 + 100}ms` : "0ms",
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? "translateX(0)" : "translateX(20px)"
                }}
              >
                <Link
                  className={`nav-a ${
                    item.path === "/" 
                      ? location.pathname === "/" 
                      : location.pathname.startsWith(item.path) 
                        ? "active" 
                        : ""
                  }`}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon size={22} className="nav-icon" strokeWidth={1.5} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu-footer" style={{ 
          transitionDelay: mobileMenuOpen ? "500ms" : "0ms",
          opacity: mobileMenuOpen ? 1 : 0,
          transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)"
        }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { navigate("/admissions"); setMobileMenuOpen(false); }}>
            <MessageCircle size={20} style={{ marginRight: '10px' }} strokeWidth={1.5} />
            <span>Enquire Now</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
