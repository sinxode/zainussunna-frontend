import React from "react";
import "../styles/Home.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useCountUp } from "../hooks/useCountUp";
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  School, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  MapPin,
  ChevronRight,
  GraduationCap
} from "lucide-react";

// --- Data Configuration ---

const featuresList = [
  {
    title: "Structured Mukhtasar based curriculum",
    icon: BookOpen,
    desc: "A systematic approach to learning core Islamic sciences through traditional texts."
  },
  {
    title: "Research-oriented teaching approach",
    icon: Search,
    desc: "Encouraging critical thinking and deep analysis in every subject of study."
  },
  {
    title: "Holistic student development",
    icon: Sparkles,
    desc: "Focusing on both academic brilliance and the spiritual growth of every learner."
  },
  {
    title: "Student-friendly learning environment",
    icon: School,
    desc: "Modern campus facilities designed to provide comfort and focus during study."
  },
];

const programsList = [
  {
    title: "Integrated Sharee'a",
    desc: "A well-rounded program covering Fiqh, Aqeedah, Seerah, and more, designed for comprehensive Islamic knowledge.",
    image: require("../assets/images/dars.jpg"),
  },
  {
    title: "Thahfeelul Qur'an",
    desc: "A focused Hifz program with emphasis on accuracy, discipline, and consistent revision.",
    image: require("../assets/images/hifl.jpg"),
  },
];

const tutorsList = [
  {
    name: "Zabair Sa-adi Al-Arshadi",
    role: "Director - Zainussunna Academy",
    image: require("../assets/images/zubair.png"),
  },
  {
    name: "Shihab Rahmani",
    role: "Asst. Instructor - Integrated Sharee'a",
    image: require("../assets/images/shihab.png"),
  },
  {
    name: "Hafiz Abdul Nasar Latheefi",
    role: "Lead Instructor - Qur'anic Studies",
    image: require("../assets/images/nasar.png"),
  },
];

function Home() {
  const navigate = useNavigate();

  // Animation refs
  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.1 });
  const [metricsRef, metricsVisible] = useScrollAnimation({ threshold: 0.2 });
  const [aboutRef, aboutVisible] = useScrollAnimation({ threshold: 0.2 });
  const [featuresRef, featuresVisible] = useScrollAnimation({ threshold: 0.2 });
  const [programsRef, programsVisible] = useScrollAnimation({ threshold: 0.2 });
  const [ctaRef, ctaVisible] = useScrollAnimation({ threshold: 0.2 });
  const [tutorsRef, tutorsVisible] = useScrollAnimation({ threshold: 0.2 });
  const [contactRef, contactVisible] = useScrollAnimation({ threshold: 0.2 });

  // Animated counters
  const studentsCount = useCountUp(50, { duration: 2500, startWhen: metricsVisible });
  const hifzCount = useCountUp(20, { duration: 2500, startWhen: metricsVisible });
  const facultyCount = useCountUp(8, { duration: 2500, startWhen: metricsVisible });
  const yearsCount = useCountUp(15, { duration: 2500, startWhen: metricsVisible });

  return (
    <main className="home-root">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className={`hero-wrapper ${heroVisible ? "animate-in" : ""}`} ref={heroRef}>
        <div className="hero-bg">
          <div className="hero-image-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <span className="overline animate-item delay-1">Empowering Future Scholars</span>
            <h1 className="animate-item delay-2">
              Shaping Minds through <br/> <span>Structured Islamic Education</span>
            </h1>
            <p className="animate-item delay-3">
              Zainussunna Academy is committed to delivering a structured, research-oriented Islamic curriculum designed for holistic student excellence and spiritual growth.
            </p>
            <div className="cta-group animate-item delay-4">
              <button onClick={() => navigate("/admissions")} className="btn btn-primary-invert">
                <span>Start Your Journey</span> <ChevronRight size={20} />
              </button>
              <button onClick={() => navigate("/about")} className="btn btn-secondary-invert">
                <span>Our Mission</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRICS (Overlapping) */}
      <section className={`metrics-section ${metricsVisible ? "animate-in" : ""}`} ref={metricsRef}>
        <div className="container">
          <div className="metrics-grid">
            <div className="metric animate-item delay-1">
              <div className="m-val">{studentsCount}+</div>
              <p>Successful Alumni</p>
            </div>
            <div className="metric animate-item delay-2">
              <div className="m-val">{hifzCount}+</div>
              <p>Hafiz Graduated</p>
            </div>
            <div className="metric animate-item delay-3">
              <div className="m-val">{facultyCount}+</div>
              <p>Expert Tutors</p>
            </div>
            <div className="metric animate-item delay-4">
              <div className="m-val">{yearsCount}+</div>
              <p>Years of Legacy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className={`section-about ${aboutVisible ? "animate-in" : ""}`} ref={aboutRef}>
        <div className="container">
          <div className="about-grid">
            <div className="about-image animate-item delay-1">
              <img src={require("../assets/images/IMG_0072.jpeg")} alt="Academy" />
              <div className="image-accent"></div>
            </div>
            <div className="about-text animate-item delay-2">
              <span className="overline">Legacy of Learning</span>
              <h2>Authentic Scholarship for the <br/> Modern Age</h2>
              <p>
                At Zainussunna Academy, we bridge the gap between traditional wisdom and contemporary needs. Our curriculum is designed to create well-rounded individuals who understand their heritage and are prepared for the future.
              </p>
              <ul className="points">
                <li><Sparkles size={18} /> Deep Rooted Spiritual Mentorship</li>
                <li><Sparkles size={18} /> Research Based Academic Excellence</li>
              </ul>
              <button className="btn btn-primary" onClick={() => navigate("/about")}>
                <span>Discover Our Story</span> <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className={`section-features ${featuresVisible ? "animate-in" : ""}`} ref={featuresRef}>
        <div className="container">
          <div className="section-header text-center">
            <span className="overline">Excellence</span>
            <h2>Why Choose Zainussunna</h2>
            <p>Our commitment to quality education is reflected in every aspect of our academy.</p>
          </div>
          <div className="features-grid">
            {featuresList.map((item, index) => (
              <div 
                key={index} 
                className={`feature-card animate-item delay-${index + 1}`}
              >
                <div className="icon-box">
                  <item.icon size={32} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROGRAMS SECTION */}
      <section className={`section-programs ${programsVisible ? "animate-in" : ""}`} ref={programsRef}>
        <div className="container">
          <div className="section-header">
            <span className="overline">Curriculum</span>
            <h2>Our Academic Paths</h2>
          </div>
          <div className="programs-grid">
            {programsList.map((prog, index) => (
              <div key={index} className={`program-card animate-item delay-${index + 1}`}>
                <div className="image-box">
                  <img src={prog.image} alt={prog.title} />
                </div>
                <div className="card-body">
                  <h3>{prog.title}</h3>
                  <p>{prog.desc}</p>
                  <button className="btn-text" onClick={() => navigate("/programs")}>
                    Program Details <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className={`section-cta ${ctaVisible ? "animate-in" : ""}`} ref={ctaRef}>
        <div className="container">
          <div className="cta-modern-box">
            <div className="cta-glow-orb"></div>
            <div className="cta-content">
              <span className="overline">Begin Your Journey</span>
              <h2>Join Our Scholarly Tradition</h2>
              <p>Admissions are now open for the upcoming academic session. Take the first step towards excellence.</p>
              <div className="cta-actions">
                <button onClick={() => navigate("/admissions")} className="btn btn-primary">
                  <span>Apply for Admission</span> <ChevronRight size={20} />
                </button>
                <button onClick={() => navigate("/programs")} className="btn btn-secondary">
                  <span>Explore Curriculum</span>
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

      {/* 7. TUTORS SECTION */}
      <section className={`section-tutors ${tutorsVisible ? "animate-in" : ""}`} ref={tutorsRef}>
        <div className="container">
          <div className="tutors-modern-layout">
            <div className="tutors-text">
              <span className="overline">Mentorship</span>
              <h2>Our Distinguished Faculty</h2>
              <p>Learn from highly qualified and responsible educators committed to disciplined teaching and scholarly mentorship.</p>
              <button className="btn btn-secondary" onClick={() => navigate("/faculty")}>
                <span>Meet Entire Faculty</span> <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            </div>
            
            <div className="tutors-grid">
              {tutorsList.map((tutor, index) => (
                <div key={index} className={`tutor-card animate-item delay-${index+1}`}>
                  <div className="photo-circle">
                    <img src={tutor.image} alt={tutor.name} />
                  </div>
                  <h3>{tutor.name}</h3>
                  <p className="role">{tutor.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT STRIP */}
      <section className={`contact-bar ${contactVisible ? "animate-in" : ""}`} ref={contactRef}>
        <div className="container">
          <div className="bar-grid">
            <a href="tel:+919037601403" className="bar-item">
              <div className="icon-wrap"><Phone size={24} /></div>
              <div><span>Call Us</span><p>+91 90376 01403</p></div>
            </a>
            <a href="https://wa.me/919037601403" target="_blank" rel="noreferrer" className="bar-item highlight">
              <div className="icon-wrap"><MessageCircle size={24} /></div>
              <div><span>WhatsApp</span><p>Message Now</p></div>
            </a>
            <a href="https://maps.app.goo.gl/tcLKkQi1e9d59TS7A" target="_blank" rel="noreferrer" className="bar-item">
              <div className="icon-wrap"><MapPin size={24} /></div>
              <div><span>Location</span><p>Vadakkekkad</p></div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Home;
