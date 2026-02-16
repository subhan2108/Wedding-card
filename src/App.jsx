// import React, { useState, useEffect, useMemo } from 'react';
// import { Heart, Globe, Shield, Truck, Star, Calendar, MapPin, User, Mail, Package, CheckCircle, Sparkles, Crown, Feather, Flower2, Diamond, Moon, Sun, Palette, Type, Users, Clock, Gift } from 'lucide-react';

// const App = () => {
//   const [currentView, setCurrentView] = useState('home');
//   const [selectedCard, setSelectedCard] = useState(null);
//   const [customization, setCustomization] = useState({
//     groomName: 'Alexander',
//     brideName: 'Sophia',
//     weddingDate: 'June 15, 2026',
//     venue: 'Grand Ballroom, The Ritz',
//     familyNames: '',
//     font: 'Playfair Display',
//     textColor: '#8B4513',
//     quantity: 100
//   });
//   const [cart, setCart] = useState([]);
//   const [checkoutData, setCheckoutData] = useState({ name: '', email: '', address: '' });
//   const [orderConfirmed, setOrderConfirmed] = useState(false);
//   const [activeFilter, setActiveFilter] = useState('All');

//   // Enhanced wedding card designs with 100+ samples
//   const generateWeddingCards = () => {
//     const themes = ['Traditional', 'Modern', 'Royal', 'Minimal', 'Vintage', 'Boho', 'Rustic', 'Art Deco', 'Floral', 'Geometric'];
//     const colors = [
//       { name: 'Gold', hex: '#D4AF37' },
//       { name: 'Silver', hex: '#C0C0C0' },
//       { name: 'Burgundy', hex: '#800020' },
//       { name: 'Ivory', hex: '#FFFFF0' },
//       { name: 'Blush', hex: '#DE5D83' },
//       { name: 'Navy', hex: '#000080' },
//       { name: 'Emerald', hex: '#50C878' },
//       { name: 'Rose Gold', hex: '#E0BFB8' },
//       { name: 'Sage', hex: '#BCB88A' },
//       { name: 'Lavender', hex: '#E6E6FA' }
//     ];

//     const names = [
//       'Eternal Love', 'Forever Yours', 'Sacred Union', 'Divine Bond', 'Timeless Vow',
//       'Celestial Match', 'Heavenly Promise', 'Golden Hour', 'Moonlight Serenade',
//       'Sunset Romance', 'Ocean Breeze', 'Mountain Peak', 'Garden Bliss', 'Starlight Waltz',
//       'Velvet Dreams', 'Silk Embrace', 'Pearl Essence', 'Diamond Forever', 'Crystal Clear',
//       'Amber Glow', 'Ruby Passion', 'Sapphire Soul', 'Emerald Heart', 'Opal Magic'
//     ];

//     const cards = [];
//     for (let i = 1; i <= 120; i++) {
//       const theme = themes[Math.floor(Math.random() * themes.length)];
//       const colorObj = colors[Math.floor(Math.random() * colors.length)];
//       const name = names[Math.floor(Math.random() * names.length)] + ` ${i}`;
//       const price = parseFloat((2.00 + Math.random() * 2.50).toFixed(2));
//       const popular = Math.random() > 0.7;

//       cards.push({
//         id: i,
//         name,
//         theme,
//         color: colorObj.name,
//         colorHex: colorObj.hex,
//         price,
//         popular,
//         premium: Math.random() > 0.8,
//         image: `https://placehold.co/400x300/f8f4e9/${colorObj.hex.replace('#', '')}?text=${encodeURIComponent(name)}`
//       });
//     }
//     return cards;
//   };

//   const weddingCards = useMemo(() => generateWeddingCards(), []);

//   const filteredCards = useMemo(() => {
//     if (activeFilter === 'All') return weddingCards;
//     return weddingCards.filter(card => card.theme === activeFilter);
//   }, [activeFilter, weddingCards]);

//   const fonts = [
//     'Playfair Display',
//     'Great Vibes',
//     'Dancing Script',
//     'Cormorant Garamond',
//     'Lora',
//     'Alex Brush',
//     'Allura',
//     'Sacramento',
//     'Parisienne',
//     'Cookie'
//   ];

//   const handleCustomize = (card) => {
//     setSelectedCard(card);
//     setCurrentView('customize');
//   };

//   const addToCart = () => {
//     const item = {
//       ...selectedCard,
//       customization: { ...customization },
//       totalPrice: selectedCard.price * customization.quantity
//     };
//     setCart([item]);
//     setCurrentView('checkout');
//   };

//   const handleCheckout = () => {
//     setOrderConfirmed(true);
//     setCurrentView('confirmation');
//   };

//   const HomePage = () => (
//     <div className="page-container">
//       {/* Animated Background Elements */}
//       <div className="background-elements">
//         <div className="bg-circle bg-circle-1"></div>
//         <div className="bg-circle bg-circle-2"></div>
//         <div className="bg-circle bg-circle-3"></div>
//         <div className="bg-circle bg-circle-4"></div>
//       </div>

//       {/* Hero Section */}
//       <div className="hero-section">
//         <div className="container">
//           <div className="hero-grid">
//             <div className="hero-content">
//               <div className="hero-text">
//                 <div className="premium-badge">
//                   <Sparkles className="icon-sm" />
//                   <span>Premium Collection</span>
//                 </div>
//                 <h1 className="hero-title">
//                   Design Your
//                   <span className="gradient-text">
//                     Perfect Wedding Card
//                   </span>
//                 </h1>
//                 <p className="hero-description">
//                   Choose from 120+ exquisite designs, customize instantly, and receive premium printed cards delivered worldwide.
//                 </p>
//               </div>

//               <div className="hero-buttons">
//                 <button
//                   onClick={() => setCurrentView('gallery')}
//                   className="btn btn-primary btn-lg"
//                 >
//                   <Feather className="icon-sm" />
//                   <span>Customize Your Card</span>
//                 </button>
//                 <button
//                   onClick={() => setCurrentView('gallery')}
//                   className="btn btn-secondary btn-lg"
//                 >
//                   <Palette className="icon-sm" />
//                   <span>View All Designs</span>
//                 </button>
//               </div>

//               {/* Trust Signals */}
//               <div className="trust-signals">
//                 {[
//                   { icon: Globe, text: 'Worldwide Shipping', desc: 'Delivered to 195+ countries' },
//                   { icon: Shield, text: 'Premium Paper', desc: '300gsm luxury cardstock' },
//                   { icon: Heart, text: 'Happy Couples', desc: '50,000+ satisfied customers' },
//                   { icon: Truck, text: 'Secure Payments', desc: 'SSL encrypted checkout' }
//                 ].map((item, index) => (
//                   <div key={index} className="trust-item">
//                     <div className="trust-icon">
//                       <item.icon className="icon-md" />
//                     </div>
//                     <h3>{item.text}</h3>
//                     <p>{item.desc}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Enhanced Card Preview */}
//             <div className="hero-preview">
//               <div className="preview-card-wrapper">
//                 <div className="preview-card">
//                   <div className="preview-content">
//                     <div className="preview-decoration preview-decoration-1"></div>
//                     <div className="preview-decoration preview-decoration-2"></div>
//                     <h3 className="preview-names">
//                       {customization.groomName} & {customization.brideName}
//                     </h3>
//                     <div className="preview-detail">
//                       <Calendar className="icon-xs" />
//                       <span>{customization.weddingDate}</span>
//                     </div>
//                     <div className="preview-detail">
//                       <MapPin className="icon-xs" />
//                       <span>{customization.venue}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Featured Designs Showcase */}
//       <div className="featured-section">
//         <div className="container">
//           <div className="section-header">
//             <h2 className="section-title">Our Exquisite Collection</h2>
//             <p className="section-description">
//               Handcrafted by master designers, each card represents the pinnacle of wedding stationery elegance.
//             </p>
//             <div className="premium-count-badge">
//               <Crown className="icon-sm" />
//               <span>120+ Premium Designs</span>
//             </div>
//           </div>

//           {/* Category Showcase */}
//           <div className="category-grid">
//             {['Traditional', 'Modern', 'Royal', 'Floral'].map((category) => (
//               <div key={category} className="category-card" onClick={() => {
//                 setActiveFilter(category);
//                 setCurrentView('gallery');
//               }}>
//                 <div className="category-card-inner">
//                   <img
//                     src={`https://placehold.co/400x300/f8f4e9/8B4513?text=${encodeURIComponent(category)}`}
//                     alt={category}
//                     className="category-image"
//                   />
//                   <div className="category-overlay">
//                     <button className="btn btn-primary">
//                       Explore {category}
//                     </button>
//                   </div>
//                   <div className="category-info">
//                     <h3>{category}</h3>
//                     <p>{weddingCards.filter(c => c.theme === category).length} designs</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Testimonials */}
//           <div className="testimonial-card">
//             <div className="testimonial-content">
//               <div className="star-rating">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="star-icon" />
//                 ))}
//               </div>
//               <blockquote className="testimonial-quote">
//                 "Our wedding cards were absolutely stunning! The quality exceeded our expectations, and our guests couldn't stop complimenting them."
//               </blockquote>
//               <p className="testimonial-author">— Emma & James, London</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const GalleryPage = () => (
//     <div className="page-container gallery-page">
//       <div className="container">
//         <div className="section-header">
//           <h1 className="section-title">Wedding Card Collection</h1>
//           <p className="section-description">
//             Discover 120+ handcrafted designs, each created to make your special day truly unforgettable.
//           </p>
//           <div className="design-count-badge">
//             <Users className="icon-sm" />
//             <span>{weddingCards.length} Premium Designs</span>
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         <div className="filter-container">
//           {['All', 'Traditional', 'Modern', 'Royal', 'Minimal', 'Vintage', 'Boho', 'Rustic', 'Art Deco', 'Floral', 'Geometric'].map((filter) => (
//             <button
//               key={filter}
//               onClick={() => setActiveFilter(filter)}
//               className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
//             >
//               {filter}
//             </button>
//           ))}
//         </div>

//         {/* Stats */}
//         <div className="stats-grid">
//           <div className="stat-card">
//             <div className="stat-value stat-value-rose">{filteredCards.length}</div>
//             <div className="stat-label">Available Designs</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value stat-value-amber">12</div>
//             <div className="stat-label">Design Categories</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value stat-value-purple">10</div>
//             <div className="stat-label">Color Palettes</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value stat-value-green">50K+</div>
//             <div className="stat-label">Happy Couples</div>
//           </div>
//         </div>

//         {/* Card Grid */}
//         <div className="cards-grid">
//           {filteredCards.map((card) => (
//             <div key={card.id} className="wedding-card" onClick={() => handleCustomize(card)}>
//               <div className="wedding-card-inner">
//                 <div className="card-image-wrapper">
//                   <img
//                     src={card.image}
//                     alt={card.name}
//                     className="card-image"
//                   />
//                   <div className="card-overlay"></div>

//                   {/* Badges */}
//                   <div className="card-badges">
//                     {card.popular && (
//                       <div className="badge badge-popular">
//                         <Star className="icon-xs" />
//                         <span>Popular</span>
//                       </div>
//                     )}
//                     {card.premium && (
//                       <div className="badge badge-premium">
//                         <Crown className="icon-xs" />
//                         <span>Premium</span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Hover Overlay */}
//                   <div className="card-hover-overlay">
//                     <button className="btn btn-primary">
//                       Customize
//                     </button>
//                   </div>
//                 </div>

//                 <div className="card-details">
//                   <div className="card-header">
//                     <h3 className="card-name">{card.name}</h3>
//                     <div className="color-dot" style={{ backgroundColor: card.colorHex }}></div>
//                   </div>
//                   <div className="card-footer">
//                     <span className="card-theme">{card.theme}</span>
//                     <span className="card-price">${card.price.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {filteredCards.length === 0 && (
//           <div className="empty-state">
//             <Flower2 className="empty-icon" />
//             <h3 className="empty-title">No designs found</h3>
//             <p className="empty-description">Try selecting a different category or view all designs.</p>
//             <button
//               onClick={() => setActiveFilter('All')}
//               className="btn btn-primary"
//             >
//               View All Designs
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const CustomizePage = () => {
//     const totalPrice = selectedCard.price * customization.quantity;
//     const discountApplied = customization.quantity >= 100;
//     const finalPrice = discountApplied ? totalPrice * 0.9 : totalPrice;

//     return (
//       <div className="page-container customize-page">
//         <div className="container">
//           <div className="section-header">
//             <h1 className="section-title-md">Customize Your Perfect Card</h1>
//             <p className="section-description">Personalize every detail to match your unique love story</p>
//           </div>

//           <div className="customize-grid">
//             {/* Preview Section */}
//             <div className="preview-section">
//               <div className="preview-header">
//                 <h2 className="preview-title">Live Preview</h2>
//                 <div className="preview-subtitle">
//                   <CheckCircle className="icon-xs check-icon" />
//                   <span>This is exactly how your printed card will look</span>
//                 </div>
//               </div>

//               <div className="card-preview">
//                 <div className="card-preview-content">
//                   <div className="preview-names-custom">
//                     <h3
//                       style={{
//                         fontFamily: customization.font,
//                         color: customization.textColor
//                       }}
//                     >
//                       {customization.groomName} & {customization.brideName}
//                     </h3>
//                     {selectedCard.premium && (
//                       <div className="premium-badge-absolute">
//                         <Crown className="icon-xs" />
//                       </div>
//                     )}
//                   </div>
//                   <div className="preview-detail">
//                     <Calendar className="icon-sm" />
//                     <span>{customization.weddingDate}</span>
//                   </div>
//                   <div className="preview-detail">
//                     <MapPin className="icon-sm" />
//                     <span>{customization.venue}</span>
//                   </div>
//                   {customization.familyNames && (
//                     <div className="family-names">
//                       {customization.familyNames}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="preview-features">
//                 <div className="feature-item">
//                   <Shield className="icon-sm feature-icon" />
//                   <span>Printed on premium 300gsm luxury cardstock with gold foil accents</span>
//                 </div>
//                 <div className="feature-item">
//                   <Truck className="icon-sm feature-icon" />
//                   <span>Safely shipped worldwide with tracked delivery</span>
//                 </div>
//                 {selectedCard.popular && (
//                   <div className="feature-item popular-feature">
//                     <Heart className="icon-sm feature-icon" />
//                     <span>This design is popular among couples - 2,347 ordered this month!</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Customization Panel */}
//             <div className="customization-panel">
//               <div className="form-container">
//                 <div className="form-group">
//                   <label className="form-label">Groom's Name</label>
//                   <input
//                     type="text"
//                     value={customization.groomName}
//                     onChange={(e) => setCustomization({ ...customization, groomName: e.target.value })}
//                     className="form-input"
//                     placeholder="Enter groom's name"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Bride's Name</label>
//                   <input
//                     type="text"
//                     value={customization.brideName}
//                     onChange={(e) => setCustomization({ ...customization, brideName: e.target.value })}
//                     className="form-input"
//                     placeholder="Enter bride's name"
//                   />
//                 </div>

//                 <div className="form-row">
//                   <div className="form-group">
//                     <label className="form-label">Wedding Date</label>
//                     <input
//                       type="text"
//                       value={customization.weddingDate}
//                       onChange={(e) => setCustomization({ ...customization, weddingDate: e.target.value })}
//                       className="form-input"
//                       placeholder="MM/DD/YYYY"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Venue</label>
//                     <input
//                       type="text"
//                       value={customization.venue}
//                       onChange={(e) => setCustomization({ ...customization, venue: e.target.value })}
//                       className="form-input"
//                       placeholder="Wedding venue"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Family Names (Optional)</label>
//                   <input
//                     type="text"
//                     value={customization.familyNames}
//                     onChange={(e) => setCustomization({ ...customization, familyNames: e.target.value })}
//                     className="form-input"
//                     placeholder="Parents' names or family message"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Font Style</label>
//                   <select
//                     value={customization.font}
//                     onChange={(e) => setCustomization({ ...customization, font: e.target.value })}
//                     className="form-select"
//                   >
//                     {fonts.map(font => (
//                       <option key={font} value={font} style={{ fontFamily: font }}>
//                         {font}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Text Color</label>
//                   <div className="color-picker">
//                     {['#8B4513', '#2C3E50', '#8B0000', '#4A4A4A', '#DAA520', '#000080', '#50C878', '#DE5D83', '#E6E6FA', '#BCB88A'].map(color => (
//                       <button
//                         key={color}
//                         onClick={() => setCustomization({ ...customization, textColor: color })}
//                         className={`color-option ${customization.textColor === color ? 'active' : ''}`}
//                         style={{ backgroundColor: color }}
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Quantity</label>
//                   <div className="quantity-input">
//                     <input
//                       type="number"
//                       min="25"
//                       max="1000"
//                       value={customization.quantity}
//                       onChange={(e) => setCustomization({ ...customization, quantity: Math.min(1000, Math.max(25, parseInt(e.target.value) || 25)) })}
//                       className="form-input"
//                     />
//                     <div className="quantity-label">
//                       {customization.quantity} cards
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Enhanced Pricing */}
//               <div className="pricing-card">
//                 <div className="pricing-details">
//                   <div className="pricing-row">
//                     <span>Price per card:</span>
//                     <span className="pricing-value">${selectedCard.price.toFixed(2)}</span>
//                   </div>
//                   <div className="pricing-row">
//                     <span>Quantity:</span>
//                     <span className="pricing-value">{customization.quantity}</span>
//                   </div>
//                   {discountApplied && (
//                     <div className="pricing-row discount-row">
//                       <span className="discount-label">
//                         <Gift className="icon-xs" />
//                         Bulk discount applied:
//                       </span>
//                       <span className="discount-value">-10%</span>
//                     </div>
//                   )}
//                   <div className="pricing-total">
//                     <span>Total:</span>
//                     <span className="total-price">${finalPrice.toFixed(2)}</span>
//                   </div>
//                 </div>
//                 {!discountApplied && (
//                   <div className="discount-notice">
//                     <Star className="icon-xs" />
//                     Order 100+ cards to save 10% automatically!
//                   </div>
//                 )}
//               </div>

//               {/* Urgency Banner */}
//               <div className="urgency-banner">
//                 <div className="urgency-content">
//                   <Clock className="icon-sm" />
//                   <span>Limited print slots available this week!</span>
//                 </div>
//                 <p>Secure your order now to guarantee delivery for your special day.</p>
//               </div>

//               <button
//                 onClick={addToCart}
//                 className="btn btn-primary btn-full btn-xl"
//               >
//                 Add to Cart - ${finalPrice.toFixed(2)}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const CheckoutPage = () => {
//     const item = cart[0];
//     const totalPrice = item.customization.quantity >= 100 ?
//       (item.price * item.customization.quantity * 0.9) :
//       (item.price * item.customization.quantity);

//     return (
//       <div className="page-container checkout-page">
//         <div className="checkout-container">
//           <div className="checkout-card">
//             <div className="checkout-content">
//               <div className="section-header">
//                 <h1 className="section-title-md">Complete Your Order</h1>
//                 <p className="section-description">Your perfect wedding cards are just one step away</p>
//               </div>

//               {/* Order Summary */}
//               <div className="order-summary">
//                 <h2 className="summary-title">Order Summary</h2>
//                 <div className="summary-item">
//                   <img src={item.image} alt={item.name} className="summary-image" />
//                   <div className="summary-details">
//                     <h3>{item.name}</h3>
//                     <p>{item.customization.quantity} premium wedding cards</p>
//                     <div className="summary-badges">
//                       {item.popular && <Star className="icon-xs star-badge" />}
//                       {item.premium && <Crown className="icon-xs crown-badge" />}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="summary-total">
//                   <p className="total-amount">${totalPrice.toFixed(2)}</p>
//                 </div>
//               </div>

//               {/* Preview in Checkout */}
//               <div className="checkout-preview">
//                 <h2 className="preview-title">Final Card Preview</h2>
//                 <div className="card-preview">
//                   <h3
//                     className="preview-names-checkout"
//                     style={{
//                       fontFamily: item.customization.font,
//                       color: item.customization.textColor
//                     }}
//                   >
//                     {item.customization.groomName} & {item.customization.brideName}
//                   </h3>
//                   <p className="preview-date">{item.customization.weddingDate}</p>
//                   <p className="preview-venue">{item.customization.venue}</p>
//                 </div>
//                 <p className="preview-note">
//                   <Shield className="icon-xs" />
//                   Your card will be printed exactly as shown in the preview on premium 300gsm cardstock.
//                 </p>
//               </div>

//               {/* Checkout Form */}
//               <div className="checkout-form">
//                 <div className="form-group">
//                   <label className="form-label">Full Name</label>
//                   <div className="input-with-icon">
//                     <User className="input-icon" />
//                     <input
//                       type="text"
//                       value={checkoutData.name}
//                       onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
//                       className="form-input with-icon"
//                       placeholder="Enter your full name"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Email Address</label>
//                   <div className="input-with-icon">
//                     <Mail className="input-icon" />
//                     <input
//                       type="email"
//                       value={checkoutData.email}
//                       onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
//                       className="form-input with-icon"
//                       placeholder="Enter your email for order updates"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Shipping Address</label>
//                   <div className="input-with-icon">
//                     <MapPin className="input-icon textarea-icon" />
//                     <textarea
//                       value={checkoutData.address}
//                       onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
//                       className="form-textarea with-icon"
//                       placeholder="Enter your complete shipping address including country"
//                       rows="4"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Methods */}
//               <div className="payment-methods">
//                 <h3 className="payment-title">Secure Payment Options</h3>
//                 <div className="payment-options">
//                   {['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Stripe'].map((method) => (
//                     <div key={method} className="payment-option">
//                       {method}
//                     </div>
//                   ))}
//                 </div>
//                 <div className="payment-security">
//                   <Shield className="icon-xs" />
//                   <span>All payments are SSL encrypted and secure</span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleCheckout}
//                 className="btn btn-primary btn-full btn-xl"
//               >
//                 Complete Order - ${totalPrice.toFixed(2)}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const ConfirmationPage = () => {
//     const item = cart[0];
//     const totalPrice = item.customization.quantity >= 100 ?
//       (item.price * item.customization.quantity * 0.9) :
//       (item.price * item.customization.quantity);

//     return (
//       <div className="page-container confirmation-page">
//         <div className="confirmation-container">
//           <div className="confirmation-card">
//             <div className="success-icon">
//               <CheckCircle className="icon-xl" />
//             </div>

//             <h1 className="confirmation-title">Congratulations!</h1>
//             <p className="confirmation-description">
//               Your wedding cards have been confirmed! Our master printers have started preparing your order with the utmost care.
//             </p>

//             {/* Final Preview */}
//             <div className="final-preview">
//               <h3
//                 className="final-names"
//                 style={{
//                   fontFamily: item.customization.font,
//                   color: item.customization.textColor
//                 }}
//               >
//                 {item.customization.groomName} & {item.customization.brideName}
//               </h3>
//               <p className="final-date">{item.customization.weddingDate}</p>
//               <p className="final-venue">{item.customization.venue}</p>
//               {item.premium && (
//                 <div className="premium-badge-inline">
//                   <Crown className="icon-xs" />
//                   <span>Premium Design</span>
//                 </div>
//               )}
//             </div>

//             <div className="order-details-card">
//               <h3 className="details-title">Order Details</h3>
//               <div className="details-list">
//                 <div className="detail-row">
//                   <span>Design:</span>
//                   <span className="detail-value">{item.name}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span>Quantity:</span>
//                   <span className="detail-value">{item.customization.quantity} cards</span>
//                 </div>
//                 <div className="detail-row">
//                   <span>Total Paid:</span>
//                   <span className="detail-total">${totalPrice.toFixed(2)}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span>Shipping to:</span>
//                   <span className="detail-value">{checkoutData.address.split('\n')[0]}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="next-steps-card">
//               <h3 className="steps-title">What happens next?</h3>
//               <div className="steps-list">
//                 <div className="step-item">
//                   <div className="step-number">1</div>
//                   <span>Master printers begin crafting your cards today</span>
//                 </div>
//                 <div className="step-item">
//                   <div className="step-number">2</div>
//                   <span>Quality inspection and packaging within 3-5 business days</span>
//                 </div>
//                 <div className="step-item">
//                   <div className="step-number">3</div>
//                   <span>Worldwide shipping with tracking number sent to your email</span>
//                 </div>
//               </div>
//             </div>

//             <p className="confirmation-email">
//               You'll receive a confirmation email at <span className="email-highlight">{checkoutData.email}</span> with tracking information within 24 hours.
//             </p>

//             <button
//               onClick={() => {
//                 setOrderConfirmed(false);
//                 setCurrentView('home');
//                 setCart([]);
//                 setCheckoutData({ name: '', email: '', address: '' });
//               }}
//               className="btn btn-primary btn-lg"
//             >
//               Return to Home
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="app">
//       {currentView === 'home' && <HomePage />}
//       {currentView === 'gallery' && <GalleryPage />}
//       {currentView === 'customize' && <CustomizePage />}
//       {currentView === 'checkout' && <CheckoutPage />}
//       {currentView === 'confirmation' && <ConfirmationPage />}
//     </div>
//   );
// };

// export default App;



import React, { useState, useMemo, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import CustomizePage from "./pages/CustomizePage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";

import EditorPage from "./pages/EditorPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUploadPage from "./pages/admin/AdminUploadPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Services
import { adminService } from "./services/adminService";

const App = () => {
  const location = useLocation(); // Hook to detect route changes

  // Initialize state from localStorage or defaults
  const [selectedCard, setSelectedCard] = useState(() => {
    const saved = localStorage.getItem('selectedCard');
    return saved ? JSON.parse(saved) : null;
  });

  const [customization, setCustomization] = useState(() => {
    const saved = localStorage.getItem('customization');
    return saved ? JSON.parse(saved) : {
      groomName: "Alexander",
      brideName: "Sophia",
      weddingDate: "June 15, 2026",
      venue: "Grand Ballroom, The Ritz",
      familyNames: "",
      font: "Playfair Display",
      textColor: "#8B4513",
      quantity: 100
    };
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [checkoutData, setCheckoutData] = useState(() => {
    const saved = localStorage.getItem('checkoutData');
    return saved ? JSON.parse(saved) : {
      name: "",
      email: "",
      address: ""
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCard', JSON.stringify(selectedCard));
  }, [selectedCard]);

  useEffect(() => {
    localStorage.setItem('customization', JSON.stringify(customization));
  }, [customization]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
  }, [checkoutData]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [activeSymbol, setActiveSymbol] = useState("All");

  // Helper function to get color name from hex (defined before use)
  const getColorName = (hex) => {
    const colorMap = {
      '#D4AF37': 'Gold',
      '#C0C0C0': 'Silver',
      '#800020': 'Burgundy',
      '#FFFFF0': 'Ivory',
      '#DE5D83': 'Blush',
      '#000080': 'Navy',
      '#50C878': 'Emerald',
      '#E0BFB8': 'Rose Gold',
      '#BCB88A': 'Sage',
      '#E6E6FA': 'Lavender'
    };
    return colorMap[hex] || 'Gold';
  };

  // State for Real Cards (fetched from Admin)
  const [realCards, setRealCards] = useState([]);

  // Fetch real templates whenever location changes (e.g. returning from Admin)
  useEffect(() => {
    const realTemplates = adminService.getTemplates();
    const formattedCards = realTemplates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category || 'Wedding', // Default to Wedding if missing
      subcategory: template.subcategory || template.category || 'General',
      language: template.language || 'English',
      symbols: Array.isArray(template.symbols)
        ? template.symbols
        : (typeof template.symbols === 'string' ? template.symbols.split(',').map(s => s.trim()).filter(Boolean) : []),
      theme: template.subcategory || template.category || 'General', // Legacy support
      color: template.colorHex ? getColorName(template.colorHex) : 'Gold',
      colorHex: template.colorHex || '#D4AF37',
      price: template.price || parseFloat((2 + Math.random() * 2.5).toFixed(2)),
      popular: template.tags?.includes('Popular') || false,
      premium: template.tags?.includes('Premium') || false,
      image: template.previewImage || template.backgroundUrl || `https://placehold.co/400x300/f8f4e9/8B4513?text=${encodeURIComponent(template.name)}`,
      variants: template.variants || [],
      // Keep the original template data for editing
      isRealTemplate: true,
      template: template
    }));
    setRealCards(formattedCards);
  }, [location.pathname]); // Update when route changes

  // Generate dummy cards (Memoized to avoid re-generation)
  const dummyCards = useMemo(() => {
    const themes = [
      "Traditional", "Modern", "Royal", "Minimal", "Vintage",
      "Boho", "Rustic", "Art Deco", "Floral", "Geometric"
    ];

    const colors = [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Silver", hex: "#C0C0C0" },
      { name: "Burgundy", hex: "#800020" },
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Blush", hex: "#DE5D83" },
      { name: "Navy", hex: "#000080" },
      { name: "Emerald", hex: "#50C878" },
      { name: "Rose Gold", hex: "#E0BFB8" },
      { name: "Sage", hex: "#BCB88A" },
      { name: "Lavender", hex: "#E6E6FA" }
    ];

    const names = [
      "Eternal Love", "Forever Yours", "Sacred Union", "Divine Bond",
      "Timeless Vow", "Celestial Match", "Golden Hour",
      "Moonlight Serenade", "Garden Bliss", "Diamond Forever"
    ];

    const languages = ['English', 'Hindi', 'Urdu', 'Mixed'];
    const possibleSymbols = ['Om', 'Ganesha', 'Moon', 'Floral', 'Bismillah', 'Khanda', 'Cross'];

    return Array.from({ length: 120 }).map((_, i) => {
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const name = `${names[Math.floor(Math.random() * names.length)]} ${i + 1}`;

      return {
        id: `dummy-${i + 1}`,
        name,
        category: "Wedding", // All dummy cards are Wedding cards
        subcategory: theme,
        language: languages[Math.floor(Math.random() * languages.length)],
        symbols: [possibleSymbols[Math.floor(Math.random() * possibleSymbols.length)]],
        theme,
        color: color.name,
        colorHex: color.hex,
        price: parseFloat((2 + Math.random() * 2.5).toFixed(2)),
        popular: Math.random() > 0.7,
        premium: Math.random() > 0.8,
        image: `https://placehold.co/400x300/f8f4e9/${color.hex.replace("#", "")}?text=${encodeURIComponent(name)}`,
        isRealTemplate: false
      };
    });
  }, []);

  // Merge Real + Dummy Cards
  const weddingCards = useMemo(() => {
    return [...realCards, ...dummyCards];
  }, [realCards, dummyCards]);

  const filteredCards = useMemo(() => {
    return weddingCards.filter(card => {
      // 1. Filter by Category
      if (activeCategory !== 'All' && card.category !== activeCategory) {
        return false;
      }
      // 2. Filter by Subcategory
      if (activeSubCategory !== 'All' && card.subcategory !== activeSubCategory) {
        return false;
      }
      // 3. Filter by Language
      if (activeLanguage !== 'All' && (!card.language || card.language.toLowerCase() !== activeLanguage.toLowerCase())) {
        return false;
      }
      // 4. Filter by Symbol
      if (activeSymbol !== 'All') {
        if (!card.symbols || !Array.isArray(card.symbols)) return false;

        // Case-insensitive check
        const hasSymbol = card.symbols.some(s =>
          typeof s === 'string' && s.toLowerCase().trim() === activeSymbol.toLowerCase().trim()
        );

        if (!hasSymbol) return false;
      }
      return true;
    });
  }, [activeCategory, activeSubCategory, activeLanguage, activeSymbol, weddingCards]);

  const handleCustomize = (card) => {
    setSelectedCard(card);
  };

  const addToCart = () => {
    if (!selectedCard) return;
    setCart([{ ...selectedCard, customization }]);
  };

  return (
    <Routes>


      <Route path="/editor/:cardName" element={<EditorPage setCart={setCart} customization={customization} />} />


      <Route
        path="/"
        element={
          <HomePage
            customization={customization}
            weddingCards={weddingCards}
            setActiveFilter={(filter) => {
              setActiveCategory("Wedding"); // Assuming homepage filters are subcategories of Wedding for now, or we can update HomePage too
              setActiveSubCategory(filter);
            }}
          />
        }
      />

      <Route
        path="/gallery"
        element={
          <GalleryPage
            weddingCards={weddingCards}
            filteredCards={filteredCards}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeSubCategory={activeSubCategory}
            setActiveSubCategory={setActiveSubCategory}
            activeLanguage={activeLanguage}
            setActiveLanguage={setActiveLanguage}
            activeSymbol={activeSymbol}
            setActiveSymbol={setActiveSymbol}
            handleCustomize={handleCustomize}
          />
        }
      />

      <Route
        path="/customize"
        element={
          selectedCard ? (
            <CustomizePage
              selectedCard={selectedCard}
              customization={customization}
              setCustomization={setCustomization}
              addToCart={addToCart}
            />
          ) : (
            <Navigate to="/gallery" />
          )
        }
      />

      <Route
        path="/checkout"
        element={
          cart.length > 0 ? (
            <CheckoutPage
              cart={cart}
              checkoutData={checkoutData}
              setCheckoutData={setCheckoutData}
            />
          ) : (
            <Navigate to="/gallery" />
          )
        }
      />

      <Route
        path="/confirmation"
        element={
          cart.length > 0 ? (
            <ConfirmationPage
              cart={cart}
              checkoutData={checkoutData}
              setCart={setCart}
              setCheckoutData={setCheckoutData}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/upload"
        element={
          <ProtectedRoute>
            <AdminUploadPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default App;
