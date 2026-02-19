import React, { useState, useMemo, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

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

// Auth Components
import ProtectedRoute from "./components/ProtectedRoute"; // Keep original if needed, or remove if unused
import { AdminRoute } from "./components/Auth/RouteGuards";
import AuthModal from "./components/Auth/AuthModal";

// Layout
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";

// Services
import { adminService } from "./services/adminService";
import MyOrdersPage from './pages/MyOrdersPage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth(); // Auth

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
  const [isLoading, setIsLoading] = useState(false);

  // Simulate global loading transition
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeCategory, activeSubCategory, activeLanguage, activeSymbol, location.pathname]);

  // Helper function to get color name from hex (defined before use)
  const getColorName = (hex) => {
    if (!hex) return 'Gold'; // Default for missing hex

    // Normalize hex to uppercase
    const normalizedHex = hex.toUpperCase();

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
      '#E6E6FA': 'Lavender',
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#FF0000': 'Red',
      '#00FF00': 'Green',
      '#0000FF': 'Blue'
    };
    return colorMap[normalizedHex] || 'Custom';
  };

  // State for Real Cards (fetched from Admin)
  const [realCards, setRealCards] = useState([]);

  // Fetch real templates whenever location changes (e.g. returning from Admin)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const realTemplates = await adminService.getTemplates();

        if (!Array.isArray(realTemplates)) {
          console.error("Expected array from getTemplates, got:", realTemplates);
          setRealCards([]);
          return;
        }

        const formattedCards = realTemplates.map(template => {
          // Normalize properties from DB (snake_case) or Local (camelCase)
          const colorHex = template.color_hex || template.colorHex || '#D4AF37';
          const previewUrl = template.preview_url || template.previewImage || template.background_url || template.backgroundUrl || `https://placehold.co/400x300/f8f4e9/${colorHex.replace('#', '')}?text=${encodeURIComponent(template.name)}`;

          return {
            id: template.id,
            name: template.name,
            category: template.category || 'Wedding', // Default to Wedding if missing
            subcategory: template.subcategory || template.category || 'General',
            language: template.language || 'English',
            symbols: Array.isArray(template.symbols)
              ? template.symbols
              : (typeof template.symbols === 'string' ? template.symbols.split(',').map(s => s.trim()).filter(Boolean) : []),
            theme: template.subcategory || template.category || 'General', // Legacy support
            color: getColorName(colorHex),
            colorHex: colorHex,
            price: template.price || parseFloat((2 + Math.random() * 2.5).toFixed(2)),
            popular: template.tags?.includes('Popular') || false,
            premium: template.tags?.includes('Premium') || false,
            image: previewUrl,
            variants: template.variants || [],
            // Keep the original template data for editing
            isRealTemplate: true,
            template: template
          };
        });
        setRealCards(formattedCards);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setRealCards([]);
      }
    };

    fetchTemplates();
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

    const categories = ["Wedding", "Birthday", "Funeral", "Party", "Baby Shower"];

    return Array.from({ length: 120 }).map((_, i) => {
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const name = `${names[Math.floor(Math.random() * names.length)]} ${i + 1}`;
      const category = categories[Math.floor(Math.random() * categories.length)];

      return {
        id: `dummy-${i + 1}`,
        name,
        category: category,
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
    // PROTECTED ACTION: Open modal if not logged in
    if (!user) {
      openAuthModal();
      return;
    }
    setSelectedCard(card);
    navigate('/customize');
  };

  const addToCart = () => {
    // PROTECTED ACTION
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedCard) return;
    setCart([{ ...selectedCard, customization }]);
    navigate('/checkout');
  };

  return (
    <>
      <AuthModal />
      <Navbar cartCount={cart.length} />
      <div className="main-content" style={{ minHeight: 'calc(100vh - 300px)', paddingTop: '80px' }}>
        <Routes>
          <Route path="/editor/:cardName" element={<EditorPage setCart={setCart} customization={customization} loading={isLoading} />} />

          <Route
            path="/"
            element={
              <HomePage
                customization={customization}
                weddingCards={weddingCards}
                setActiveCategory={setActiveCategory}
                setActiveSubCategory={setActiveSubCategory}
                loading={isLoading}
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
                loading={isLoading}
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
                  loading={isLoading}
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
                  loading={isLoading}
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
                  loading={isLoading}
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
              // <AdminRoute>
              <AdminDashboardPage />
              // </AdminRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              // <AdminRoute>
              <AdminUploadPage />
              // </AdminRoute>
            }
          />

          <Route
            path="/my-orders"
            element={<MyOrdersPage />}
          />

        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
