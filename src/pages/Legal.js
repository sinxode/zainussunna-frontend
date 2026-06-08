import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { api } from "../services/api";
import "../styles/Legal.scss";
import NotFound from "../components/NotFound";
import Loading from "../components/Loading";

function Legal() {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await api.getContentPage(slug);
        setContent(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Content not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchContent();
    }
  }, [slug]);

  if (loading) {
    return <Loading message="Loading Policy..." />;
  }

  if (error || !content) {
    return <NotFound />;
  }

  // Parse content blocks
  const renderContent = () => {
    if (!content.content_blocks || content.content_blocks.length === 0) {
      return <p>No content available.</p>;
    }

    return content.content_blocks
      .sort((a, b) => a.order - b.order)
      .map((block, index) => {
        if (block.type === "text") {
          return (
            <div
              key={index}
              className="content-block"
              dangerouslySetInnerHTML={{ __html: block.data.content }}
            />
          );
        }
        return null;
      });
  };

  return (
    <>
      <Navbar />

      <section className="legal-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span> / {content.title}</span>
          </div>

          {/* Header */}
          <div className="legal-header">
            <h1>{content.title}</h1>
          </div>

          {/* Content */}
          <div className="legal-content">{renderContent()}</div>

          {/* Back Link */}
          <div className="legal-back">
            <Link to="/" className="btn btn-secondary">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Legal;
