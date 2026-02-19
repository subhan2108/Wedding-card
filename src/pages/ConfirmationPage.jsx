import { CheckCircle, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton, SkeletonText } from "../components/common/Skeleton";
import "./ConfirmationPage.css";


const ConfirmationPage = ({
    cart,
    checkoutData,
    setCurrentView,
    setCart,
    setCheckoutData,
    loading
}) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="page-container confirmation-page">
                <div className="confirmation-container">
                    <div className="confirmation-card">
                        <div className="success-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Skeleton width="64px" height="64px" borderRadius="50%" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                            <SkeletonText lines={1} style={{ height: '32px', width: '250px', marginBottom: '1rem' }} />
                            <SkeletonText lines={2} style={{ width: '80%', textAlign: 'center' }} />
                        </div>

                        {/* Final Preview Skeleton */}
                        <div className="final-preview" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <Skeleton width="280px" height="400px" borderRadius="8px" />
                        </div>

                        {/* Order Details Skeleton */}
                        <div className="order-details-card" style={{ width: '100%', marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
                            <SkeletonText lines={1} style={{ height: '20px', width: '150px', marginBottom: '1rem' }} />
                            <div className="details-list">
                                <SkeletonText lines={1} style={{ marginBottom: '8px' }} />
                                <SkeletonText lines={1} style={{ marginBottom: '8px' }} />
                                <SkeletonText lines={1} style={{ marginBottom: '8px' }} />
                                <SkeletonText lines={1} />
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Skeleton width="200px" height="48px" borderRadius="30px" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
