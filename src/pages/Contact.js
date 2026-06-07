import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { api } from "../services/api";
import "../styles/Contact.scss";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  ChevronRight,
  Facebook,
  Instagram,
  Youtube,
  AlertCircle,
  CheckCircle2,
  GraduationCap
  } from "lucide-react";


const WHATSAPP_NUMBER = "919037601403";

function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    program: "",
    message: "",
  });
  const [activeFaq, setActiveFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Scroll Reveal Refs
  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.1 });
  const [methodsRef, methodsVisible] = useScrollAnimation({ threshold: 0.15 });
  const [mainRef, mainVisible] = useScrollAnimation({ threshold: 0.15 });
  const [mapRef, mapVisible] = useScrollAnimation({ threshold: 0.15 });
  const [faqRef, faqVisible] = useScrollAnimation({ threshold: 0.15 });
  const [ctaRef, ctaVisible] = useScrollAnimation({ threshold: 0.15 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await api.createEnquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || "",
        program_interest: formData.program || null,
        message: formData.message,
      });

      setSubmitSuccess(true);
      setFormData({ name: "", phone: "", email: "", program: "", message: "" });

      const message = `*New Enquiry - Zainussunna Academy*\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Email:* ${formData.email}\n*Program:* ${formData.program || "Not specified"}\n*Message:* ${formData.message}\n\nPlease contact me regarding admission.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    } catch (err) {
      setSubmitError("Failed to submit enquiry. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      tag: "Phone",
      title: "Call Us",
      value: "+91 90376 01403",
      note: "Mon-Sat, 8:00 AM - 6:00 PM",
      href: "tel:+919037601403",
      highlight: false,
    },
    {
      icon: MessageCircle,
      tag: "WhatsApp",
      title: "WhatsApp",
      value: "+91 90376 01403",
      note: "Quick response guaranteed",
      href: "https://wa.me/919037601403",
      highlight: true,
    },
    {
      icon: MapPin,
      tag: "Visit",
      title: "Visit Campus",
      value: "Vadakkekkad",
      note: "Thrissur, Kerala, India",
      href: "https://maps.app.goo.gl/tcLKkQi1e9d59TS7A",
      highlight: false,
    },
  ];

  const workingHours = [
    { day: "Monday - Friday", time: "8:00 AM - 6:00 PM" },
    { day: "Saturday", time: "8:00 AM - 1:00 PM" },
    { day: "Sunday", time: "Closed" },
  ];

  const faqs = [
    {
      question: "What is the admission process?",
      answer: "Our admission process is designed to be seamless and transparent. It begins with submitting an online application via our Admissions portal. Once reviewed, eligible candidates will be invited for a brief personal interview and an assessment to gauge their foundational knowledge. Final admission is granted based on the interview performance and seat availability.",
    },
    {
      question: "What are the fees for the programs?",
      answer: "Zainussunna Academy is committed to making quality Islamic education accessible to all. We operate on a subsidized fee structure, and in many cases, it is donation-based depending on the student's financial background. For a detailed and up-to-date fee breakdown, please reach out to our administration office via WhatsApp or phone.",
    },
    {
      question: "Do you provide hostel facilities?",
      answer: "Currently, Zainussunna Academy operates primarily as a day-academy. However, we understand the needs of outstation students and maintain a network of trusted, safe, and comfortable boarding facilities nearby. Our administration team is always available to assist parents in securing suitable accommodation for their children.",
    },
    {
      question: "Can parents visit the academy?",
      answer: "Absolutely. We encourage parents to be active participants in their child's educational journey. You are welcome to visit the campus during our working hours. For detailed discussions with faculty or the director, we recommend scheduling an appointment in advance."
    }
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/zainussunna_academy" },
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/zainussunna_academy" },
    { icon: Youtube, label: "YouTube", href: "https://youtube.com/@zainussunnamedia" },
  ];

  return (
    <>
      <Navbar />

      <main className="contact-page">
        {/* Hero Section */}
        <section className={`contact-hero ${heroVisible ? "animate-in" : ""}`} ref={heroRef}>
          <div className="hero-bg">
            <div className="hero-grid-pattern"></div>
            <div className="hero-glow-orb-1"></div>
            <div className="hero-glow-orb-2"></div>
          </div>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1">
              <a href="/">Home</a> <span>/</span> <span className="active">Contact</span>
            </div>
            <h1 className="animate-item delay-2">Get in Touch</h1>
            <p className="animate-item delay-3">We'd love to hear from you. Reach out to us for admissions, inquiries, or just to learn more.</p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className={`contact-methods-section ${methodsVisible ? "animate-in" : ""}`} ref={methodsRef}>
          <div className="container">
            <div className="methods-grid">
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`method-card animate-item delay-${index + 1} ${method.highlight ? "highlight" : ""}`}
                >
                  <div className="card-icon">
                    <method.icon size={28} />
                  </div>
                  <div className="card-content-mobile">
                    <span className="card-tag">{method.tag}</span>
                    <h3>{method.title}</h3>
                    <p className="card-value">{method.value}</p>
                    <span className="card-note">{method.note}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className={`contact-main ${mainVisible ? "animate-in" : ""}`} ref={mainRef}>
          <div className="container">
            <div className="main-grid">
              {/* Left Column - Form */}
              <div className="form-column animate-item delay-1">
                <div className="form-wrapper">
                  <div className="form-header">
                    <h2>Send us a Message</h2>
                    <p>Fill out the form below and we'll get back to you shortly.</p>
                  </div>

                  {submitSuccess && (
                    <div className="success-message">
                      <CheckCircle2 size={20} />
                      Enquiry submitted successfully! We'll get back to you shortly.
                    </div>
                  )}
                  {submitError && (
                    <div className="error-message">
                      <AlertCircle size={20} />
                      {submitError}
                    </div>
                  )}

                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" />
                      </div>
                      <div className="form-group">
                        <label>Program Interest</label>
                        <select name="program" value={formData.program} onChange={handleChange}>
                          <option value="">Select a program</option>
                          <option>Integrated Sharee'a</option>
                          <option>Thahfeel-ul-Qur'an</option>
                          <option>Both Programs</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Message</label>
                      <textarea name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Tell us about your inquiry..."></textarea>
                    </div>

                    <button type="submit" className="whatsapp-btn submit-btn" disabled={loading}>
                      <MessageCircle size={20} />
                      <span>{loading ? "Submitting..." : "Send via WhatsApp"}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column - Info */}
              <div className="info-column animate-item delay-2">
                <div className="info-card">
                  <h3><Clock size={20} style={{ marginRight: '10px' }} /> Working Hours</h3>
                  <ul className="hours-list">
                    {workingHours.map((item, index) => (
                      <li key={index}>
                        <span className="day">{item.day}</span>
                        <span className={`time ${item.time === "Closed" ? "closed" : ""}`}>{item.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="info-card">
                  <h3>Connect With Us</h3>
                  <div className="social-links">
                    {socialLinks.map((social, index) => (
                      <a key={index} href={social.href} className="social-btn" target="_blank" rel="noopener noreferrer">
                        <social.icon size={20} />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="info-card emergency-card">
                  <div className="emergency-content">
                    <h4><AlertCircle size={20} style={{ marginRight: '10px' }} /> Urgent Inquiries?</h4>
                    <p>Call us directly for immediate assistance</p>
                    <a href="tel:+919037601403" className="emergency-link">+91 90376 01403</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className={`map-section ${mapVisible ? "animate-in" : ""}`} ref={mapRef}>
          <div className="container">
            <div className="map-wrapper animate-item delay-1">
              <iframe
                title="Zainussunna Academy Location"
                src="https://www.google.com/maps?q=Nhamanghat%2C%20Vadakkekkad%2C%20Thrissur&output=embed"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`faq-section ${faqVisible ? "animate-in" : ""}`} ref={faqRef}>
          <div className="container">
            <div className="section-header animate-item delay-1">
              <h2>Common Questions</h2>
            </div>

            <div className="faq-list animate-item delay-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item ${activeFaq === index ? "active" : ""}`}
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <div className="faq-question">
                    <h4>{faq.question}</h4>
                    <span className="faq-toggle">{activeFaq === index ? "−" : "+"}</span>
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
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
                <h2>Ready to Start Your Journey?</h2>
                <p>Take the first step towards quality Islamic education.</p>
                <div className="cta-actions">
                  <button className="btn btn-primary" onClick={() => navigate("/admissions")}>
                    <span>Apply Now</span>
                    <ChevronRight size={20} />
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

export default Contact;
