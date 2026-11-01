import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import '../styles/Lightbox.scss';

const Lightbox = ({ image, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  if (!image) return null;

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.image;
    link.download = `Zainussunna-Gallery-${image.id || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title || 'Zainussunna Academy Gallery',
          text: 'Check out this photo from Zainussunna Academy!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-controls">
        <button className="control-btn close" onClick={(e) => { e.stopPropagation(); onClose(); }} title="Close">
          <X size={24} />
        </button>
        <div className="control-group">
          <button className="control-btn" onClick={handleDownload} title="Download">
            <Download size={20} />
          </button>
          <button className="control-btn" onClick={handleShare} title="Share">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} title="Previous">
          <ChevronLeft size={48} />
        </button>
        
        <div className="image-wrapper">
          <img src={image.image} alt={image.title || "Gallery"} />
          {image.title && (
            <div className="image-caption">
              <h3>{image.title}</h3>
              {image.category && <span>{image.category}</span>}
            </div>
          )}
        </div>

        <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); onNext(); }} title="Next">
          <ChevronRight size={48} />
        </button>
      </div>
    </div>
  );
};

export default Lightbox;
