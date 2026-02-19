# Wedding Platform Design System

## 1. Brand Identity
**Core Values:** Premium, Calm, Trustworthy, Elegant.
**Visual Style:** Soft gradients, plenty of whitespace, rounded corners, subtle shadows, and a clean "glassmorphic" feel.

## 2. Color Palette

### Primary Colors
- **Royal Blue**: `#1e88e5` (Primary Action, Brand Color)
- **Soft Blue**: `#6bbcff` (Secondary Action)
- **Navy Dark**: `#1a2a3a` (Headings, Strong Text)

### Neutral & Backgrounds
- **White**: `#ffffff` (Cards, Panels)
- **Off-White**: `#f8fbff` (Page Backgrounds)
- **Soft Gray**: `#f1f3f7` (Borders, Dividers)
- **Text Main**: `#1f2937`
- **Text Muted**: `#6b7280`

### Accents & Gradients
- **Golden**: `#c5a059` (Premium Accents, "Wedding" feel)
- **Rose Gradient**: `linear-gradient(135deg, #e11d48, #be123c)`
- **Amber Gradient**: `linear-gradient(135deg, #f59e0b, #d97706)`
- **Hero Gradient**: `linear-gradient(90deg, #f4fbff 0%, #ffffff 45%, #fff4e2 100%)`

## 3. Typography
**Headings**: `Playfair Display`, serif.
- Uses: Page titles, Card names, Hero slogans.
- Weights: 400 (Regular), 600 (Semi-bold).

**Body**: `Inter` ot `Montserrat`, sans-serif.
- Uses: Interface text, buttons, descriptions, inputs.
- Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold).

## 4. UI Components

### Buttons
- **Shape**: Fully rounded (`border-radius: 50px`).
- **Primary**: Blue background, white text, soft shadow.
  - Hover: Lift (`transform: translateY(-2px)`), deeper shadow.
- **Secondary/Outline**: Transparent bg, Blue border (`2px`), Blue text.
- **Text**: Transparent bg, standard text color, hover bg `#f1f3f7`.

### Cards
- **Style**: White background, `border-radius: 16px` to `24px`.
- **Shadow**: `box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08)`.
- **Interaction**: Lift on hover (`transform: translateY(-5px)`).

### Forms/Inputs
- **Style**: Clean, single line borders `#e5e9f0`.
- **Focus**: Blue border, subtle ring shadow `rgba(107, 188, 255, 0.4)`.
- **Icons**: Icons often placed inside input (left side) for context (User, Mail, Phone).

## 5. Page-Specific Guidelines

### Home Page (`HomePage.jsx`)
- **Structure**:
  - **Hero**: Split layout (Text Left, Visual Right) inside a large "Hero Card" container. Floating decorations.
  - **Features**: Grid of 3-4 items with icons.
  - **Categories**: Horizontal scroll or Grid.
- **Key Elements**: "Premium Badge", "Trust Signals" (Secure Payment logos).

### Gallery Page (`GalleryPage.jsx`)
- **Hero**: Simple header with gradient text.
- **Filters**: Pill-shaped buttons. Active state: Gradient fill.
- **Grid**: Responsive (1 col mobile -> 4 col large).
- **Cards**: Image top, Details bottom. Badges for "Premium" / "Popular" on top -left image corner.

### Customize Page (`CustomizePage.jsx`)
- **Layout**: Split View (Left: 3D Preview, Right: Controls Sidebar).
- **Sidebar**:
  - Title & Price Summary.
  - **Color Picker**: Circle swatches with checkmark.
  - **Action Button**: "Customize Details" (prominent).
  - **Pricing**: Dynamic breakdown (Unit Price x Qty = Total).

### Editor Page (`EditorPage.jsx`)
- **Theme**: "App-like" interface. Fixed height `100vh`.
- **Header**: Back button, File Name, Primary Actions (Save, Preview).
- **Sidebar**: Tabbed or accordion tools (Text, Sticker, Image).
- **Canvas**: Centered, zoomable area.
- **Note**: Supports Dark/Light mode toggle.

### Checkout Page (`CheckoutPage.jsx`)
- **Layout**: Centered, single-column "Paper" card width (`max-width: 600px`).
- **Summary**: Thumbnail text description of item.
- **Trust**: "SSL Secure" badges near payment buttons.

## 6. Icons & Assets
- **Primary Library**: `lucide-react` (Modern, clean strokes).
- **Legacy Library**: `react-bootstrap-icons` (Found in Editor, consider migrating to Lucide for consistency).
- **Graphics**: Use CSS shapes or SVG assets for background decorations (blobs, waves).
