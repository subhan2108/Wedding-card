/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Star, Crown, Shield, User, Mail, MapPin, Phone, CreditCard, Banknote, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Skeleton, SkeletonText } from "../components/common/Skeleton";
import "./CheckoutPage.css";

// Initialize Stripe with your Publishable Key
// Replace 'pk_test_sample' with your actual Stripe Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample');

const CheckoutForm = ({
  cart,
  checkoutData,
  setCheckoutData,
  loading
  // handleCheckout
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && user.email && !checkoutData.email) {
      setCheckoutData(prev => ({ ...prev, email: user.email }));
    }
  }, [user, checkoutData.email, setCheckoutData]);

  if (loading) {
    return (
      <div className="page-container checkout-page">
        <div className="checkout-container">
          <div className="checkout-card">
            <div className="checkout-content">
              {/* Header Skeleton */}
              <div className="section-header" style={{ marginBottom: '2rem' }}>
                <SkeletonText lines={1} style={{ height: '32px', width: '60%', margin: '0 0 10px 0' }} />
                <SkeletonText lines={1} style={{ height: '18px', width: '40%' }} />
              </div>

              {/* Summary Skeleton */}
              <div className="order-summary" style={{ marginBottom: '2rem' }}>
                <SkeletonText lines={1} style={{ height: '24px', width: '150px', marginBottom: '1rem' }} />
                <div className="summary-item" style={{ display: 'flex', gap: '1rem' }}>
                  <Skeleton width="80px" height="80px" borderRadius="8px" />
                  <div style={{ flex: 1 }}>
                    <SkeletonText lines={1} style={{ height: '20px', width: '80%', marginBottom: '8px' }} />
                    <SkeletonText lines={1} style={{ height: '16px', width: '50%' }} />
                  </div>
                </div>
              </div>

              {/* Form Skeleton */}
              <div className="checkout-form">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <SkeletonText lines={1} style={{ height: '16px', width: '100px', marginBottom: '8px' }} />
                    <Skeleton width="100%" height="48px" borderRadius="8px" />
                  </div>
                ))}
              </div>

              {/* Payment Skeleton */}
              <div className="payment-methods">
                <SkeletonText lines={1} style={{ height: '24px', width: '200px', marginBottom: '1rem' }} />
                <div className="payment-options" style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                  <Skeleton width="100px" height="60px" borderRadius="8px" />
                  <Skeleton width="100px" height="60px" borderRadius="8px" />
                  <Skeleton width="100px" height="60px" borderRadius="8px" />
                </div>
                <Skeleton width="100%" height="100px" borderRadius="8px" />
              </div>

              <Skeleton width="100%" height="56px" borderRadius="30px" style={{ marginTop: '2rem' }} />
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

  const handlePayment = async () => {
    // Validation
    if (!checkoutData.name || !checkoutData.email || !checkoutData.address) {
      alert('Please fill in all details');
      return;
    }

    setIsProcessing(true);

    try {
      let stripePaymentDetails = null;

      if (paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          alert("Stripe has not loaded. Please refresh.");
          setIsProcessing(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);

        // Create Payment Method (Tokenizer)
        const { error, paymentMethod: stripeMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: checkoutData.name,
            email: checkoutData.email,
            address: {
              line1: checkoutData.address
            }
          }
        });

        if (error) {
          console.error(error);
          alert(error.message);
          setIsProcessing(false);
          return;
        }

        console.log("Stripe Payment Method Created:", stripeMethod);
        stripePaymentDetails = stripeMethod;
      }

      // Prepare Order Payload
      const orderPayload = {
        customer_name: checkoutData.name,
        customer_email: checkoutData.email,
        customer_phone: checkoutData.phone || null,
        shipping_address: checkoutData.address || null,
        total_amount: totalPrice,
        payment_mode: paymentMethod,
        template_id: item.id,
        design_data: {
          ...item.customization,
          payment_id: stripePaymentDetails ? stripePaymentDetails.id : null,
          transaction_id: stripePaymentDetails ? stripePaymentDetails.id : `COD-${Date.now()}`
        },
        status: stripePaymentDetails ? 'paid' : 'pending' // Optimistic status for demo
      };

      // Save Order to Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (error) {
        console.error('Error placing order:', error);
        if (error.code === '23503') {
          alert('System Error: Template ID mismatch. Please select a valid template.');
        } else {
          alert('Failed to place order: ' + error.message);
        }
        setIsProcessing(false);
        return;
      }

      console.log('Order placed successfully:', data);
      navigate("/confirmation", { state: { orderId: data[0].id } });

    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred during checkout.');
      setIsProcessing(false);
    }
  };

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

            {/* Payment Methods */}
            <div className="payment-methods">
              <h3 className="payment-title">Secure Payment Options</h3>

              <div className="payment-options">
                {[
                  { id: 'stripe', name: 'Card / Stripe', icon: CreditCard },
                  { id: 'upi', name: 'UPI / Bank Transfer', icon: QrCode },
                  { id: 'cod', name: 'Cash on Delivery', icon: Banknote },
                ].map((option) => (
                  <div
                    key={option.id}
                    className={`payment-option ${paymentMethod === option.id ? "active" : ""}`}
                    onClick={() => setPaymentMethod(option.id)}
                  >
                    <option.icon className="payment-icon" size={24} />
                    <span>{option.name}</span>
                  </div>
                ))}
              </div>

              {/* Payment Details View */}
              <div className="payment-details-view">
                {paymentMethod === 'stripe' && (
                  <div className="payment-box stripe-box">
                    <label className="form-label" style={{ marginBottom: '0.8rem' }}>Enter Card Details</label>
                    <div className="stripe-element-container">
                      <CardElement options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                            fontFamily: 'Inter, sans-serif',
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                        hidePostalCode: true
                      }} />
                    </div>
                    <p className="payment-note">
                      <Shield size={14} /> Payments processed securely by Stripe
                    </p>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="payment-box upi-box">
                    <div className="upi-content">
                      <div className="upi-qr">
                        <QrCode size={80} strokeWidth={1} />
                        <span>Scan & Pay</span>
                      </div>
                      <div className="upi-details">
                        <p>Bank Transfer / UPI ID</p>
                        <div className="copy-field">
                          <span>wedding-cards@upi</span>
                          <button className="btn-copy">Copy</button>
                        </div>
                        <p className="small-text">Please keep your transaction ID handy for verification.</p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="payment-box cod-box">
                    <div className="cod-content">
                      <Banknote size={48} className="cod-icon-large" />
                      <div>
                        <h4>Cash on Delivery</h4>
                        <p>Pay the full amount when your order is delivered to your doorstep.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="payment-security">
                <Shield className="icon-xs" />
                <span>All payments are SSL encrypted and secure</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="btn btn-primary btn-full btn-xl"
            >
              {isProcessing ? 'Processing...' : (paymentMethod === 'cod' ? 'Place Order' : 'Pay Now')} – ${totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap in Elements
const CheckoutPage = (props) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm {...props} />
  </Elements>
);

export default CheckoutPage;
