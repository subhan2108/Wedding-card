import { useNavigate } from "react-router-dom";
import { PlayCircle, Check, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import "./HomePage.css";
import {
    StarFill,
    ChevronRight,
    ChevronLeft,
    EnvelopePaper,
    Palette,
    CloudDownload,
    Share,
    ShieldCheck,
    Globe,
    HeartFill,
    Truck,
    Calendar3,
    GeoAlt,
    Gem,
    Stars,
    PencilSquare,
    CheckCircleFill,
    ChevronDown
} from "react-bootstrap-icons";
import { Skeleton, SkeletonText, SkeletonCard } from "../components/common/Skeleton";


const HomePage = ({
    customization,
    weddingCards,
    setActiveCategory,
    setActiveSubCategory,
    loading
}) => {
    const navigate = useNavigate();
    const [heroImage, setHeroImage] = useState(() => {
        try {
            return localStorage.getItem("recentPurchaseImage");
        } catch (e) {
            console.warn("Failed to retrieve image", e);
            return null;
        }
    });

    const categoryCards = [
        { name: "Wedding", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800", theme: "Celebrate Love" },
        { name: "Birthday", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800", theme: "Mark the Milestone" },
        { name: "Funeral", image: "https://images.unsplash.com/photo-1495754149474-e54c07932677?auto=format&fit=crop&q=80&w=800", theme: "In Loving Memory" },
        { name: "Party", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800", theme: "Let's Celebrate" }
    ];

    return (
        <div className="homepage-wrapper">
            <section className="hero-outer-wrapper">
                <div className="container">
                    <div className="hero-grid">
                        {/* Left Content */}
                        <div className="hero-content-left">
                            {loading ? (
                                <>
                                    <Skeleton width="150px" height="30px" borderRadius="20px" style={{ marginBottom: '1rem' }} />
                                    <SkeletonText lines={2} style={{ marginBottom: '1.5rem', height: '3rem' }} />
                                    <SkeletonText lines={3} style={{ marginBottom: '2rem' }} />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <Skeleton width="160px" height="50px" borderRadius="30px" />
                                        <Skeleton width="160px" height="50px" borderRadius="30px" />
                                    </div>
                                    <div style={{ marginTop: '2rem' }}>
                                        <Skeleton width="200px" height="20px" />
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            <Skeleton width="40px" height="40px" borderRadius="50%" />
                                            <Skeleton width="40px" height="40px" borderRadius="50%" />
                                            <Skeleton width="40px" height="40px" borderRadius="50%" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="badge-pill">
                                        <span className="badge-dot"></span>
                                        <span className="badge-text">Premium Invitations</span>
                                    </div>

                                    <h1 className="hero-title-large">
                                        Craft Your Perfect <br />
                                        <span className="text-gradient">Dream Card</span>
                                    </h1>

                                    <p className="hero-desc-large">
                                        Design elegant, digital-first invitations in minutes. Choose from hundreds of premium templates or create your own from scratch.
                                    </p>

                                    <div className="hero-cta-group">
                                        <button onClick={() => { setActiveCategory("All"); navigate("/gallery"); }} className="btn-pill-primary">
                                            Browse Designs
                                        </button>
                                        <button className="btn-pill-secondary">
                                            <PlayCircle size={20} />
                                            Watch Demo
                                        </button>
                                    </div>

                                    <div className="trust-signals-row">
                                        <p className="trust-text">Trusted by 10,000+ couples worldwide</p>
                                        <div className="trust-logos">
                                            <div className="logo-placeholder"></div>
                                            <div className="logo-placeholder"></div>
                                            <div className="logo-placeholder"></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right Visual (3D Card) */}
                        <div className="hero-visual-right">
                            {loading ? (
                                <Skeleton width="100%" height="450px" borderRadius="20px" />
                            ) : (
                                <>
                                    <div className="card-3d-wrapper">
                                        <img
                                            src={heroImage || "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=800"}
                                            alt="Invitation"
                                            className="card-3d-image"
                                        />
                                        {heroImage ? null : (
                                            <div className="card-3d-overlay">
                                                <p className="overlay-names">
                                                    {customization?.groomName || "Sarah"} & {customization?.brideName || "James"}
                                                </p>
                                                <p className="overlay-date">
                                                    {customization?.weddingDate || "September 12, 2024"} • {customization?.venue?.split(",")[0] || "New York"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Floating Status Card */}
                                    <div className="floating-status-card">
                                        <div className="status-icon-box">
                                            <Check size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>RSVP Status</p>
                                            <p style={{ fontWeight: "bold", color: "#111827" }}>Confirmed</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Visual Category Section Cards */}
            <div className="discovery-section" id="discovery">
                <div className="container">
                    <div className="discovery-header text-center">
                        <h2 className="discovery-title">Explore by Occasion</h2>
                        <p className="discovery-subtext">Select an event to browse tailored designs.</p>
                    </div>

                    <div className="featured-grid-polished" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))
                        ) : (
                            categoryCards.map((cat) => (
                                <div
                                    key={cat.name}
                                    className="design-card-polished"
                                    onClick={() => {
                                        setActiveCategory(cat.name);
                                        setActiveSubCategory("All");
                                        navigate("/gallery");
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="design-image-container" style={{ height: '280px' }}>
                                        <img src={cat.image} alt={cat.name} />
                                        <div className="card-overlay-gradient">
                                            {/* Optional Overlay Content */}
                                        </div>
                                    </div>
                                    <div className="template-details text-center">
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{cat.name}</h3>
                                        <p className="template-theme" style={{ fontSize: '0.85rem' }}>{cat.theme}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="text-center mt-5">
                        <button
                            onClick={() => { setActiveCategory("All"); navigate("/gallery"); }}
                            className="btn-pill-secondary"
                        >
                            View All Categories <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Expanded How It Works Section */}
            <section className="hiw-section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-description">Design, personalize, and receive your invitation in just a few steps.</p>
                    </div>

                    <div className="hiw-steps-horizontal">
                        {/* Step 1 */}
                        <div className="hiw-step-card">
                            <div className="hiw-icon">
                                <Palette size={24} />
                            </div>
                            <h3 className="hiw-card-title">Choose a Template</h3>
                            <p className="hiw-card-desc">Browse hundreds of curated designs categorized by style, culture, and theme.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="hiw-step-card">
                            <div className="hiw-icon">
                                <PencilSquare size={24} />
                            </div>
                            <h3 className="hiw-card-title">Personalize</h3>
                            <p className="hiw-card-desc">Edit text, fonts, colors, add symbols, and adjust layout in real time.</p>
                            <div className="hiw-preview-mini">
                                Write in Hinglish → Auto Convert
                            </div>
                        </div>
                        {/* Step 3 */}
                        <div className="hiw-step-card">
                            <div className="hiw-icon">
                                <Calendar3 size={24} />
                            </div>
                            <h3 className="hiw-card-title">Review 4 Pages</h3>
                            <p className="hiw-card-desc">Edit Cover, Event Details, Family Details, and RSVP pages.</p>
                        </div>
                        {/* Step 4 */}
                        <div className="hiw-step-card">
                            <div className="hiw-icon">
                                <CloudDownload size={24} />
                            </div>
                            <h3 className="hiw-card-title">Download or Print</h3>
                            <p className="hiw-card-desc">Export high-resolution PDF or order printed invitations delivered to your door.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Editor Feature Showcase */}
            <section className="editor-showcase-section">
                <div className="container">
                    <div className="editor-showcase-container">
                        {/* Left Mock */}
                        <div className="editor-mock-improved">
                            <div className="mock-tabs">
                                <div className="mock-tab active">Page 1</div>
                                <div className="mock-tab">Page 2</div>
                                <div className="mock-tab">Page 3</div>
                                <div className="mock-tab">Page 4</div>
                            </div>
                            <div className="mock-workspace">
                                <div className="mock-canvas">
                                    <div className="mock-paper">
                                        <h4 style={{ fontFamily: 'Playfair Display', margin: '2rem 0 1rem' }}>Amit & Priya</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Request the honor of your presence...</p>
                                    </div>
                                </div>
                                <div className="mock-sidebar-right">
                                    <div className="lang-panel-title">Smart Language Conversion</div>
                                    <div className="lang-toggle">
                                        <span>Input</span> <strong>Hinglish</strong>
                                    </div>
                                    <div className="lang-toggle">
                                        <span>Output</span> <strong>Hindi</strong>
                                    </div>
                                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#2563eb' }}>
                                        Auto converting...
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Text */}
                        <div className="editor-features-list">
                            <h2 className="section-title-md">Powerful Yet Simple Editor</h2>
                            <p className="section-description" style={{ textAlign: 'left', margin: '0 0 2rem' }}>
                                Write in Hinglish and instantly convert into pure Hindi, Urdu, or English with correct script formatting.
                            </p>

                            {[
                                "Real-time text editing",
                                "Custom font selection",
                                "Symbol & religious icon library",
                                "Dynamic color palettes",
                                "4-page structured editing",
                                "Auto-save system"
                            ].map(feat => (
                                <div key={feat} className="feature-check-item">
                                    <CheckCircleFill className="check-circle" /> {feat}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Conversion Banners */}
                    <div className="delivery-promise-banner">
                        <Truck size={20} /> Order within 48 hours to receive by March 15
                    </div>
                    <div className="trust-strip-simple">
                        <span><ShieldCheck size={14} style={{ verticalAlign: 'middle' }} /> SSL Secure</span>
                        <span><HeartFill size={14} style={{ verticalAlign: 'middle' }} /> 10,000+ Couples</span>
                        <span><Gem size={14} style={{ verticalAlign: 'middle' }} /> High Quality Print Guarantee</span>
                    </div>
                </div>
            </section>

            {/* 5. Featured Designs (Polished) */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Designs</h2>
                        <div className="premium-count-badge">
                            <Gem className="icon-sm" />
                            <span>120+ Premium Designs</span>
                        </div>
                    </div>

                    <div className="featured-grid-polished">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))
                        ) : (
                            weddingCards.slice(0, 4).map((card) => (
                                <div key={card.id} className="design-card-polished" onClick={() => navigate(`/editor/${card.name}`)}>
                                    <div className="design-image-container">
                                        <img src={card.image} alt={card.name} />
                                        <div className="card-overlay-gradient">
                                            <button className="btn-pill-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Edit This Card</button>
                                        </div>
                                    </div>
                                    <div className="template-details">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3>{card.name}</h3>
                                            <span style={{ fontSize: '0.75rem', background: '#FFF8E1', color: '#B7950B', padding: '2px 8px', borderRadius: '10px' }}>Premium</span>
                                        </div>
                                        <p className="template-theme">{card.theme}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="view-all-cta">
                        <button onClick={() => navigate("/gallery")} className="btn btn-md btn-outline">
                            View Full Collection <ChevronRight />
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. Testimonials */}
            <div className="container" style={{ paddingBottom: '6rem' }}>
                <div className="testimonial-glass-card">
                    <div className="star-rating">
                        {[...Array(5)].map((_, i) => (
                            <StarFill key={i} className="star-icon" />
                        ))}
                    </div>
                    <blockquote className="testimonial-quote">
                        "The smart language feature saved us so much time! The cards looked absolutely professional."
                    </blockquote>
                    <p className="testimonial-author">— Rahul & Simran, Mumbai</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
