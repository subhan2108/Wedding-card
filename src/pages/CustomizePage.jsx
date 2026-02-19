import {
  Share2,
  Heart,
  Download,
  Printer,
  ShoppingCart,
  Gift,
  Clock,
  Crown,
  Check
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Skeleton, SkeletonText } from "../components/common/Skeleton";
import "./CustomizePage.css";

const CustomizePage = ({
  selectedCard,
  customization,
  setCustomization,
  addToCart,
  loading
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeVariantIndex, setActiveVariantIndex] = useState(location.state?.initialVariantIndex || 0);

  // Fallback if selectedCard is not available yet (e.g. reload on this page)
  // In a real app, we might need to fetch data or redirect.
  // Fallback if selectedCard is not available yet or loading
  if (loading || !selectedCard) {
    return (
      <div className="customize-page-split">
        {/* LEFT SIDE - Skeleton */}
        <div className="customize-left">
          <div className="preview-actions" style={{ gap: '10px', display: 'flex' }}>
            <Skeleton width="90px" height="36px" borderRadius="20px" />
            <Skeleton width="90px" height="36px" borderRadius="20px" />
          </div>

          <div className="card-preview-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Skeleton width="400px" height="560px" borderRadius="4px" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          </div>
        </div>

        {/* RIGHT SIDE - Skeleton */}
        <div className="customize-right">
          <div className="customize-sidebar">
            <SkeletonText lines={1} style={{ height: '40px', marginBottom: '8px', width: '80%' }} />
            <SkeletonText lines={1} style={{ height: '20px', marginBottom: '24px', width: '40%' }} />

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <Skeleton width="60px" height="60px" borderRadius="8px" />
              <Skeleton width="60px" height="60px" borderRadius="8px" />
              <Skeleton width="60px" height="60px" borderRadius="8px" />
            </div>

            <div className="divider" style={{ margin: '2rem 0' }}></div>

            <Skeleton width="100%" height="50px" borderRadius="8px" style={{ marginBottom: '2rem' }} />

            <div className="divider" style={{ margin: '2rem 0' }}></div>

            <SkeletonText lines={3} style={{ marginBottom: '1rem' }} />
            <Skeleton width="100%" height="40px" borderRadius="8px" />

            <div style={{ marginTop: '2rem' }}>
              <Skeleton width="100%" height="56px" borderRadius="30px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normalize variants
  const variants = selectedCard.variants && selectedCard.variants.length > 0
    ? selectedCard.variants
    : [{
      id: 'default',
      colorHex: selectedCard.colorHex,
      previewImage: selectedCard.image || selectedCard.previewImage
    }];

  const activeVariant = variants[activeVariantIndex] || variants[0];
  const displayImage = activeVariant.previewImage || selectedCard.image || selectedCard.previewImage;

  const totalPrice = selectedCard.price * customization.quantity;
  const discountApplied = customization.quantity >= 100;
  const finalPrice = discountApplied ? totalPrice * 0.9 : totalPrice;

  const handleCustomizeClick = () => {
    // Pass the active variant index to the editor page via state
    // The EditorPage will read this state to load the correct JSON view
    navigate(`/editor/${selectedCard.id}`, { state: { variantIndex: activeVariantIndex } });
  };

  const handleAddToCart = () => {
    // We pass activeVariant info to addToCart if needed
    // For now assuming addToCart just adds the generic card.
    // The user's request is purely about UI preview for now.
    addToCart();
  };

  return (
    <div className="customize-page-split">
      {/* LEFT SIDE - Card Preview */}
      <div className="customize-left">
        <div className="preview-actions">
          <button className="action-btn action-btn-secondary">
            <Share2 size={18} />
            <span>Share</span>
          </button>
          <button className="action-btn action-btn-secondary">
            <Heart size={18} />
            <span>Save</span>
          </button>
        </div>

        <div className="card-preview-container">
          <div className="card-envelope"></div>
          <div className="card-flat-preview">
            <img
              src={displayImage}
              alt={selectedCard.name}
              className="preview-image"
              onError={(e) => {
                e.target.onerror = null;
                if (selectedCard.image && e.target.src !== selectedCard.image) {
                  e.target.src = selectedCard.image;
                }
              }}
            />

            {selectedCard.premium && (
              <div className="premium-badge-corner">
                <Crown size={16} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Info & Controls */}
      <div className="customize-right">
        <div className="customize-sidebar">
          {/* Card Header */}
          <div className="card-header-info">
            <h1 className="card-title">{selectedCard.name}</h1>
            <p className="card-subtitle">Wedding Invitation</p>

            <div className="card-meta">
              <div className="card-size">
                <span className="meta-label">Size</span>
                <span className="meta-value">5"×7"</span>
              </div>
              {selectedCard.popular && (
                <span className="meta-badge meta-badge-popular">Popular</span>
              )}
              {selectedCard.premium && (
                <span className="meta-badge meta-badge-premium">Premium</span>
              )}
            </div>

            {/* Language & Symbols */}
            <div className="card-tags" style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, marginRight: '6px' }}>Language:</span>
                <span className="tag-pill">{selectedCard.language || 'English'}</span>
              </div>
              {selectedCard.symbols && selectedCard.symbols.length > 0 && (
                <div>
                  <span style={{ fontWeight: 600, marginRight: '6px' }}>Includes:</span>
                  {selectedCard.symbols.map(sym => (
                    <span key={sym} className="tag-pill" style={{ marginRight: '4px' }}>{sym}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="divider"></div>

          {/* Color Selection */}
          <div className="color-selection-section">
            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Select Color Theme</label>
            <div className="color-options-row">
              {variants.map((variant, idx) => (
                <button
                  key={variant.id || idx}
                  className={`color-option-btn ${activeVariantIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveVariantIndex(idx)}
                  title={variant.colorHex}
                >
                  <span
                    className="color-swatch-circle"
                    style={{ backgroundColor: variant.colorHex }}
                  />
                  {activeVariantIndex === idx && (
                    <div className="active-check-icon">
                      <Check size={12} strokeWidth={3} color={['#FFFFFF', '#FFFFF0'].includes(variant.colorHex) ? '#000' : '#fff'} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          {/* Customize Button */}
          <button
            className="btn-customize"
            onClick={handleCustomizeClick}
          >
            Customize Details
          </button>

          <div className="divider"></div>

          {/* Quantity Selection */}
          <div className="quantity-section">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              min="25"
              max="1000"
              value={customization.quantity}
              onChange={(e) =>
                setCustomization({
                  ...customization,
                  quantity: Math.min(
                    1000,
                    Math.max(25, Number(e.target.value) || 25)
                  )
                })
              }
              className="form-input-modern"
            />
            {!discountApplied && (
              <p className="quantity-hint">
                💡 Order 100+ cards to save 10% automatically!
              </p>
            )}
          </div>

          <div className="divider"></div>

          {/* Pricing Summary */}
          <div className="pricing-summary">
            <div className="pricing-row-modern">
              <span>Price per card</span>
              <span className="pricing-value">${selectedCard.price.toFixed(2)}</span>
            </div>
            <div className="pricing-row-modern">
              <span>Quantity</span>
              <span className="pricing-value">{customization.quantity}</span>
            </div>
            {discountApplied && (
              <div className="pricing-row-modern discount">
                <span className="discount-text">
                  <Gift size={14} />
                  Bulk discount
                </span>
                <span className="discount-value">-10%</span>
              </div>
            )}
            <div className="pricing-total-modern">
              <span>Total</span>
              <span className="total-value">${finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Urgency Banner */}
          {customization.quantity >= 100 && (
            <div className="urgency-box">
              <Clock size={16} />
              <span>Limited print slots this week!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleAddToCart}
              className="btn-add-cart"
            >
              <ShoppingCart size={18} />
              <span>Add to Cart – ${finalPrice.toFixed(2)}</span>
            </button>
          </div>

          <div className="divider"></div>

          {/* Spread the Joy */}
          <div className="spread-joy">
            <h3 className="spread-title">Spread the joy</h3>
            <div className="joy-actions">
              <button className="joy-btn">
                <Download size={18} />
                <span>Download Image</span>
              </button>
              <button className="joy-btn">
                <Download size={18} />
                <span>Download PDF</span>
              </button>
              <button className="joy-btn">
                <Printer size={18} />
                <span>Print</span>
              </button>
              <button className="joy-btn">
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePage;
