import {
  Share2,
  Heart,
  Download,
  Printer,
  ShoppingCart,
  Gift,
  Clock,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CustomizePage.css";

const CustomizePage = ({
  selectedCard,
  customization,
  setCustomization,
  addToCart
}) => {
  const navigate = useNavigate();
  const totalPrice = selectedCard.price * customization.quantity;
  const discountApplied = customization.quantity >= 100;
  const finalPrice = discountApplied ? totalPrice * 0.9 : totalPrice;

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
          {/* 3D Card Wrapper with Tilt Effect */}
          <div className="card-3d-wrapper">
            <div className="card-preview-shadow">
              <img
                src={selectedCard.image}
                alt={selectedCard.name}
                className="preview-image"
              />

              {selectedCard.premium && (
                <div className="premium-badge-corner">
                  <Crown size={16} />
                </div>
              )}
            </div>
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
          </div>

          {/* Customize Button */}
          <button
            className="btn-customize"
            onClick={() => navigate(`/editor/${selectedCard.id}`)}
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
              onClick={() => {
                addToCart();
                navigate("/checkout");
              }}
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
