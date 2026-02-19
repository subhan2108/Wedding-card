import { Users, Star, Crown, Flower2, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { SkeletonCard } from "../components/common/Skeleton";
import "./GalleryPage.css";

const GalleryCard = ({ card, onCustomize }) => {
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);

    // Normalize variants: use card.variants if available, otherwise fallback to single card properties
    const variants = card.variants && card.variants.length > 0
        ? card.variants
        : [{
            id: 'default',
            colorHex: card.colorHex,
            previewImage: card.image || card.previewImage
        }];

    const activeVariant = variants[activeVariantIndex] || variants[0];

    // Use variant image, falling back to card's main image if variant image is missing
    const displayImage = activeVariant.previewImage || card.image || card.previewImage;

    const handleColorClick = (e, index) => {
        e.stopPropagation(); // Prevent card click when selecting color
        setActiveVariantIndex(index);
    };

    return (
        <div
            className="wedding-card"
            onClick={() => onCustomize(card, activeVariantIndex)}
        >
            <div className="wedding-card-inner">
                <div className="card-image-wrapper">
                    <img
                        src={displayImage}
                        alt={card.name}
                        className="card-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            // Fallback if URL is broken
                            if (card.image && e.target.src !== card.image) {
                                e.target.src = card.image;
                            }
                        }}
                    />
                    <div className="card-overlay"></div>

                    {/* Badges */}
                    <div className="card-badges">
                        {card.popular && (
                            <div className="badge badge-popular">
                                <Star className="icon-xs" />
                                <span>Popular</span>
                            </div>
                        )}
                        {card.premium && (
                            <div className="badge badge-premium">
                                <Crown className="icon-xs" />
                                <span>Premium</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-details">
                    <h3 className="card-name">{card.name}</h3>
                    <p className="card-tagline">{card.theme || card.category}</p>

                    <div className="card-meta">
                        <div className="color-dots-container">
                            {variants.map((variant, idx) => (
                                <div
                                    key={variant.id || idx}
                                    className={`color-dot ${activeVariantIndex === idx ? 'active' : ''}`}
                                    style={{ backgroundColor: variant.colorHex }}
                                    onClick={(e) => handleColorClick(e, idx)}
                                    title={variant.colorHex}
                                />
                            ))}
                        </div>
                        <span className="card-price">
                            ${(card.price || 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const CATEGORIES = {
    'Wedding': ['Floral', 'Modern', 'Minimal', 'Premium', 'Traditional', 'Vintage', 'Boho', 'Rustic', 'Classic'],
    'Birthday': ['Kids', 'Teens', 'Adults', 'Milestone', 'Surprise', 'Fun', 'Elegant'],
    'Funeral': ['Traditional', 'Religious', 'Modern', 'Simple', 'Floral', 'Obituary'],
    'Party': ['Dinner', 'Cocktail', 'House Party', 'Pool Party', 'Graduation'],
    'Baby Shower': ['Boy', 'Girl', 'Neutral', 'Twins']
};

const GalleryPage = ({
    weddingCards,
    filteredCards,
    activeCategory,
    setActiveCategory,
    activeSubCategory,
    setActiveSubCategory,
    activeLanguage,
    setActiveLanguage,
    activeSymbol,
    setActiveSymbol,
    handleCustomize,
    loading
}) => {
    const navigate = useNavigate();
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (name) => {
        if (activeDropdown === name) setActiveDropdown(null);
        else setActiveDropdown(name);
    };

    // Close dropdowns when clicking outside (simple implementation: click on page closes it)
    // For specialized behavior, a click listener on document body would be better, but this suffices for now if we add an overlay or handle it in the container.
    // Actually, let's just use the toggle logic on the button.

    const languages = ['All', 'English', 'Hindi', 'Urdu', 'Mixed'];
    const symbols = ['All', 'Om', 'Ganesha', 'Moon', 'Floral', 'Bismillah', 'Khanda', 'Cross'];

    // Determine available main categories from data + constant
    const mainCategories = ['All', ...Object.keys(CATEGORIES)];

    // Determine subcategories based on active main category (remove 'All' prefix)
    const subCategories = activeCategory && activeCategory !== 'All'
        ? (CATEGORIES[activeCategory] || [])
        : [];

    const onCardCustomize = (card, variantIndex) => {
        handleCustomize(card);
        navigate("/customize", { state: { initialVariantIndex: variantIndex } });
    };

    // Add scroll shadow effect
    useEffect(() => {
        const handleScroll = () => {
            const filter = document.querySelector(".filter-section");
            if (!filter) return;

            if (window.scrollY > 10) {
                filter.classList.add("scrolled");
            } else {
                filter.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="gallery-page">
            {/* Hero Section */}
            <section className="gallery-hero">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">Design Collection</h1>
                        <p className="section-description">
                            Discover {weddingCards.length}+ handcrafted designs, each created to make your special day truly unforgettable.
                        </p>
                        <div className="design-count-badge">
                            <Users className="icon-sm" />
                            <span>{weddingCards.length} Premium Designs</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="filter-section">
                <div className="container">
                    <div className="filter-row">
                        {/* Main Categories (Left) */}
                        <div className="filter-container main-categories">
                            {mainCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        setActiveSubCategory('All'); // Reset subcategory
                                    }}
                                    className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Dropdown Filters (Right) */}
                        <div className="filter-actions">
                            {/* Language Dropdown */}
                            <div className="dropdown-wrapper">
                                <button
                                    className={`filter-dropdown-btn ${activeDropdown === 'language' ? 'active' : ''}`}
                                    onClick={() => toggleDropdown('language')}
                                >
                                    <span>{activeLanguage === 'All' ? 'Language' : activeLanguage}</span>
                                    <ChevronDown className={`dropdown-arrow ${activeDropdown === 'language' ? 'rotate' : ''}`} size={16} />
                                </button>
                                {activeDropdown === 'language' && (
                                    <div className="dropdown-menu">
                                        {languages.map((lang) => (
                                            <div
                                                key={lang}
                                                className={`dropdown-item ${activeLanguage === lang ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setActiveLanguage(lang);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <span>{lang}</span>
                                                {activeLanguage === lang && <Check size={14} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Symbol Dropdown */}
                            <div className="dropdown-wrapper">
                                <button
                                    className={`filter-dropdown-btn ${activeDropdown === 'symbol' ? 'active' : ''}`}
                                    onClick={() => toggleDropdown('symbol')}
                                >
                                    <span>{activeSymbol === 'All' ? 'Symbols' : activeSymbol}</span>
                                    <ChevronDown className={`dropdown-arrow ${activeDropdown === 'symbol' ? 'rotate' : ''}`} size={16} />
                                </button>
                                {activeDropdown === 'symbol' && (
                                    <div className="dropdown-menu right-aligned">
                                        {symbols.map((sym) => (
                                            <div
                                                key={sym}
                                                className={`dropdown-item ${activeSymbol === sym ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setActiveSymbol(sym);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <span>{sym}</span>
                                                {activeSymbol === sym && <Check size={14} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sub Categories (Row 2 if active) */}
                    {activeCategory !== 'All' && subCategories.length > 0 && (
                        <div className="filter-container sub-categories">
                            <button
                                onClick={() => setActiveSubCategory('All')}
                                className={`filter-btn sm ${activeSubCategory === 'All' ? "active" : ""}`}
                            >
                                All
                            </button>
                            {subCategories.map((sub) => (
                                <button
                                    key={sub}
                                    onClick={() => setActiveSubCategory(sub)}
                                    className={`filter-btn sm ${activeSubCategory === sub ? "active" : ""}`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Stats */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value stat-value-rose">
                                {filteredCards.length}
                            </div>
                            <div className="stat-label">Available Designs</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value stat-value-amber">{Math.max(0, mainCategories.length - 1)}</div>
                            <div className="stat-label">Design Categories</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value stat-value-purple">10</div>
                            <div className="stat-label">Color Palettes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value stat-value-green">50K+</div>
                            <div className="stat-label">Happy Couples</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cards Grid */}
            <section className="cards-section">
                <div className="container">
                    <div className="cards-grid">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))
                        ) : (
                            filteredCards.map((card) => (
                                <GalleryCard
                                    key={card.id}
                                    card={card}
                                    onCustomize={onCardCustomize}
                                />
                            ))
                        )}
                    </div>

                    {/* Empty State */}
                    {filteredCards.length === 0 && !loading && (
                        <div className="empty-state">
                            <Flower2 className="empty-icon" />
                            <h3 className="empty-title">No designs found</h3>
                            <p className="empty-description">
                                Try selecting a different category or view all designs.
                            </p>
                            <button
                                onClick={() => {
                                    setActiveCategory("All");
                                    setActiveLanguage("All");
                                    setActiveSymbol("All");
                                }}
                                className="btn btn-primary"
                            >
                                View All Designs
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Trust Strip */}
            <section className="trust-strip-section">
                <div className="container">
                    <div className="trust-strip-content">
                        <div className="trust-strip-item">
                            <Check size={16} />
                            <span>Secure Payment</span>
                        </div>
                        <div className="trust-strip-item">
                            <Check size={16} />
                            <span>Instant Download</span>
                        </div>
                        <div className="trust-strip-item">
                            <Check size={16} />
                            <span>Premium Quality</span>
                        </div>
                        <div className="trust-strip-item">
                            <Check size={16} />
                            <span>50,000+ Happy Couples</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GalleryPage;
