import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import "../styles/Achievements.scss";
import api from "../services/api";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  Inbox
} from "lucide-react";

const PER_PAGE = 6;

function Achievements() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.05 });
  const [statsRef, statsVisible] = useScrollAnimation({ threshold: 0.05 });
  const [filterRef, filterVisible] = useScrollAnimation({ threshold: 0.05 });
  const [gridRef, gridVisible] = useScrollAnimation({ threshold: 0.05 });
  const [featuredRef, featuredVisible] = useScrollAnimation({ threshold: 0.05 });

  const filteredAchievements =
    filter === "all"
      ? achievements
      : achievements.filter(
          (item) =>
            (item.category || "academic").toLowerCase() ===
            filter.toLowerCase(),
        );

  const totalPages =
    filteredAchievements.length > 0
      ? Math.ceil(filteredAchievements.length / PER_PAGE)
      : 1;
  const start = (page - 1) * PER_PAGE;
  const items = filteredAchievements.slice(start, start + PER_PAGE);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const data = await api.getAchievements();
        const results = (data.results || data || []).map(item => ({
          ...item,
          image: api.getImageUrl(item.image || item.images)
        }));
        if (results.length === 0) {
          throw new Error("No achievements found");
        }
        setAchievements(results);
      } catch (err) {
        console.error("Error fetching achievements, loading fallbacks:", err);
        const fallbackAchievements = [
          {
            id: 1,
            title: "First Rank in State Level Quran Recitation",
            description: "Our student secured the prestigious first rank in the state level Quran recitation competition held in Calicut.",
            category: "competition",
            image: require("../assets/images/achievements1.jpeg"),
            date: "2024-03"
          },
          {
            id: 2,
            title: "100% Pass Rate in Classical Fiqh Board Exams",
            description: "Our graduating class achieved a perfect 100% pass rate in the final centralized board examinations for classical Fiqh studies.",
            category: "academic",
            image: require("../assets/images/achievements2.jpeg"),
            date: "2024-02"
          },
          {
            id: 3,
            title: "5 New Huffaz Graduated This Term",
            description: "We are blessed to announce that five of our Thahfeel-ul-Qur'an students successfully completed their Qur'an memorization.",
            category: "hifz",
            image: require("../assets/images/achievements3.jpeg"),
            date: "2024-01"
          },
          {
            id: 4,
            title: "Excellence in Arabic Language & Grammar Contest",
            description: "Students representing Zainussunna Academy won top positions in the regional Arabic Grammar and translation symposium.",
            category: "competition",
            image: require("../assets/images/achievements1.jpeg"),
            date: "2023-11"
          },
          {
            id: 5,
            title: "Traditional Dars Graduation (Sanad Ceremony)",
            description: "Graduation of our classical Sharee'a track students receiving their traditional teaching licenses (Sanads).",
            category: "academic",
            image: require("../assets/images/achievements2.jpeg"),
            date: "2023-10"
          },
          {
            id: 6,
            title: "Successful Quran Retention Assessment",
            description: "All Thahfeez track students passed the strict retention assessment with high marks, showcasing high revision accuracy.",
            category: "hifz",
            image: require("../assets/images/achievements3.jpeg"),
            date: "2023-08"
          }
        ];
        setAchievements(fallbackAchievements);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const stats = [
    { number: "50+", label: "Graduates" },
    { number: "20+", label: "Huffaz" },
    { number: "18+", label: "Years" },
    { number: "100%", label: "Success" },
  ];

  const categories = [
    { id: "all", label: "All Achievements" },
    { id: "academic", label: "Academic" },
    { id: "hifz", label: "Hifz" },
    { id: "competition", label: "Competitions" },
  ];

  if (loading) {
    return <Loading message="Fetching Achievements..." />;
  }

  return (
    <>
      <Navbar />

      <main className="achievements-page">
        {/* Header Section */}
        <section className={`achievements-header ${headerVisible ? "animate-in" : ""}`} ref={headerRef}>
          <div className="hero-bg">
            <div className="hero-grid-pattern"></div>
            <div className="hero-glow-orb-1"></div>
            <div className="hero-glow-orb-2"></div>
          </div>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1">
              <a href="/">Home</a> <span>/</span> <span className="active">Achievements</span>
            </div>
            <h1 className="animate-item delay-2">Our Milestones</h1>
            <p className="animate-item delay-3"> Celebrating the academic brilliance and spiritual growth of our dedicated students.</p>
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className={`filter-section ${filterVisible ? "animate-in" : ""}`} ref={filterRef}>
          <div className="container">
            <div className="filter-tabs animate-item delay-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${filter === cat.id ? "active" : ""}`}
                  onClick={() => {
                    setFilter(cat.id);
                    setPage(1);
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements Grid */}
        <section className={`achievements-content ${gridVisible ? "animate-in" : ""}`} ref={gridRef}>
          <div className="container">
            <div className="achievements-grid">
              {items.map((item, i) => (
                <div
                  key={item.id || i}
                  className={`achievement-card animate-item delay-${(i % 3) + 1}`}
                  onClick={() => setActive(item)}
                >
                  <div className="card-image">
                    <img
                      src={item.image || require("../assets/images/achievements1.jpeg")}
                      alt={item.title}
                    />
                  </div>
                  <div className="card-content">
                    <span className="card-category">
                      {item.category || "Academic"}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.description?.substring(0, 80)}...</p>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="no-data" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '100px 0' }}>
                  <Inbox size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                  <p>No achievements found in this category.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredAchievements.length > PER_PAGE && (
              <div className="pagination animate-item delay-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="page-btn"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={page === i + 1 ? "paginator-button active" : "paginator-button"}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="page-btn"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Featured Achievement */}
        <section className={`featured-section ${featuredVisible ? "animate-in" : ""}`} ref={featuredRef}>
          <div className="container">
            <div className="featured-content">
              <div className="featured-text animate-item delay-1">
                <span className="featured-label">Excellence Spotlight</span>
                <h2>Distinguished Hifz Mastery</h2>
                <p>
                  Our Thahfeel-ul-Qur'an program sets a benchmark in accuracy and spiritual dedication. 
                </p>
                <ul className="achievement-list">
                  <li>Structured 3-Year Intensive Track</li>
                  <li>Advanced Tajweed Certification</li>
                  <li>Regular Retention Bootcamps</li>
                  <li>Direct Scholarly Mentorship</li>
                </ul>
              </div>
              <div className="featured-image animate-item delay-2">
                <img
                  src={require("../assets/images/hifl.jpg")}
                  alt="Hifz Program"
                />
                <div className="image-badge">
                  <span className="badge-number">20+</span>
                  <span className="badge-text">Huffaz</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modal */}
        {active && (
          <div className="modal-overlay" onClick={() => setActive(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setActive(null)}>
                <X size={20} />
              </button>
              <div className="modal-image">
                <img
                  src={active.image || require("../assets/images/achievements1.jpeg")}
                  alt={active.title}
                />
              </div>
              <div className="modal-content">
                <span className="modal-category">Distinction</span>
                <h2>{active.title}</h2>
                <p>{active.description}</p>
                <div className="modal-meta" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p><strong>Issued:</strong> {active.date || "2024"}</p>
                  <p><strong>Track:</strong> {active.category || "Academic"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Achievements;
