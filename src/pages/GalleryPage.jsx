import { Users, Star, Crown, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import "./GalleryPage.css";

const GalleryPage = ({
    weddingCards,
    filteredCards,
    activeFilter,
    setActiveFilter,
    handleCustomize
}) => {
    const navigate = useNavigate();

    // Dynamically get all unique categories from weddingCards
    const categories = useMemo(() => {
        const uniqueCategories = new Set(weddingCards.map(card => card.theme));
        return ['All', ...Array.from(uniqueCategories).sort()];
    }, [weddingCards]);

    return (
        <div className="gallery-page">
            {/* Hero Section */}
            <section className="gallery-hero">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">Wedding Card Collection</h1>
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
                    <div className="filter-container">
                        {categories.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                            >
                                {filter}
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
                            <div className="stat-value stat-value-amber">{categories.length - 1}</div>
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
                            <div
                                key={card.id}
                                className="wedding-card"
                                onClick={() => {
                                    handleCustomize(card);
                                    navigate("/customize");
                                }}
                            >
                                <div className="wedding-card-inner">
                                    <div className="card-image-wrapper">
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="card-image"
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
                                            <div
                                                className="color-dot"
                                                style={{ backgroundColor: card.colorHex }}
                                            />
                                        </div>
                                        <div className="card-footer">
                                            <span className="card-theme">{card.theme}</span>
                                            <span className="card-price">
                                                ${card.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                onClick={() => setActiveFilter("All")}
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
