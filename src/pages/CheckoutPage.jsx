import { Star, Crown, Shield, User, Mail, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

const CheckoutPage = ({
  cart,
  checkoutData,
  setCheckoutData,
  // handleCheckout
}) => {
  const navigate = useNavigate();
  const item = cart[0];

  const totalPrice =
    item.customization.quantity >= 100
      ? item.price * item.customization.quantity * 0.9
      : item.price * item.customization.quantity;

  return (
    <div className="page-container checkout-page">
      <div className="checkout-container">
        <div className="checkout-card">
          <div className="checkout-content">
            {/* Header */}
            <div className="section-header">
              <h1 className="section-title-md">Complete Your Order</h1>
              <p className="section-description">
                Your perfect wedding cards are just one step away
              </p>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="summary-image"
                />
                <div className="summary-details">
                  <h3>{item.name}</h3>
                  <p>{item.customization.quantity} premium wedding cards</p>
                  <div className="summary-badges">
                    {item.popular && (
                      <Star className="icon-xs star-badge" />
                    )}
                    {item.premium && (
                      <Crown className="icon-xs crown-badge" />
                    )}
                  </div>
                </div>
              </div>

              <div className="summary-total">
                <p className="total-amount">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="checkout-preview">
              <h2 className="preview-title">Final Card Preview</h2>
              <div className="card-preview">
                <img
                  src={item.image}
                  alt={item.name}
                  className="checkout-card-image"
                />
                {item.premium && (
                  <div className="preview-premium-badge">
                    <Crown size={16} />
                  </div>
                )}
              </div>
              <p className="preview-note">
                <Shield className="icon-xs" />
                Your card will be printed exactly as shown in the preview on premium 300gsm cardstock.
              </p>
            </div>

            {/* Checkout Form */}
            <div className="checkout-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User className="input-icon" />
                  <input
                    type="text"
                    value={checkoutData.name}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        name: e.target.value
                      })
                    }
                    className="form-input with-icon"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone className="input-icon" />
                  <input
                    type="tel"
                    value={checkoutData.phone || ''}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        phone: e.target.value
                      })
                    }
                    className="form-input with-icon"
                    placeholder="+91 Enter your mobile number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    value={checkoutData.email}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        email: e.target.value
                      })
                    }
                    className="form-input with-icon"
                    placeholder="Enter your email for order updates"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon textarea-icon" />
                  <textarea
                    value={checkoutData.address}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        address: e.target.value
                      })
                    }
                    className="form-textarea with-icon"
                    placeholder="Enter your complete shipping address including country"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="payment-methods">
              <h3 className="payment-title">Secure Payment Options</h3>
              <div className="payment-options">
                {[
                  "Credit Card",
                  "PayPal",
                  "Apple Pay",
                  "Google Pay",
                  "Stripe"
                ].map((method) => (
                  <div key={method} className="payment-option">
                    {method}
                  </div>
                ))}
              </div>
              <div className="payment-security">
                <Shield className="icon-xs" />
                <span>All payments are SSL encrypted and secure</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/confirmation")}
              className="btn btn-primary btn-full btn-xl"
            >

              Complete Order – ${totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
