import { CheckCircle, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ConfirmationPage.css";


const ConfirmationPage = ({
    cart,
    checkoutData,
    setCurrentView,
    setCart,
    setCheckoutData
}) => {
    const navigate = useNavigate();
    const item = cart[0];

    const totalPrice =
        item.customization.quantity >= 100
            ? item.price * item.customization.quantity * 0.9
            : item.price * item.customization.quantity;

    return (
        <div className="page-container confirmation-page">
            <div className="confirmation-container">
                <div className="confirmation-card">
                    <div className="success-icon">
                        <CheckCircle className="icon-xl" />
                    </div>

                    <h1 className="confirmation-title">Congratulations!</h1>
                    <p className="confirmation-description">
                        Your wedding cards have been confirmed! Our master printers have started preparing your order with the utmost care.
                    </p>

                    {/* Final Preview */}
                    <div className="final-preview">
                        <div className="final-card-wrapper">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="final-card-image"
                            />
                            {item.premium && (
                                <div className="premium-badge-absolute">
                                    <Crown size={16} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="order-details-card">
                        <h3 className="details-title">Order Details</h3>
                        <div className="details-list">
                            <div className="detail-row">
                                <span>Design:</span>
                                <span className="detail-value">{item.name}</span>
                            </div>
                            <div className="detail-row">
                                <span>Quantity:</span>
                                <span className="detail-value">
                                    {item.customization.quantity} cards
                                </span>
                            </div>
                            <div className="detail-row">
                                <span>Total Paid:</span>
                                <span className="detail-total">
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span>Shipping to:</span>
                                <span className="detail-value">
                                    {checkoutData.address.split("\n")[0]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="next-steps-card">
                        <h3 className="steps-title">What happens next?</h3>
                        <div className="steps-list">
                            <div className="step-item">
                                <div className="step-number">1</div>
                                <span>Master printers begin crafting your cards today</span>
                            </div>
                            <div className="step-item">
                                <div className="step-number">2</div>
                                <span>Quality inspection and packaging within 3–5 business days</span>
                            </div>
                            <div className="step-item">
                                <div className="step-number">3</div>
                                <span>Worldwide shipping with tracking number sent to your email</span>
                            </div>
                        </div>
                    </div>

                    <p className="confirmation-email">
                        You'll receive a confirmation email at{" "}
                        <span className="email-highlight">
                            {checkoutData.email}
                        </span>{" "}
                        with tracking information within 24 hours.
                    </p>

                    <button
                        onClick={() => {
                            try {
                                localStorage.setItem("recentPurchaseImage", item.image);
                            } catch (e) {
                                console.warn("Failed to save recent purchase image to storage (Quota Exceeded):", e);
                            }
                            setCart([]);
                            setCheckoutData({ name: "", email: "", address: "" });
                            navigate("/");
                        }}
                        className="btn btn-primary btn-lg"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;
