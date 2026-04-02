import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/About.scss";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useCountUp } from "../hooks/useCountUp";
import { 
  BookOpen, 
  Target, 
  Sparkles, 
  Users, 
  ChevronRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  History,
  Compass,
  ArrowUpRight
} from "lucide-react";

function About() {
  const [activeTab, setActiveTab] = useState("story");
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation refs
  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.05 });
  const [statsRef, statsVisible] = useScrollAnimation({ threshold: 0.05 });
  const [storyRef, storyVisible] = useScrollAnimation({ threshold: 0.05 });
  const [valuesRef, valuesVisible] = useScrollAnimation({ threshold: 0.05 });
  const [galleryRef, galleryVisible] = useScrollAnimation({ threshold: 0.05 });
  const [ctaRef, ctaVisible] = useScrollAnimation({ threshold: 0.05 });

  // Animated counters
  const yearsCount = useCountUp(15, { duration: 2000, startWhen: statsVisible });
  const alumniCount = useCountUp(50, { duration: 2000, startWhen: statsVisible });
  const hafizCount = useCountUp(10, { duration: 2000, startWhen: statsVisible });
  const facultyCount = useCountUp(8, { duration: 2000, startWhen: statsVisible });

  const stats = [
    { number: `${yearsCount}+`, label: "Years of Excellence", desc: "Of academic excellence" },
    { number: `${alumniCount}+`, label: "Students Graduated", desc: "Serving the community" },
    { number: `${hafizCount}+`, label: "Huffal", desc: "Preserving the Qur'an" },
    { number: `${facultyCount}+`, label: "Expert Faculty", desc: "Providing mentorship" },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: "Authentic Knowledge",
      description:
        "A steadfast commitment to classical Islamic scholarship, maintaining strict fidelity to primary sources and traditional methodology.",
    },
    {
      icon: Zap,
      title: "Academic Discipline",
      description:
        "Fostering a structured learning environment that encourages consistency, deep study, intellectual rigor, and daily focus.",
    },
    {
      icon: Sparkles,
      title: "Character Building",
      description:
        "Providing holistic spiritual mentorship to shape moral integrity, humility, righteousness, and beautiful etiquettes.",
    },
    {
      icon: Users,
      title: "Community Impact",
      description:
        "Preparing mature, responsible scholars who are equipped to guide, inspire, and serve the global Ummah effectively.",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="About-page">
        {/* Header Section */}
        <section className={`about-header ${heroVisible ? "animate-in" : ""}`} ref={heroRef}>
          <div className="hero-bg">
            <div className="hero-grid-pattern"></div>
            <div className="hero-glow-orb-1"></div>
            <div className="hero-glow-orb-2"></div>
          </div>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1">
              <a href="/">Home</a> <span>/</span> <span>About</span>
            </div>
            <h1 className="animate-item delay-2">Our Mission & Legacy</h1>
            <p className="animate-item delay-3">
              Nurturing minds, building character, and preserving authentic
              Islamic scholarship for the next generation of global leaders.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`stats-section ${statsVisible ? "animate-in" : ""}`} ref={statsRef}>
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div className={`stat-card animate-item delay-${index + 1}`} key={index}>
                  <div className="stat-card-glow"></div>
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-desc">{stat.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Tabs Section */}
        <section className={`story-section ${storyVisible ? "animate-in" : ""}`} ref={storyRef}>
          <div className="container">
            <div className="section-header animate-item delay-1">
              <span className="overline">Our Journey</span>
              <h2>A Legacy of Scholarly Learning</h2>
              <p>Explore the history, core driving forces, and methodology that define our academy.</p>
            </div>

            <div className="story-tabs-wrapper animate-item delay-2">
              <div className="story-tabs">
                <button
                  className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
                  onClick={() => setActiveTab("story")}
                >
                  <History size={18} />
                  <span>Our Story</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === "mission" ? "active" : ""}`}
                  onClick={() => setActiveTab("mission")}
                >
                  <Target size={18} />
                  <span>Mission & Vision</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === "approach" ? "active" : ""}`}
                  onClick={() => setActiveTab("approach")}
                >
                  <Compass size={18} />
                  <span>Our Approach</span>
                </button>
              </div>
            </div>

            <div className="story-content animate-item delay-3">
              {activeTab === "story" && (
                <div className="story-panel">
                  <div className="story-image">
                    <img
                      src={require("../assets/images/IMG_0072.jpeg")}
                      alt="Zainussunna Academy Campus Dars"
                    />
                    <div className="image-overlay-glow"></div>
                    <div className="image-border-decor"></div>
                  </div>
                  <div className="story-text">
                    <span className="panel-tag">Est. 2011</span>
                    <h3>A Tradition of Sacred Knowledge</h3>
                    <p>
                      Zainussunna Academy was established to fill a crucial need:
                      providing a structured, rigorous, and authentic Islamic education program 
                      combining traditional classical learning with contemporary intellectual competence.
                    </p>
                    <p>
                      Our campus serves as a modern dars, an oasis of spiritual and intellectual growth, 
                      where students engage directly with primary text mukhtasars in Fiqh, Aqeedah, Seerah, 
                      and Arabic Grammar under direct, regular mentorship of qualified scholars.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "mission" && (
                <div className="mission-panel">
                  <div className="mission-card">
                    <div className="mission-icon">
                      <BookOpen size={30} />
                    </div>
                    <h3>Our Mission</h3>
                    <p>
                      To deliver high-caliber, structured Islamic education that shapes 
                      knowledgeable, spiritually mature, and socially responsible leaders, 
                      instilling authentic classical scholarship and rigorous academic discipline.
                    </p>
                  </div>
                  <div className="mission-card">
                    <div className="mission-icon">
                      <Target size={30} />
                    </div>
                    <h3>Our Vision</h3>
                    <p>
                      To be a premier global center for authentic Islamic learning, recognized 
                      internationally for outstanding academic scholarship, moral excellence, 
                      and graduates who guide and uplift the Ummah.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "approach" && (
                <div className="approach-panel">
                  <div className="approach-grid">
                    <div className="approach-item">
                      <span className="approach-number">01</span>
                      <h4>Classical Foundation</h4>
                      <p>Rigorous study of primary classical texts (Mukhtasars) to build a solid intellectual foundation.</p>
                    </div>
                    <div className="approach-item">
                      <span className="approach-number">02</span>
                      <h4>Research Mindset</h4>
                      <p>Encouraging critical thinking, analytical textual review, and comparative analysis of classical works.</p>
                    </div>
                    <div className="approach-item">
                      <span className="approach-number">03</span>
                      <h4>Practical Application</h4>
                      <p>Connecting traditional rules and rulings with modern contexts, community service, and active leadership.</p>
                    </div>
                    <div className="approach-item">
                      <span className="approach-number">04</span>
                      <h4>Spiritual Mentorship</h4>
                      <p>Close personal guidance (Tarbiyah) by senior Ustads to build character, humbleness, and work ethics.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={`values-section ${valuesVisible ? "animate-in" : ""}`} ref={valuesRef}>
          <div className="container">
            <div className="section-header animate-item delay-1">
              <span className="overline">Core Principles</span>
              <h2>Pillars of Our Academy</h2>
              <p>These values serve as the compass for our administration, teachers, and students daily.</p>
            </div>
            <div className="values-grid">
              {values.map((value, index) => (
                <div className={`value-card animate-item delay-${index + 1}`} key={index}>
                  <div className="value-card-glow"></div>
                  <div className="value-icon-wrapper">
                    <value.icon size={28} />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className={`gallery-section ${galleryVisible ? "animate-in" : ""}`} ref={galleryRef}>
          <div className="container">
            <div className="section-header animate-item delay-1">
              <div className="header-left">
                <span className="overline">Environment</span>
                <h2>Campus Life</h2>
                <p>Take a visual tour inside our study halls, classrooms, and student life activities.</p>
              </div>
              <div className="header-right">
                <button className="btn btn-secondary" onClick={() => navigate("/gallery")}>
                  <span>View Full Gallery</span>
                  <ArrowUpRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>
            <div className="gallery-grid animate-item delay-2">
              <div className="gallery-item large">
                <img src={require("../assets/images/IMG_0072.jpeg")} alt="Campus Study Dars" />
                <div className="item-overlay"><span>Campus Study Session</span></div>
              </div>
              <div className="gallery-item">
                <img src={require("../assets/images/IMG_0097.jpeg")} alt="Classroom Instruction" />
                <div className="item-overlay"><span>Classroom Lectures</span></div>
              </div>
              <div className="gallery-item">
                <img src={require("../assets/images/IMG_0113.jpeg")} alt="Students Assembled" />
                <div className="item-overlay"><span>Student Assemblies</span></div>
              </div>
              <div className="gallery-item">
                <img src={require("../assets/images/IMG_0122.jpeg")} alt="Classical Library Study" />
                <div className="item-overlay"><span>Classical Texts Library</span></div>
              </div>
              <div className="gallery-item">
                <img src={require("../assets/images/IMG_0130.jpeg")} alt="Student Activities" />
                <div className="item-overlay"><span>Recreational Activities</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`section-cta ${ctaVisible ? "animate-in" : ""}`} ref={ctaRef}>
          <div className="container">
            <div className="cta-modern-box">
              <div className="cta-glow-orb"></div>
              <div className="cta-content">
                <span className="overline">Begin Your Journey</span>
                <h2>Join Our Scholarly Tradition</h2>
                <p>
                  Admissions are now open for the upcoming academic session. Connect with authentic 
                  Islamic legacy and shape your future today.
                </p>
                <div className="cta-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/admissions")}
                  >
                    <span>Start Your Application</span>
                    <ChevronRight size={20} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/programs")}
                  >
                    <span>Explore Programs</span>
                  </button>
                </div>
              </div>
              <div className="cta-visual">
                <div className="visual-graphic">
                  <div className="circle-1"></div>
                  <div className="circle-2"></div>
                  <GraduationCap size={80} className="cta-icon" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default About;
