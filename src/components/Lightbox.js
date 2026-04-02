import React from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import '../styles/Lightbox.scss';

const Lightbox = ({ image, onClose, onNext, onPrev }) => {
  if (!image) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-controls">
        <button className="control-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <X size={24} />
        </button>
        <div className="control-group">
          <button className="control-btn" onClick={(e) => e.stopPropagation()}>
            <Download size={20} />
          </button>
          <button className="control-btn" onClick={(e) => e.stopPropagation()}>
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="nav-btn prev" onClick={onPrev}>
          <ChevronLeft size={40} />
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

        <button className="nav-btn next" onClick={onNext}>
          <ChevronRight size={40} />
        </button>
      </div>
    </div>
  );
};

export default Lightbox;
