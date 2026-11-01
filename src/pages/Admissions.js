import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { api } from "../services/api";
import Toast from "../components/Toast";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import {
  CheckCircle,
  Smartphone,
  MessageCircle,
  Camera,
  Upload,
  Check,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Users,
  Info,
  ChevronRight
} from "lucide-react";

import "../styles/Admissions.scss";

const STATES = ["Kerala", "Tamil Nadu", "Karnataka"];

const DISTRICTS = {
  Kerala: [
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Tiruppur",
    "Ranipet",
    "Vellore",
    "Erode",
    "Thoothukkudi",
    "Dindigul",
    "Thanjavur",
    "Kancheepuram",
    "Chengalpattu",
    "Villupuram",
    "Cuddalore",
    "Nagapattinam",
    "Tiruvarur",
    "Pudukkottai",
    "Sivaganga",
    "Virudhunagar",
    "Ramanathapuram",
    "Tenkasi",
    "Krishnagiri",
    "Dharmapuri",
    "Namakkal",
    "Perambalur",
    "Ariyalur",
    "Kallakurichi",
    "Tirupattur",
    "Nilgiris",
    "Karur",
    "Mayiladuthurai",
    "Tiruvannamalai",
    "Kanyakumari",
  ],
  Karnataka: [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Mysuru",
    "Mangaluru",
    "Belagavi",
    "Ballari",
    "Vijayapura",
    "Kalaburagi",
    "Dharwad",
    "Davanagere",
    "Shivamogga",
    "Tumakuru",
    "Raichur",
    "Bidar",
    "Hassan",
    "Mandya",
    "Udupi",
    "Chikkamagaluru",
    "Kodagu",
    "Chitradurga",
    "Kolar",
    "Chikkaballapura",
    "Ramanagara",
    "Chamarajanagar",
    "Yadgir",
    "Koppal",
    "Gadag",
    "Haveri",
    "Uttara Kannada",
    "Bagalkot",
    "Vijayanagara",
  ],
};

const COUNTRY_CODES = ["+91", "+968", "+966", "+971", "+44", "+1"];

const CLASSES = [
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Plus One",
  "Plus Two",
  "Graduate",
  "Post Graduate",
];

const LANGUAGES = ["Arabic", "English", "Malayalam", "Hindi", "Urdu"];

export default function Admission() {
  const [step, setStep] = useState(1);
  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1 });
  const [contentRef, contentVisible] = useScrollAnimation({ threshold: 0.15 });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [program, setProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [toast, setToast] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // WhatsApp related state
  const [whatsappUrl, setWhatsappUrl] = useState(null);
  const [submittedApplicationId, setSubmittedApplicationId] = useState(null);

  // Scroll to top when success screen is shown
  useEffect(() => {
    if (toast && submittedApplicationId) {
      window.scrollTo(0, 0);
    }
  }, [toast, submittedApplicationId]);

  // Fetch programs from backend
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await api.getPrograms();
        let programList = [];
        if (Array.isArray(data)) {
          programList = data;
        } else if (data && Array.isArray(data.results)) {
          programList = data.results;
        }
        setPrograms(programList);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
        const fallbackPrograms = [
          {
            id: "bf59ccf2-bc09-4d9d-950c-abaccc60a9dc",
            name: "Integrated Sharee'a",
            slug: "shareea",
            subtitle: "Da'wa Dars Program",
            min_age: 10,
            max_age: 18,
          },
          {
            id: "10198060-b80c-40c2-abe3-1b1f4ab8c2aa",
            name: "Thahfīẓ-ul-Qur'an",
            slug: "thahfeez",
            subtitle: "Thahfeel-ul-Qu'ran Program",
            min_age: 9,
            max_age: 18,
          },
        ];
        setPrograms(fallbackPrograms);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const [form, setForm] = useState({
    studentPhoto: null,
    name: "",
    dob: "",
    age: "",
    phone: "",
    email: "",
    state: "",
    district: "",
    houseName: "",
    place: "",
    postOffice: "",
    zipCode: "",
    madrassaName: "",
    classStopped: "",
    standard: "",
    schoolCollege: "",
    languages: [],
    languageOther: "",
    skills: "",
    interests: "",
    lastBook: "",
    careerNote: "",
    expectations: "",
    achievementsFile: null,
    arabicFluent: "",
    hifzBefore: "",
    hifzAmount: "",
    thahfeezSkills: "",
    thahfeezInterests: "",
    thahfeezComments: "",
    thahfeezAchievements: null,
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianOccupation: "",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!form.dob) return;
    const dob = new Date(form.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    update("age", age);
  }, [form.dob]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.size <= 10 * 1024 * 1024 &&
      file.type.startsWith("image/")
    ) {
      update("studentPhoto", file);
    } else if (file) {
      alert("File size must be less than 10MB and be an image");
    }
  };

  const handleFileChange = (key, e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      update(key, file);
    } else if (file) {
      alert("File size must be less than 10MB");
    }
  };

  const getSelectedProgram = () => {
    return programs.find((p) => p.slug === program);
  };

  const ageValid = () => {
    const selectedProgram = getSelectedProgram();
    if (!selectedProgram || !form.age) return false;
    return (
      form.age >= selectedProgram.min_age && form.age <= selectedProgram.max_age
    );
  };
  const isAgeErrorVisible = form.dob && !ageValid();

  const step1Valid =
    form.studentPhoto &&
    form.name &&
    form.dob &&
    form.phone &&
    form.email.endsWith("@gmail.com") &&
    form.state &&
    form.district &&
    form.houseName &&
    form.place &&
    form.postOffice &&
    form.zipCode &&
    ageValid();

  const step2Valid =
    form.madrassaName &&
    form.classStopped &&
    form.standard &&
    form.schoolCollege &&
    form.languages.length > 0 &&
    (program === "shareea"
      ? form.skills && form.lastBook
      : form.arabicFluent && form.hifzBefore && (form.hifzBefore === "no" || form.hifzAmount));

  const step3Valid =
    form.guardianName &&
    form.guardianRelation &&
    form.guardianPhone &&
    form.guardianEmail.toLowerCase().endsWith("@gmail.com") &&
    form.guardianOccupation;

  const toggleLanguage = (lang) => {
    const newLangs = form.languages.includes(lang)
      ? form.languages.filter((l) => l !== lang)
      : [...form.languages, lang];
    update("languages", newLangs);
  };

  const next = () => {
    window.scrollTo(0, 0);
    setStep((s) => Math.min(s + 1, 4));
  };
  const back = () => {
    window.scrollTo(0, 0);
    setStep((s) => Math.max(s - 1, 1));
  };
  const jumpToStep = (targetStep) => {
    if (targetStep <= step) {
      window.scrollTo(0, 0);
      setStep(targetStep);
    }
  };

  const generateWhatsAppMessage = async (admissionId) => {
    try {
      const response = await api.request("/whatsapp/generate_message/", {
        method: "POST",
        body: JSON.stringify({
          admission_id: admissionId,
          message_type: "success",
        }),
        auth: false,
      });

      if (response.whatsapp_url) {
        setWhatsappUrl(response.whatsapp_url);
      }
    } catch (err) {
      console.error("Failed to generate WhatsApp message:", err);
    }
  };

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      const selectedProgram = getSelectedProgram();
      if (!selectedProgram) {
        throw new Error("Please select a program");
      }

      const step1Data = {
        name: form.name,
        dob: form.dob,
        phone: form.phone,
        phone_country_code: countryCode,
        email: form.email,
        address_house_name: form.houseName,
        address_place: form.place,
        address_post_office: form.postOffice,
        address_pin_code: form.zipCode,
        address_state: form.state,
        address_district: form.district,
      };

      const admission = await api.createAdmission({
        program: selectedProgram.id,
        step: 1,
        step_data: step1Data,
        time_spent: 0,
        student_photo: form.studentPhoto,
      });

      const step2Data = {
        madrassa_name: form.madrassaName,
        class_stopped: form.classStopped,
        school_college: form.schoolCollege,
        standard: form.standard,
        languages_known: form.languages,
        languages_other: form.languageOther,
        ...(program === "shareea"
          ? {
              academic_data: {
                skills: form.skills,
                interests: form.interests,
                last_book: form.lastBook,
                career_note: form.careerNote,
                expectations: form.expectations,
              },
            }
          : {
              academic_data: {
                arabic_fluent: form.arabicFluent,
                hifz_before: form.hifzBefore,
                hifz_amount: form.hifzAmount,
                skills: form.thahfeezSkills,
                interests: form.thahfeezInterests,
                comments: form.thahfeezComments,
              },
            }),
        achievements_file: form.achievementsFile || form.thahfeezAchievements,
      };

      await api.completeStep(admission.id, step2Data, 0);

      const step3Data = {
        guardian_name: form.guardianName,
        guardian_relation: form.guardianRelation,
        guardian_phone: form.guardianPhone,
        guardian_phone_country_code: countryCode,
        guardian_email: form.guardianEmail,
        guardian_occupation: form.guardianOccupation,
      };

      await api.completeStep(admission.id, step3Data, 0);
      await api.submitAdmission(admission.id);

      setSubmittedApplicationId(admission.id);
      await generateWhatsAppMessage(admission.id);
      setToast(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setError(
        err.message || "Failed to submit application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <>
      <Navbar />
      <main className="admission-page">
        {/* Header Section */}
        <section className={`admission-header ${headerVisible ? "animate-in" : ""}`} ref={headerRef}>
          <div className="hero-bg">
            <div className="hero-grid-pattern"></div>
            <div className="hero-glow-orb-1"></div>
            <div className="hero-glow-orb-2"></div>
          </div>
          <div className="container">
            <div className="breadcrumbs animate-item delay-1">
              <a href="/">Home</a> <span>/</span> <span className="active">Admission</span>
            </div>
            <h1 className="animate-item delay-2">Admission Portal</h1>
            <p className="animate-item delay-3">Begin your scholarly journey. Complete the form details below to submit your application.</p>
          </div>
        </section>

        {/* Content Section */}
        <section className={`admission-content ${contentVisible ? "animate-in" : ""}`} ref={contentRef}>
          <div className="container animate-item delay-1">
            <div className="admission-card">
              {/* Success Screen */}
              {toast && submittedApplicationId ? (
                <div className="success-screen">
                  <div className="success-icon">
                    <CheckCircle size={80} strokeWidth={1.5} />
                  </div>

                  <h2>Application Submitted Successfully!</h2>
                  <p>Thank you for submitting your application to Zainussunna Academy.</p>
                  
                  <div className="application-note">
                    <p>Your details have been saved under Application Reference ID:</p>
                    <strong>{submittedApplicationId}</strong>
                    <p className="sub-note">Our admissions board will review your credentials and contact you shortly.</p>
                  </div>

                  {/* WhatsApp Button */}
                  {whatsappUrl && (
                    <div className="whatsapp-section">
                      <p className="whatsapp-prompt">
                        <Smartphone size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                        Send a confirmation copy directly on WhatsApp for priority processing:
                      </p>
                      <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
                        <MessageCircle size={22} />
                        <span>Share on WhatsApp</span>
                      </button>
                    </div>
                  )}

                  <button className="btn btn-secondary home-btn" onClick={handleGoHome}>
                    Return to Home Page
                  </button>
                </div>
              ) : (
                <>
                  {/* Timeline Steps Tracker */}
                  <div className="timeline-wrapper">
                    <div className="timeline">
                      {[1, 2, 3, 4].map((n) => {
                        const stepLabels = [
                          "Personal Details",
                          "Academic History",
                          "Guardian Info",
                          "Review & Submit"
                        ];
                        return (
                          <div
                            key={n}
                            className={`timeline-step ${step >= n ? "done" : ""} ${step === n ? "active" : ""} ${step < n ? "locked" : ""}`}
                            onClick={() => jumpToStep(n)}
                          >
                            <div className="dot">
                              {n < step ? <Check size={18} strokeWidth={3} /> : n}
                            </div>
                            <span className="step-label">{stepLabels[n - 1]}</span>
                          </div>
                        );
                      })}
                      <div className="track">
                        <span style={{ width: `${(step - 1) * 33.3}%` }}></span>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Program & Personal Details */}
                  {step === 1 && (
                    <div className="step-panel">
                      <div className="step-header">
                        <User size={24} />
                        <h2>Select Program & Enter Personal Info</h2>
                      </div>
                      
                      {error && <div className="error-message">{error}</div>}

                      <div className="form-section-title">Academic Program</div>
                      {loading ? (
                        <div className="loading-message">
                          <GraduationCap size={40} className="animate-pulse" />
                          <p>Loading programs...</p>
                        </div>
                      ) : programs.length === 0 ? (
                        <div className="error-message">No programs available. Please try again later.</div>
                      ) : (
                        <div className="programs-grid">
                          {programs.map((p) => {
                            const isSelected = program === p.slug;
                            return (
                              <div
                                key={p.slug}
                                className={`program-select-card ${isSelected ? "selected" : ""}`}
                                onClick={() => setProgram(p.slug)}
                              >
                                <div className="select-icon">
                                  {p.slug === "shareea" ? <BookOpen size={24} /> : <GraduationCap size={24} />}
                                </div>
                                <div className="select-content">
                                  <h3>{p.name}</h3>
                                  <p>{p.subtitle || "Academy course track"}</p>
                                  <span className="age-limit">Age: {p.min_age} - {p.max_age} years</span>
                                </div>
                                <div className="checkbox-indicator">
                                  <div className="check-dot"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="form-section-title">Personal Details</div>
                      
                      {/* Photo Upload Box */}
                      <div className="photo-upload-container">
                        <label className="photo-label">Student Photograph *</label>
                        <div className="photo-uploader">
                          <div className="uploader-avatar">
                            {form.studentPhoto ? (
                              <img src={URL.createObjectURL(form.studentPhoto)} alt="Preview" />
                            ) : (
                              <Camera size={32} />
                            )}
                          </div>
                          <div className="uploader-actions">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              id="photo-upload-input"
                              className="hidden-file-input"
                            />
                            <label htmlFor="photo-upload-input" className="btn btn-secondary">
                              <Camera size={16} />
                              <span>Select Image</span>
                            </label>
                            <span className="upload-hint">Upload a passport size photo (JPG/PNG, Max 10MB)</span>
                          </div>
                        </div>
                      </div>

                      <div className="form-grid">
                        <div className="form-field full-width">
                          <label>Full Student Name *</label>
                          <input
                            placeholder="Enter full name as per records"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Date of Birth *</label>
                          <input
                            type="date"
                            value={form.dob}
                            onChange={(e) => update("dob", e.target.value)}
                          />
                          {isAgeErrorVisible && getSelectedProgram() && (
                            <span className="field-error-msg">
                              Age must be between {getSelectedProgram()?.min_age} and {getSelectedProgram()?.max_age} years.
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label>Calculated Age</label>
                          <input
                            readOnly
                            placeholder="Calculated automatically"
                            value={form.age || ""}
                          />
                        </div>

                        <div className="form-field">
                          <label>Primary Phone Number *</label>
                          <div className="phone-input-group">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                            >
                              {COUNTRY_CODES.map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              placeholder="Phone number"
                              value={form.phone}
                              maxLength={10}
                              onChange={(e) => update("phone", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label>Email Address *</label>
                          <input
                            type="email"
                            placeholder="username@gmail.com *"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                          />
                          {form.email && !form.email.endsWith("@gmail.com") && (
                            <span className="field-error-msg">Must be a valid @gmail.com address</span>
                          )}
                        </div>

                        <div className="form-field">
                          <label>State *</label>
                          <select
                            value={form.state}
                            onChange={(e) => {
                              update("state", e.target.value);
                              update("district", "");
                            }}
                          >
                            <option value="">Select State *</option>
                            {STATES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>District *</label>
                          <select
                            key={form.state}
                            value={form.district}
                            disabled={!form.state}
                            onChange={(e) => update("district", e.target.value)}
                          >
                            <option value="">Select District *</option>
                            {DISTRICTS[form.state]?.map((d) => (
                              <option key={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>House Name / Number *</label>
                          <input
                            placeholder="House name *"
                            value={form.houseName}
                            onChange={(e) => update("houseName", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Place / City *</label>
                          <input
                            placeholder="Place *"
                            value={form.place}
                            onChange={(e) => update("place", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Post Office *</label>
                          <input
                            placeholder="Post office *"
                            value={form.postOffice}
                            onChange={(e) => update("postOffice", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Postal PIN Code *</label>
                          <input
                            type="text"
                            placeholder="6 digit PIN code *"
                            value={form.zipCode}
                            maxLength={6}
                            onChange={(e) => update("zipCode", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="step-navigation">
                        <div className="spacer"></div>
                        <button
                          className="btn btn-primary"
                          disabled={!step1Valid || loading}
                          onClick={next}
                        >
                          <span>Continue</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Academic Details */}
                  {step === 2 && (
                    <div className="step-panel">
                      <div className="step-header">
                        <FileText size={24} />
                        <h2>Academic History & Credentials</h2>
                      </div>

                      <div className="form-section-title">Education Records</div>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>Name of Madrassa / Dars *</label>
                          <input
                            placeholder="Last attended Madrassa *"
                            value={form.madrassaName}
                            onChange={(e) => update("madrassaName", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Class completed stopping study *</label>
                          <select
                            value={form.classStopped}
                            onChange={(e) => update("classStopped", e.target.value)}
                          >
                            <option value="">Select stopping class *</option>
                            {CLASSES.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>School / College studied *</label>
                          <input
                            placeholder="Last attended school/college *"
                            value={form.schoolCollege}
                            onChange={(e) => update("schoolCollege", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Standard going to study *</label>
                          <select
                            value={form.standard}
                            onChange={(e) => update("standard", e.target.value)}
                          >
                            <option value="">Select upcoming class *</option>
                            {CLASSES.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Languages known checkboxes */}
                      <div className="form-field full-width languages-field">
                        <label>Languages Known *</label>
                        <div className="custom-checkbox-group">
                          {LANGUAGES.map((lang) => (
                            <label key={lang} className="checkbox-item">
                              <input
                                type="checkbox"
                                checked={form.languages.includes(lang)}
                                onChange={() => toggleLanguage(lang)}
                              />
                              <span className="checkbox-box"></span>
                              <span className="checkbox-text">{lang}</span>
                            </label>
                          ))}
                          <label className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={form.languages.includes("Other")}
                              onChange={() => toggleLanguage("Other")}
                            />
                            <span className="checkbox-box"></span>
                            <span className="checkbox-text">Other</span>
                          </label>
                        </div>

                        {form.languages.includes("Other") && (
                          <input
                            placeholder="Please specify other languages"
                            value={form.languageOther}
                            onChange={(e) => update("languageOther", e.target.value)}
                            className="other-lang-specify-input"
                          />
                        )}
                      </div>

                      {/* Course specific questions */}
                      {program === "shareea" && (
                        <>
                          <div className="form-section-title">Course Specifications</div>
                          <div className="form-grid">
                            <div className="form-field">
                              <label>Key Skills / Talents *</label>
                              <input
                                placeholder="E.g., public speaking, writing *"
                                value={form.skills}
                                onChange={(e) => update("skills", e.target.value)}
                              />
                            </div>

                            <div className="form-field">
                              <label>Last book read *</label>
                              <input
                                placeholder="Title and author of book read *"
                                value={form.lastBook}
                                onChange={(e) => update("lastBook", e.target.value)}
                              />
                            </div>

                            <div className="form-field full-width">
                              <label className="file-uploader-box">
                                <Upload size={20} />
                                <span>Upload Certificates/Achievements (Optional)</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleFileChange("achievementsFile", e)}
                                />
                              </label>
                              {form.achievementsFile && (
                                <span className="attached-file-name">📎 {form.achievementsFile.name}</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {program === "thahfeez" && (
                        <>
                          <div className="form-section-title">Course Specifications</div>
                          <div className="form-grid">
                            <div className="form-field">
                              <label>Arabic Reading Fluency *</label>
                              <select
                                value={form.arabicFluent}
                                onChange={(e) => update("arabicFluent", e.target.value)}
                              >
                                <option value="">Select fluency level *</option>
                                <option value="no">No - Cannot read</option>
                                <option value="beginning">Beginning - Knows alphabets</option>
                                <option value="elementary">Elementary - Can read words</option>
                                <option value="intermediate">Intermediate - Can read sentences</option>
                                <option value="advanced">Advanced - Can read paragraphs</option>
                                <option value="fluent">Fluent - Can read fluently</option>
                              </select>
                            </div>

                            <div className="form-field">
                              <label>Have you studied Hifz before? *</label>
                              <select
                                value={form.hifzBefore}
                                onChange={(e) => {
                                  update("hifzBefore", e.target.value);
                                  if (e.target.value === "no") update("hifzAmount", "");
                                }}
                              >
                                <option value="">Select option *</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </div>

                            {form.hifzBefore === "yes" && (
                              <div className="form-field full-width">
                                <label>How much Quran memorized? *</label>
                                <input
                                  placeholder="List Juz or Surahs memorized *"
                                  value={form.hifzAmount}
                                  onChange={(e) => update("hifzAmount", e.target.value)}
                                />
                              </div>
                            )}

                            <div className="form-field full-width">
                              <label>Additional comments (Optional)</label>
                              <textarea
                                placeholder="Describe any additional details"
                                value={form.thahfeezComments}
                                onChange={(e) => update("thahfeezComments", e.target.value)}
                              />
                            </div>

                            <div className="form-field full-width">
                              <label className="file-uploader-box">
                                <Upload size={20} />
                                <span>Upload Achievements/Quran Certificates (Optional)</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleFileChange("thahfeezAchievements", e)}
                                />
                              </label>
                              {form.thahfeezAchievements && (
                                <span className="attached-file-name">📎 {form.thahfeezAchievements.name}</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="step-navigation">
                        <button className="btn btn-secondary" onClick={back} disabled={loading}>
                          <ArrowLeft size={18} />
                          <span>Back</span>
                        </button>
                        <button
                          className="btn btn-primary"
                          disabled={!step2Valid || loading}
                          onClick={next}
                        >
                          <span>Continue</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Guardian Details */}
                  {step === 3 && (
                    <div className="step-panel">
                      <div className="step-header">
                        <Users size={24} />
                        <h2>Parent / Guardian Details</h2>
                      </div>

                      <div className="form-section-title">Guardian Information</div>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>Guardian Full Name *</label>
                          <input
                            placeholder="Full name of parent/guardian *"
                            value={form.guardianName}
                            onChange={(e) => update("guardianName", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Relationship *</label>
                          <input
                            placeholder="E.g. Father, Mother, Uncle *"
                            value={form.guardianRelation}
                            onChange={(e) => update("guardianRelation", e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label>Contact Number *</label>
                          <div className="phone-input-group">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                            >
                              {COUNTRY_CODES.map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              placeholder="Guardian phone *"
                              value={form.guardianPhone}
                              maxLength={10}
                              onChange={(e) => update("guardianPhone", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label>Guardian Email Address *</label>
                          <input
                            type="email"
                            placeholder="guardian@gmail.com *"
                            value={form.guardianEmail}
                            onChange={(e) => update("guardianEmail", e.target.value)}
                          />
                          {form.guardianEmail && !form.guardianEmail.toLowerCase().endsWith("@gmail.com") && (
                            <span className="field-error-msg">Must be a valid @gmail.com address</span>
                          )}
                        </div>

                        <div className="form-field full-width">
                          <label>Occupation *</label>
                          <input
                            placeholder="Guardian occupation *"
                            value={form.guardianOccupation}
                            onChange={(e) => update("guardianOccupation", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="step-navigation">
                        <button className="btn btn-secondary" onClick={back} disabled={loading}>
                          <ArrowLeft size={18} />
                          <span>Back</span>
                        </button>
                        <button
                          className="btn btn-primary"
                          disabled={!step3Valid || loading}
                          onClick={next}
                        >
                          <span>Review Application</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review Application */}
                  {step === 4 && (
                    <div className="step-panel">
                      <div className="step-header">
                        <Info size={24} />
                        <h2>Review Your Application Details</h2>
                      </div>

                      <p className="review-intro-note">
                        Please review all fields carefully before submitting. You can jump back to edit any section.
                      </p>

                      <div className="review-cards-list">
                        <div className="review-summary-card">
                          <div className="card-header">
                            <h3>Program Track</h3>
                            <button className="edit-shortcut-btn" onClick={() => jumpToStep(1)}>Edit</button>
                          </div>
                          <div className="card-body-details">
                            <p><strong>Chosen Program:</strong> {getSelectedProgram()?.name}</p>
                          </div>
                        </div>

                        <div className="review-summary-card">
                          <div className="card-header">
                            <h3>Personal Information</h3>
                            <button className="edit-shortcut-btn" onClick={() => jumpToStep(1)}>Edit</button>
                          </div>
                          <div className="card-body-details">
                            <p><strong>Full Name:</strong> {form.name}</p>
                            <p><strong>Date of Birth:</strong> {form.dob} ({form.age} years)</p>
                            <p><strong>Primary Phone:</strong> {countryCode} {form.phone}</p>
                            <p><strong>Email Address:</strong> {form.email}</p>
                            <p><strong>Residential Address:</strong> {form.houseName} House, {form.place}, PO {form.postOffice} - {form.zipCode}</p>
                            <p><strong>District & State:</strong> {form.district}, {form.state}</p>
                          </div>
                        </div>

                        <div className="review-summary-card">
                          <div className="card-header">
                            <h3>Academic History</h3>
                            <button className="edit-shortcut-btn" onClick={() => jumpToStep(2)}>Edit</button>
                          </div>
                          <div className="card-body-details">
                            <p><strong>Madrassa:</strong> {form.madrassaName} (Class Stopped: {form.classStopped})</p>
                            <p><strong>School/College:</strong> {form.schoolCollege} (Standard Stop/Studying: {form.standard})</p>
                            <p><strong>Languages:</strong> {form.languages.join(", ")} {form.languageOther ? `(${form.languageOther})` : ""}</p>
                            {program === "shareea" ? (
                              <>
                                <p><strong>Skills:</strong> {form.skills}</p>
                                <p><strong>Interests:</strong> {form.interests}</p>
                                <p><strong>Last Book Read:</strong> {form.lastBook}</p>
                                <p><strong>Career Goal:</strong> {form.careerNote}</p>
                                <p className="text-paragraph"><strong>Expectations:</strong> {form.expectations}</p>
                              </>
                            ) : (
                              <>
                                <p><strong>Arabic Reading:</strong> {form.arabicFluent}</p>
                                <p><strong>Hifz Before:</strong> {form.hifzBefore} {form.hifzAmount ? `(Juz: ${form.hifzAmount})` : ""}</p>
                                <p><strong>Skills:</strong> {form.thahfeezSkills}</p>
                                <p><strong>Interests:</strong> {form.thahfeezInterests}</p>
                                {form.thahfeezComments && <p className="text-paragraph"><strong>Comments:</strong> {form.thahfeezComments}</p>}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="review-summary-card">
                          <div className="card-header">
                            <h3>Guardian details</h3>
                            <button className="edit-shortcut-btn" onClick={() => jumpToStep(3)}>Edit</button>
                          </div>
                          <div className="card-body-details">
                            <p><strong>Guardian Name:</strong> {form.guardianName} ({form.guardianRelation})</p>
                            <p><strong>Contact phone:</strong> {countryCode} {form.guardianPhone}</p>
                            <p><strong>Email Address:</strong> {form.guardianEmail}</p>
                            <p><strong>Occupation:</strong> {form.guardianOccupation}</p>
                          </div>
                        </div>
                      </div>

                      {/* Confirmation Checkbox */}
                      <div className="confirmation-box-wrapper">
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={confirmationChecked}
                            onChange={(e) => setConfirmationChecked(e.target.checked)}
                          />
                          <span className="checkbox-box"></span>
                          <span className="checkbox-text font-bold">I hereby declare that all the information provided above is true and accurate to the best of my knowledge.</span>
                        </label>
                      </div>

                      {error && <div className="error-message">{error}</div>}

                      <div className="step-navigation">
                        <button className="btn btn-secondary" onClick={back} disabled={loading}>
                          <ArrowLeft size={18} />
                          <span>Back</span>
                        </button>
                        <button
                          className="btn btn-primary"
                          disabled={!confirmationChecked || loading}
                          onClick={submit}
                        >
                          {loading ? (
                            <>
                              <GraduationCap size={18} className="animate-pulse" />
                              <span>Submitting Application...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Application</span>
                              <ChevronRight size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {toast && !submittedApplicationId && (
        <Toast
          message="Application progress saved. Complete all steps to finish!"
          onClose={() => setToast(false)}
        />
      )}
      <Footer />
    </>
  );
}
