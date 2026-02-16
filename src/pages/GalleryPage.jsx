import { Users, Star, Crown, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
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

                    {/* Hover */}
                    <div className="card-hover-overlay">
                        <button className="btn btn-primary">
                            Customize
                        </button>
                    </div>
                </div>

                <div className="card-details">
                    <div className="card-header">
                        <h3 className="card-name">{card.name}</h3>
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
                    </div>
                    <div className="card-footer">
                        <span className="card-theme">{card.theme || card.category}</span>
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
    handleCustomize
}) => {
    const navigate = useNavigate();

    // Determine available main categories from data + constant
    const mainCategories = ['All', ...Object.keys(CATEGORIES)];

    // Determine subcategories based on active main category
    const subCategories = activeCategory && activeCategory !== 'All'
        ? ['All', ...(CATEGORIES[activeCategory] || [])]
        : [];

    const onCardCustomize = (card, variantIndex) => {
        handleCustomize(card);
        navigate("/customize", { state: { initialVariantIndex: variantIndex } });
    };

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
                    {/* Main Categories */}
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

                    {/* Sub Categories (conditionally rendered) */}
                    {activeCategory !== 'All' && subCategories.length > 0 && (
                        <div className="filter-container sub-categories" style={{ marginTop: '16px', justifyContent: 'center', gap: '8px' }}>
                            {subCategories.map((sub) => (
                                <button
                                    key={sub}
                                    onClick={() => setActiveSubCategory(sub)}
                                    className={`filter-btn sm ${activeSubCategory === sub ? "active" : ""}`}
                                    style={{
                                        padding: '6px 16px',
                                        fontSize: '0.9rem',
                                        backgroundColor: activeSubCategory === sub ? 'var(--primary)' : 'var(--bg-secondary)',
                                        color: activeSubCategory === sub ? 'white' : 'var(--text-secondary)',
                                        border: '1px solid var(--border-soft)'
                                    }}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Language Filter */}
                    <div className="filter-container language-filters" style={{ marginTop: '16px', justifyContent: 'center', gap: '8px', display: 'flex' }}>
                        <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '8px' }}>Language:</span>
                        {['All', 'English', 'Hindi', 'Urdu', 'Mixed'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveLanguage(lang)}
                                className={`filter-btn sm ${activeLanguage === lang ? "active" : ""}`}
                                style={{
                                    padding: '6px 16px',
                                    fontSize: '0.9rem',
                                    backgroundColor: activeLanguage === lang ? 'var(--primary-dark)' : 'transparent',
                                    color: activeLanguage === lang ? 'white' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-soft)',
                                    borderRadius: '20px'
                                }}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    {/* Symbol Filter */}
                    <div className="filter-container symbol-filters" style={{ marginTop: '16px', justifyContent: 'center', gap: '8px', display: 'flex' }}>
                        <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '8px' }}>Symbols:</span>
                        {['All', 'Om', 'Ganesha', 'Moon', 'Floral', 'Bismillah', 'Khanda', 'Cross'].map((sym) => (
                            <button
                                key={sym}
                                onClick={() => setActiveSymbol(sym)}
                                className={`filter-btn sm ${activeSymbol === sym ? "active" : ""}`}
                                style={{
                                    padding: '6px 16px',
                                    fontSize: '0.9rem',
                                    backgroundColor: activeSymbol === sym ? 'var(--primary-dark)' : 'transparent',
                                    color: activeSymbol === sym ? 'white' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-soft)',
                                    borderRadius: '20px'
                                }}
                            >
                                {sym}
                            </button>
                        ))}
                    </div>
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
                        {filteredCards.map((card) => (
                            <GalleryCard
                                key={card.id}
                                card={card}
                                onCustomize={onCardCustomize}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredCards.length === 0 && (
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
        </div>
    );
};

export default GalleryPage;
