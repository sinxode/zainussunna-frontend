import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Lightbox from "../components/Lightbox";
import "../styles/Gallery.scss";
import api from "../services/api";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { Maximize2, Play, Image as ImageIcon } from "lucide-react";

const PER_PAGE = 12;

function Gallery() {
  const [page, setPage] = useState(1);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.05 });
  const [catRef, catVisible] = useScrollAnimation({ threshold: 0.05 });
  const [gridRef, gridVisible] = useScrollAnimation({ threshold: 0.05 });
  const [videoRef, videoVisible] = useScrollAnimation({ threshold: 0.05 });

  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return galleryItems.length;
    return galleryItems.filter(
      (item) => (item.category || "").toLowerCase() === categoryId,
    ).length;
  };

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "campus", label: "Campus" },
    { id: "classroom", label: "Classroom" },
    { id: "events", label: "Events" },
    { id: "graduation", label: "Graduation" },
  ];

  const filteredItems =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter(
          (item) => (item.category || "").toLowerCase() === activeCategory,
        );

  const items = filteredItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const data = await api.getGalleryItems();
        const results = (data.results || data || [])
          .map(item => ({
            ...item,
            image: api.getImageUrl(item.image)
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (results.length === 0) {
          throw new Error("No gallery items found");
        }
        setGalleryItems(results);
      } catch (err) {
        console.error("Error fetching gallery, loading fallbacks:", err);
        const fallbackGallery = [
          {
            id: 1,
            title: "Campus Study Session",
            category: "campus",
            image: require("../assets/images/IMG_0072.jpeg"),
          },
          {
            id: 2,
            title: "Classroom Lectures",
            category: "classroom",
            image: require("../assets/images/IMG_0097.jpeg"),
          },
          {
            id: 3,
            title: "Student Assembly",
            category: "events",
            image: require("../assets/images/IMG_0113.jpeg"),
          },
          {
            id: 4,
            title: "Classical Library Study",
            category: "campus",
            image: require("../assets/images/IMG_0122.jpeg"),
          },
          {
            id: 5,
            title: "Recreational Activities",
            category: "events",
            image: require("../assets/images/IMG_0130.jpeg"),
          },
          {
            id: 6,
            title: "Integrated Sharee'a Session",
            category: "classroom",
            image: require("../assets/images/dars.jpg"),
          },
          {
            id: 7,
            title: "Thahfeez Class",
            category: "classroom",
            image: require("../assets/images/hifl.jpg"),
          },
          {
            id: 8,
            title: "Academic Seminar",
            category: "events",
            image: require("../assets/images/IMG_0190.jpeg"),
          },
          {
            id: 9,
            title: "Graduation Convocation",
            category: "graduation",
            image: require("../assets/images/gallery1.jpeg"),
          },
          {
            id: 10,
            title: "Traditional Certifications",
            category: "graduation",
            image: require("../assets/images/gallery2.jpeg"),
          },
          {
            id: 11,
            title: "Convocation Ceremony",
            category: "graduation",
            image: require("../assets/images/gallery3.jpeg"),
          },
          {
            id: 12,
            title: "Campus Library Hall",
            category: "campus",
            image: require("../assets/images/gallery4.jpeg"),
          },
        ];
        setGalleryItems(fallbackGallery);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleNext = () => {
    const currentIndex = filteredItems.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedImage(filteredItems[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = filteredItems.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const prevIndex =
      (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedImage(filteredItems[prevIndex]);
  };

  if (loading) {
    return <Loading message="Curating Gallery..." />;
  }

  return (
    <>
      <Navbar />

      <main className="gallery-page">
        <section
          className={`gallery-header ${headerVisible ? "animate-in" : ""}`}
          ref={headerRef}
        >
          <div className="hero-bg">
            <div className="hero-grid-pattern"></div>
            <div className="hero-glow-orb-1"></div>
            <div className="hero-glow-orb-2"></div>
          </div>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1">
              <a href="/">Home</a> <span>/</span>{" "}
              <span className="active">Gallery</span>
            </div>
            <h1 className="animate-item delay-2">Campus Glimpse</h1>
            <p className="animate-item delay-3">
              A glimpse into the daily life and special moments at Zainussunna
              Academy.
            </p>
          </div>
        </section>

        <section
          className={`category-section ${catVisible ? "animate-in" : ""}`}
          ref={catRef}
        >
          <div className="container">
            <div className="category-tabs animate-item delay-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setPage(1);
                  }}
                >
                  <span className="cat-label">{cat.label}</span>
                  <span className="cat-count">{getCategoryCount(cat.id)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`gallery-content ${gridVisible ? "animate-in" : ""}`}
          ref={gridRef}
        >
          <div className="container">
            <div className="gallery-grid">
              {items.map((item, i) => (
                <div
                  key={item.id || i}
                  className={`gallery-item animate-item delay-${(i % 4) + 1}`}
                  onClick={() => setSelectedImage(item)}
                >
                  <img src={item.image} alt={item.title || "Gallery"} />
                  <div className="item-overlay">
                    <Maximize2 className="view-icon" size={24} />
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div
                  className="no-data"
                  style={{
                    gridColumn: "span 3",
                    textAlign: "center",
                    padding: "100px 0",
                  }}
                >
                  <ImageIcon
                    size={48}
                    style={{ opacity: 0.1, marginBottom: "20px" }}
                  />
                  <p>No photos found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          className={`video-section ${videoVisible ? "animate-in" : ""}`}
          ref={videoRef}
        >
          <div className="container">
            <div className="section-header animate-item delay-1">
              <h2>Featured Videos</h2>
            </div>
            <div className="video-grid">
              <div className="video-card main animate-item delay-2">
                <div className="video-thumbnail">
                  <img
                    src={require("../assets/images/IMG_0727.jpeg")}
                    alt="Tour"
                  />
                  <div className="play-btn">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
                <div className="video-info">
                  <h3>Virtual Campus Tour</h3>
                </div>
              </div>
              <div className="video-card animate-item delay-3">
                <div className="video-thumbnail">
                  <img
                    src={require("../assets/images/dars.jpg")}
                    alt="Graduation"
                  />
                  <div className="play-btn">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                <div className="video-info">
                  <h3>Graduation Ceremony</h3>
                </div>
              </div>
              <div className="video-card animate-item delay-4">
                <div className="video-thumbnail">
                  <img src={require("../assets/images/hifl.jpg")} alt="Daily" />
                  <div className="play-btn">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                <div className="video-info">
                  <h3>A Day at Academy</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedImage && (
        <Lightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      <Footer />
    </>
  );
}

export default Gallery;
