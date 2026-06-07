import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { api } from "../services/api";
import "../styles/Faculty.scss";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { Users, GraduationCap, Award, BookOpen } from "lucide-react";

function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1 });
  const [gridRef, gridVisible] = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const data = await api.getFaculty();
        if (data.results) {
          setFacultyList(data.results);
        } else if (Array.isArray(data)) {
          setFacultyList(data);
        }
        setError(null);
      } catch (err) {
        setError("Failed to load faculty. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Introducing our Faculty..." />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="faculty-page">
        {/* 1. MODERN HERO SECTION */}
        <section className={`faculty-hero ${headerVisible ? "animate-in" : ""}`} ref={headerRef}>
          <div className="hero-bg">
            <div className="hero-grid-pattern"></div>
            <div className="hero-glow-orb-1"></div>
            <div className="hero-glow-orb-2"></div>
          </div>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1">
              <a href="/">Home</a> <span>/</span> <span>Faculty</span>
            </div>
            <h1 className="animate-item delay-3">Our Distinguished Faculty</h1>
            <p className="animate-item delay-4">
              Learn from highly qualified and responsible educators committed to 
              disciplined teaching, conceptual clarity, and scholarly mentorship.
            </p>
          </div>
        </section>

        {/* 2. FACULTY LISTING */}
        <section className={`faculty-listing-section ${gridVisible ? "animate-in" : ""}`} ref={gridRef}>
          <div className="container">
            <div className="section-header text-center animate-item delay-1">
              <span className="overline">Academic Leaders</span>
              <h2>Preserving Scholarly Tradition</h2>
              <p>Our instructors bring years of expertise in classical Islamic sciences and modern research methodologies.</p>
            </div>

            {error && <div className="error-message animate-item">{error}</div>}

            <div className="faculty-grid">
              {facultyList.length > 0 ? (
                facultyList.map((faculty, index) => (
                  <div 
                    key={faculty.id || index} 
                    className={`faculty-modern-card animate-item delay-${(index % 4) + 1}`}
                  >
                    <div className="card-inner">
                      <div className="photo-container">
                        <img
                          src={faculty.photo || require("../assets/images/nasar.png")}
                          alt={faculty.name}
                        />
                        <div className="photo-overlay">
                          <div className="overlay-icons">
                            <BookOpen size={18} />
                            <Award size={18} />
                          </div>
                        </div>
                        <div className="photo-accent"></div>
                      </div>

                      <div className="info-box">
                        <span className="faculty-role">{faculty.role}</span>
                        <h3>{faculty.name}</h3>
                        <div className="qualification-wrap">
                          <GraduationCap size={16} />
                          <p>{faculty.qualification}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state animate-item delay-2">
                  <Users size={64} />
                  <h3>No Faculty Records</h3>
                  <p>We are currently updating our faculty directory. Please check back soon.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Faculty;
