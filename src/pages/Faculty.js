import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { api } from "../services/api";
import "../styles/Faculty.scss";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { Users } from "lucide-react";

function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1 });
  const [gridRef, gridVisible] = useScrollAnimation({ threshold: 0.15 });

  useEffect(() => {
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
        <section className={`faculty-header ${headerVisible ? "animate-in" : ""}`} ref={headerRef}>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1">
              <a href="/">Home</a> <span>/</span> <span>Faculty</span>
            </div>
            <span className="overline animate-item delay-2">Our Faculty</span>
            <h2 className="animate-item delay-3">Qualified and Responsible Educators</h2>
            <p className="animate-item delay-4">
              Our faculty members are committed to disciplined teaching,
              conceptual clarity, and scholarly mentorship.
            </p>
          </div>
        </section>

        <section className={`container ${gridVisible ? "animate-in" : ""}`} ref={gridRef}>
          {error && <div className="error-message" style={{ textAlign: 'center', color: 'red', padding: '40px' }}>{error}</div>}

          <div className="faculty-grid">
            {facultyList.length > 0 ? (
              facultyList.map((faculty, index) => (
                <div key={faculty.id || index} className={`faculty-card animate-item delay-${(index % 3) + 1}`}>
                  <div className="photo">
                    <img
                      src={faculty.photo || require("../assets/images/nasar.png")}
                      alt={faculty.name}
                    />
                  </div>

                  <div className="info">
                    <h3>{faculty.name}</h3>
                    <p className="role">{faculty.role}</p>
                    <p className="specialization">{faculty.qualification}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '100px 0' }}>
                <Users size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                <p>No faculty records found.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Faculty;
