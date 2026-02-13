import { useNavigate } from "react-router-dom";
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
    CheckCircleFill
} from "react-bootstrap-icons";


const HomePage = ({
    customization,
    weddingCards,
    setActiveFilter
}) => {
    const navigate = useNavigate();
    const [heroImage, setHeroImage] = useState(null);

    useEffect(() => {
        const savedImage = localStorage.getItem("recentPurchaseImage");
        if (savedImage) {
            setHeroImage(savedImage);
            // Optional: Clear after showing once? Or keep it? keeping it for now seems best.
        }
    }, []);

    const scroll = (direction) => {
        const container = document.getElementById("categoryScroll");
        const scrollAmount = 300;

        if (direction === "left") {
            container.scrollLeft -= scrollAmount;
        } else {
            container.scrollLeft += scrollAmount;
        }
    };

    return (
        <div className="homepage-wrapper">
            <section className="hero-outer-wrapper">
                <div className="container">
                    {/* 2. Overall Container - Hero Card */}
                    <div className="hero-card-container">
                        {/* 4. Header Inside Hero Card */}
                        <header className="hero-internal-header">
                            <div className="logo" onClick={() => navigate("/")}>
                                <EnvelopePaper className="icon-logo" />
                                <span>DreamInvites</span>
                            </div>
                            <nav className="hero-nav">
                                <a href="#">Home</a>
                                <a href="#templates">Wedding Cards</a>
                                <a href="#">Features</a>
                                <a href="#how-it-works">How It Works</a>
                                <a href="#">Contact</a>
                            </nav>
                            <div className="hero-header-actions">
                                <button onClick={() => navigate("/gallery")} className="btn btn-sm btn-light">
                                    Browse Cards
                                </button>
                                <button className="btn btn-sm btn-outline">
                                    Sign In
                                </button>
                            </div>
                        </header>

                        {/* 3. Internal Grid Layout */}
                        <div className="hero-card-inner">
                            {/* 5. Left Content Block (55%) */}
                            <div className="hero-left-content">
                                <h1 className="hero-headline">
                                    Beautiful Wedding Invitations,<br />
                                    <span className="accent-text">Made Effortless</span>
                                </h1>
                                <p className="hero-subheading">
                                    Choose a design, personalize every detail, and download your invitation instantly — no design skills required.
                                </p>
                                <button onClick={() => navigate("/gallery")} className="btn btn-md btn-primary">
                                    Start Designing
                                </button>
                            </div>

                            {/* 6. Right Visual Block (45%) */}
                            <div className="hero-right-visual">
                                {/* Decorative Elements */}
                                <div className="deco-shape deco-rect"></div>
                                <div className="deco-shape deco-square"></div>

                                <div className="hero-card-visual">
                                    {heroImage ? (
                                        <div className="purchased-preview-wrapper">
                                            <img
                                                src={heroImage}
                                                alt="Recently Purchased"
                                                className="purchased-card-image"
                                            />
                                            <div className="success-badge-float">
                                                <CheckCircleFill /> <span>Order Confirmed</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="paper-card-mockup">
                                            <div className="paper-card-content">
                                                <div className="card-decoration"></div>
                                                <h3 className="card-names">
                                                    {customization.groomName} & {customization.brideName}
                                                </h3>
                                                <p className="card-date">{customization.weddingDate}</p>
                                                <p className="card-venue">{customization.venue}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="page-container">
                {/* Animated Background Elements - Preserved */}
                <div className="background-elements">
                    <div className="bg-circle bg-circle-1"></div>
                    <div className="bg-circle bg-circle-2"></div>
                    <div className="bg-circle bg-circle-3"></div>
                    <div className="bg-circle bg-circle-4"></div>
                </div>

                {/* 6.3 Category Section */}
                <section id="categories" className="category-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Explore Categories</h2>
                            <p className="section-description">Find the theme that perfectly matches your wedding style.</p>
                        </div>

                        <div className="category-wrapper">
                            <button className="scroll-btn left" onClick={() => scroll("left")}>
                                <ChevronLeft />
                            </button>

                            <div className="category-scroll" id="categoryScroll">
                                {[
                                    { name: "Traditional", image: "https://i.postimg.cc/zfLjQGXx/Gemini-Generated-Image-ztmckztmckztmckz.png" },
                                    { name: "Modern", image: "https://i.postimg.cc/kGDK2j62/Gemini-Generated-Image-bggm3dbggm3dbggm.png" },
                                    { name: "Royal", image: "https://i.postimg.cc/mgTMM2Hb/Gemini-Generated-Image-uz9j5xuz9j5xuz9j.png" },
                                    { name: "Minimal", image: "https://i.postimg.cc/50mWXgd2/Gemini-Generated-Image-vfh2gbvfh2gbvfh2.png" },
                                    { name: "Vintage", image: "https://i.postimg.cc/WzfKZf9h/Gemini-Generated-Image-87mxx687mxx687mx.png" },
                                    { name: "Boho", image: "https://i.postimg.cc/Ghyzz2t7/Gemini-Generated-Image-y0ax7by0ax7by0ax.png" },
                                    { name: "Rustic", image: "https://i.postimg.cc/vmvcHnz3/Gemini-Generated-Image-crf3ulcrf3ulcrf3.png" },
                                    { name: "Art Deco", image: "https://i.postimg.cc/kML8HxhJ/Gemini-Generated-Image-mbs575mbs575mbs5.png" },
                                    { name: "Floral", image: "https://i.postimg.cc/yNrWZHMF/Gemini-Generated-Image-m9jjnum9jjnum9jj.png" },
                                    { name: "Geometric", image: "https://i.postimg.cc/fRqMHv8s/Gemini-Generated-Image-ty84exty84exty84.png" },
                                    { name: "Hindu", image: "https://i.postimg.cc/Y2dDLy0K/Gemini-Generated-Image-j8d7i7j8d7i7j8d7.png" },
                                    { name: "Muslim", image: "https://i.postimg.cc/ydb9s96H/Gemini-Generated-Image-p30o08p30o08p30o.png" },
                                ].map((cat) => (
                                    <div
                                        key={cat.name}
                                        className="category-card"
                                        onClick={() => {
                                            setActiveFilter(cat.name);
                                            navigate("/gallery");
                                        }}
                                    >
                                        <img
                                            src={cat.image || `https://placehold.co/600x600/f8f4e9/8B4513?text=${cat.name}`}
                                            alt={cat.name}
                                            loading="lazy"
                                        />
                                        <div className="overlay">
                                            <span>{cat.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="scroll-btn right" onClick={() => scroll("right")}>
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 6.5 How It Works */}
                <section id="how-it-works" className="how-it-works">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">How It Works</h2>
                            <p className="section-description">Three simple steps to your perfect invitation.</p>
                        </div>
                        <div className="steps-grid">
                            {[
                                { icon: Palette, title: "Choose a Design", desc: "Select from our curated premium templates." },
                                { icon: PencilSquare, title: "Edit Text & Colors", desc: "Personalize every detail with our easy editor." },
                                { icon: CloudDownload, title: "Download & Share", desc: "Get high-quality PDF or share digitally." }
                            ].map((step, idx) => (
                                <div key={idx} className="step-item-alt">
                                    <div className="step-icon-wrapper">
                                        <step.icon className="icon-md" />
                                    </div>
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6.6 Editor Preview */}
                <section className="editor-preview-section">
                    <div className="container">
                        <div className="editor-preview-card">
                            <div className="editor-mockup">
                                <div className="editor-sidebar">
                                    <div className="sidebar-tool active"><Palette /></div>
                                    <div className="sidebar-tool"><PencilSquare /></div>
                                    <div className="sidebar-tool"><EnvelopePaper /></div>
                                </div>
                                <div className="editor-canvas">
                                    <div className="canvas-card">
                                        <p className="canvas-names">Sophia & Alexander</p>
                                        <p className="canvas-date">Saturday, June 15, 2026</p>
                                    </div>
                                </div>
                                <div className="editor-controls">
                                    <div className="control-group">
                                        <label>Font Size</label>
                                        <div className="dummy-slider"></div>
                                    </div>
                                    <div className="control-group">
                                        <label>Text Color</label>
                                        <div className="dummy-colors">
                                            <div className="color-dot active"></div>
                                            <div className="color-dot"></div>
                                            <div className="color-dot"></div>
                                        </div>
                                    </div>
                                    <button className="btn btn-md btn-primary btn-full">Save Changes</button>
                                </div>
                            </div>
                            <div className="editor-preview-text">
                                <h2 className="section-title">Powerful Yet Simple Editor</h2>
                                <p className="section-description">
                                    Our intuitive editor gives you full control. Change fonts, move elements, adjust colors, and see your changes in real-time.
                                </p>
                                <ul className="feature-list">
                                    <li><Stars className="icon-xs" /> Dynamic Text Editing</li>
                                    <li><Stars className="icon-xs" /> Custom Color Palettes</li>
                                    <li><Stars className="icon-xs" /> High-Resolution Exports</li>
                                </ul>
                                <button onClick={() => navigate("/gallery")} className="btn btn-lg btn-primary">
                                    Try the Editor Now
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6.4 Featured Card Templates */}
                <section id="templates" className="featured-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Featured Designs</h2>
                            <p className="section-description">
                                Handcrafted by master designers, each card represents the pinnacle of elegance.
                            </p>

                            <div className="premium-count-badge">
                                <Gem className="icon-sm" />
                                <span>120+ Premium Designs</span>
                            </div>
                        </div>

                        {/* Preserved featured designs logic, just updated look slightly */}
                        <div className="featured-cards-grid">
                            {weddingCards.slice(0, 4).map((card) => (
                                <div key={card.id} className="featured-template-card" onClick={() => navigate(`/editor/${card.name}`)}>
                                    <div className="template-image-wrapper">
                                        <img src={card.image} alt={card.name} />
                                        <div className="template-overlay">
                                            <span className="edit-btn">Edit This Card</span>
                                        </div>
                                    </div>
                                    <div className="template-details">
                                        <h3>{card.name}</h3>
                                        <span className="template-theme">{card.theme}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="view-all-cta">
                            <button onClick={() => navigate("/gallery")} className="btn btn-md btn-outline">
                                View Full Collection <ChevronRight />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Testimonial - Preserved */}
                <div className="container">
                    <div className="testimonial-card">
                        <div className="testimonial-content">
                            <div className="star-rating">
                                {[...Array(5)].map((_, i) => (
                                    <StarFill key={i} className="star-icon" />
                                ))}
                            </div>

                            <blockquote className="testimonial-quote">
                                "Our wedding cards were absolutely stunning! The quality exceeded our expectations."
                            </blockquote>

                            <p className="testimonial-author">
                                — Emma & James, London
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="main-footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <div className="logo">
                            <EnvelopePaper className="icon-logo" />
                            <span>DreamInvites</span>
                        </div>
                        <p>Creating beautiful memories, one invitation at a time.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Explore</h4>
                        <a href="#templates">Templates</a>
                        <a href="#categories">Categories</a>
                        <a href="#how-it-works">Process</a>
                    </div>
                    <div className="footer-links">
                        <h4>Support</h4>
                        <a href="#">FAQ</a>
                        <a href="#">Contact Us</a>
                        <a href="#">Shipping</a>
                    </div>
                    <div className="footer-social">
                        <h4>Follow Us</h4>
                        <div className="social-icons">
                            <Globe />
                            <Share />
                            <HeartFill />
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 DreamInvites. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
