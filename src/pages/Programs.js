import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Programs.scss";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { 
  BookOpen, 
  Layers, 
  Users, 
  GraduationCap, 
  ChevronRight, 
  Check, 
  Plus, 
  Minus,
  Star,
  Scroll,
  Book,
  Heart,
  Clock
} from "lucide-react";

const staticPrograms = {
  integrated: {
    id: "integrated",
    title: "Integrated Sharee'a",
    subtitle: "Da'wa Dars Program",
    description: "A comprehensive Islamic studies program centered on classical learning and guidance-oriented education. This track is designed for students seeking deep textual mastery alongside modern intellectual development.",
    image: require("../assets/images/dars.jpg"),
    features: [
      { icon: BookOpen, title: "Classical Study", description: "In-depth study of core classical Islamic texts from primary sources." },
      { icon: Layers, title: "Structured Curriculum", description: "Following traditional Mukhtasar methodology for conceptual clarity." },
      { icon: Scroll, title: "Guided Learning", description: "Personal guidance under experienced Ustads with a focus on discipline." },
      { icon: Users, title: "Scholarly Environment", description: "Fostering academic excellence within a righteous peer community." },
    ],
    curriculum: [
      "Fiqh (Islamic Jurisprudence)",
      "Aqeedah (Islamic Creed)",
      "Seerah (Prophetic Biography)",
      "Hadith Studies",
      "Classical Arabic Grammar",
      "Usul al-Fiqh (Principles of Jurisprudence)",
      "Tafsir Foundations",
      "Logic & Rhetoric"
    ],
    outcomes: [
      "Foundational knowledge of sacred sciences",
      "Ability to analyze classical texts",
      "Strong critical thinking skills",
      "Spiritual grounding and moral integrity",
      "Preparedness for higher scholarly pursuits"
    ],
    details: [
      { label: "Duration", value: "4-6 Years" },
      { label: "Eligibility", value: "Aged 12-18" },
      { label: "Medium", value: "Arabic & Malayalam" }
    ],
    faq: [
      { 
        q: "What is the core focus of the Integrated Sharee'a track?", 
        a: "The core focus is on primary classical texts (Mukhtasars) in Fiqh, Aqeedah, and Arabic Grammar, providing a solid intellectual foundation for traditional Islamic scholarship." 
      },
      {
        q: "How does this program prepare students for modern challenges?",
        a: "By combining traditional Dars methodology with modern research tools and contemporary textual analysis, we equip students to apply classical principles to modern contexts."
      },
      {
        q: "Are there prerequisites for joining this track?",
        a: "Candidates should have completed basic Islamic education and possess a sincere commitment to long-term, disciplined scholarly pursuit."
      }
    ]
  },
  quran: {
    id: "quran",
    title: "Qur'anic Studies",
    subtitle: "Thahfeel-ul-Qur'an Program",
    description: "A focused Hifz program dedicated to Qur'an memorization with precision, accuracy, and spiritual discipline. Our method emphasizes long-term retention and beautiful recitation.",
    image: require("../assets/images/hifl.jpg"),
    features: [
      { icon: Book, title: "Systematic Hifz", description: "Personalized pacing adapted to each student's capacity." },
      { icon: Star, title: "Tajweed Mastery", description: "Strict emphasis on accurate pronunciation and rules of Tilawah." },
      { icon: Clock, title: "Daily Revision", description: "Rigorous revision cycles (Muraja'ah) ensuring long-term retention." },
      { icon: Heart, title: "Spiritual Focus", description: "Fostering a deep, life-long connection with the Book of Allah." },
    ],
    curriculum: [
      "Complete Qur'an Memorization",
      "Advanced Tajweed Rules",
      "Makharij & Sifat",
      "Etiquettes of the Qur'an",
      "Daily Muraja'ah Cycles",
      "Basic Qur'anic Vocabulary"
    ],
    outcomes: [
      "Full memorization with high accuracy",
      "Mastery of Tajweed and recitation",
      "Disciplined routine and time management",
      "Strong character through Qur'anic values",
      "Ability to lead prayers (Imamah)"
    ],
    details: [
      { label: "Duration", value: "Flexible (Pace-based)" },
      { label: "Eligibility", value: "Aged 9-15" },
      { label: "Medium", value: "Arabic" }
    ],
    faq: [
      {
        q: "What makes your Hifz methodology unique?",
        a: "We prioritize 'Itqan' (precision) and 'Muraja'ah' (retention) over speed. Our structured daily revision cycles ensure that what is memorized remains fresh for life."
      },
      {
        q: "How do you handle students with different memorization speeds?",
        a: "Each student follows a personalized plan tailored to their individual capacity, ensuring they are challenged but not overwhelmed."
      },
      {
        q: "Do students learn the meanings of the Qur'an as well?",
        a: "While the primary focus is memorization and Tajweed, we introduce basic Qur'anic vocabulary and brief conceptual summaries to help students connect with the verses."
      }
    ]
  },
};

function Programs() {
  const [activeProgram, setActiveProgram] = useState("integrated");
  const [openFaq, setOpenFaq] = useState(null);

  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1 });
  const [tabsRef, tabsVisible] = useScrollAnimation({ threshold: 0.1 });
  const [detailRef, detailVisible] = useScrollAnimation({ threshold: 0.15 });
  const [faqRef, faqVisible] = useScrollAnimation({ threshold: 0.15 });
  const [ctaRef, ctaVisible] = useScrollAnimation({ threshold: 0.15 });

  const programData = staticPrograms[activeProgram];

  return (
    <>
      <Navbar />

      <main className="program-page">
        <section className={`programs-header ${headerVisible ? "animate-in" : ""}`} ref={headerRef}>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1"><a href="/">Home</a> <span>/</span> <span>Programs</span></div>
            <h1 className="animate-item delay-2">Academic Programs</h1>
            <p className="animate-item delay-3">Structured Islamic education designed for holistic spiritual and intellectual growth.</p>
          </div>
        </section>

        <section className={`program-tabs ${tabsVisible ? "animate-in" : ""}`} ref={tabsRef}>
          <div className="container">
            <button 
              className={`tab-btn animate-item delay-1 ${activeProgram === "integrated" ? "active" : ""}`} 
              onClick={() => setActiveProgram("integrated")}
            >
              <BookOpen size={22} /> <span>Integrated Sharee'a</span>
            </button>
            <button 
              className={`tab-btn animate-item delay-2 ${activeProgram === "quran" ? "active" : ""}`} 
              onClick={() => setActiveProgram("quran")}
            >
              <GraduationCap size={22} /> <span>Qur'anic Studies</span>
            </button>
          </div>
        </section>

        <section className={`program-detail ${detailVisible ? "animate-in" : ""}`} ref={detailRef}>
          <div className="container">
            <div className="detail-header">
              <div className="detail-text animate-item delay-1">
                <span className="subtitle">{programData.subtitle}</span>
                <h2>{programData.title}</h2>
                <p className="description">{programData.description}</p>
                
                <div className="program-quick-info" style={{ display: 'flex', gap: '30px', margin: '30px 0 40px' }}>
                  {programData.details.map((d, i) => (
                    <div key={i} className="info-item">
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>{d.label}</span>
                      <span style={{ fontSize: '1.1rem', color: '#213448', fontWeight: 600 }}>{d.value}</span>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary" onClick={() => window.location.href="/admissions"}>
                  <span>Apply for Admission</span>
                  <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </div>
              <div className="detail-image animate-item delay-2">
                <img src={programData.image} alt={programData.title} />
              </div>
            </div>

            <div className="features-section animate-item delay-3">
              <h3>Core Pillars of Excellence</h3>
              <div className="features-grid">
                {programData.features.map((f, i) => (
                  <div key={i} className={`feature-card animate-item delay-${i + 1}`}>
                    <div className="feature-icon"><f.icon size={30} /></div>
                    <h4>{f.title}</h4>
                    <p>{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="two-column animate-item delay-4">
              <div className="column animate-item delay-1">
                <h3>Curriculum Focus</h3>
                <ul>{programData.curriculum.map((c, i) => <li key={i}><Check className="check-icon" size={18} /> {c}</li>)}</ul>
              </div>
              <div className="column animate-item delay-2">
                <h3>Key Learning Outcomes</h3>
                <ul>{programData.outcomes.map((o, i) => <li key={i}><Check className="check-icon" size={18} /> {o}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className={`faq-section ${faqVisible ? "animate-in" : ""}`} ref={faqRef}>
          <div className="container">
            <h2 className="animate-item delay-1">Frequently Asked Questions</h2>
            <div className="faq-list animate-item delay-2">
              {(programData.faq || [
                { 
                  q: "Who is eligible to apply for these programs?", 
                  a: "We seek dedicated students with a foundational understanding of Islamic principles and a sincere passion for knowledge. The Integrated Sharee'a program is ideal for students aged 12-18, while the Qur'anic Studies (Hifz) program accepts students aged 9-15. Previous academic records and a preliminary interview are part of our selection criteria to ensure a good fit for our rigorous curriculum." 
                },
                { 
                  q: "What is the medium of instruction?", 
                  a: "To preserve the authenticity of Islamic scholarship, the primary medium for textual study is Arabic. However, our experienced faculty use English and Malayalam extensively for conceptual breakdowns, discussions, and mentorship. This ensures that students fully grasp complex subjects regardless of their initial Arabic proficiency while progressively building their language skills." 
                },
                { 
                  q: "Is the curriculum recognized for higher studies?", 
                  a: "Yes. Our curriculum is meticulously structured based on the traditional 'Mukhtasar' methodology, which is globally respected in the world of Islamic scholarship. Graduates from our Integrated Sharee'a program possess a rigorous academic foundation that prepares them for advanced degrees at renowned Islamic universities and institutions worldwide." 
                },
                { 
                  q: "What is the daily schedule like?", 
                  a: "Our daily routine fosters discipline, spiritual growth, and academic focus. The day begins before Fajr with Tahajjud and revision, followed by core academic classes until noon. Afternoons include dedicated research and library hours, while evenings are reserved for mentorship sessions and community activities. We ensure a balanced approach with ample time for rest and meals." 
                },
                { 
                  q: "Are extracurricular activities included?", 
                  a: "Absolutely. We believe in holistic development. Alongside rigorous academics, students participate in public speaking (Da'wa) training, physical education, community service initiatives, and academic symposiums. These activities are designed to build confidence, leadership skills, and a strong sense of social responsibility." 
                }
              ]).map((item, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="faq-question">
                    <span>{item.q}</span>
                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                  <div className="faq-answer">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`section-cta ${ctaVisible ? "animate-in" : ""}`} ref={ctaRef}>
          <div className="container">
            <div className="cta-modern-box">
              <div className="cta-glow-orb"></div>
              <div className="cta-content">
                <span className="overline">Take the Next Step</span>
                <h2>Ready to Excel in Your Studies?</h2>
                <p>Join our community of scholars and embark on a journey of authentic Islamic learning.</p>
                <div className="cta-actions">
                  <button className="btn btn-primary" onClick={() => window.location.href="/admissions"}>
                    <span>Start Your Application</span>
                    <ChevronRight size={20} style={{ marginLeft: '10px' }} />
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

export default Programs;