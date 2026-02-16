import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    FileJson,
    Image as ImageIcon,
    Save,
    Eye,
    AlertCircle,
    CheckCircle,
    X,
    Plus,
    Trash2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import './AdminUploadPage.css';

const CATEGORIES = {
    'Wedding': ['Floral', 'Modern', 'Minimal', 'Premium', 'Traditional', 'Vintage', 'Boho', 'Rustic', 'Classic'],
    'Birthday': ['Kids', 'Teens', 'Adults', 'Milestone', 'Surprise', 'Fun', 'Elegant'],
    'Funeral': ['Traditional', 'Religious', 'Modern', 'Simple', 'Floral', 'Obituary'],
    'Party': ['Dinner', 'Cocktail', 'House Party', 'Pool Party', 'Graduation'],
    'Baby Shower': ['Boy', 'Girl', 'Neutral', 'Twins']
};

const AdminUploadPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditing = !!editId;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subcategory: '', // Added subcategory
        language: 'English',
        symbols: '',
        tags: '',
        price: '',
        variants: [
            {
                id: Date.now(),
                colorHex: '',
                previewImage: null,
                backgroundImage: null,
                images: Array(4).fill(null),
                jsonViews: Array(4).fill(null)
            }
        ]
    });

    const [parsedTemplate, setParsedTemplate] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);

    // Load template for editing
    useEffect(() => {
        if (isEditing) {
            const template = adminService.getTemplateById(editId);
            if (template) {
                // Handle legacy templates (no variants array) or new templates
                let variants = template.variants;

                if (!variants || variants.length === 0) {
                    // Create default variant from root properties
                    variants = [{
                        id: Date.now(),
                        colorHex: template.colorHex || '',
                        previewImage: template.previewImage || null,
                        backgroundImage: template.backgroundUrl || null,
                        images: template.images ?
                            Array(4).fill(null).map((_, i) => template.images[i] || null) :
                            Array(4).fill(null),
                        jsonViews: template.views ?
                            Array(4).fill(null).map((_, i) => template.views[i] || null) :
                            [template, null, null, null]
                    }];
                } else {
                    // Normalize loaded variants to ensure arrays are correct length and IDs exist
                    variants = variants.map((v, idx) => ({
                        ...v,
                        id: v.id || Date.now() + idx,
                        images: Array(4).fill(null).map((_, i) => (v.images && v.images[i]) || null),
                        jsonViews: Array(4).fill(null).map((_, i) => (v.jsonViews && v.jsonViews[i]) || (v.views && v.views[i]) || null)
                    }));
                }

                setFormData({
                    name: template.name,
                    category: template.category || '',
                    subcategory: template.subcategory || '', // Load subcategory if exists
                    language: template.language || 'English',
                    symbols: Array.isArray(template.symbols) ? template.symbols.join(', ') : (template.symbols || ''),
                    tags: Array.isArray(template.tags) ? template.tags.join(', ') : (template.tags || ''),
                    price: template.price || '',
                    variants: variants
                });

                // Set initial parsed template from first variant's main view
                if (variants[0]?.jsonViews[0]) {
                    setParsedTemplate(variants[0].jsonViews[0]);
                }
            }
        }
    }, [isEditing, editId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'category') {
            // Reset subcategory when category changes
            setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Variant Management
    const addVariant = () => {
        if (formData.variants.length >= 4) return;

        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    id: Date.now(),
                    colorHex: '',
                    previewImage: null,
                    backgroundImage: null,
                    images: Array(4).fill(null),
                    jsonViews: Array(4).fill(null)
                }
            ]
        }));
        setActiveVariantIndex(formData.variants.length);
    };

    const removeVariant = (index) => {
        if (formData.variants.length <= 1) return;

        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variants: newVariants }));

        if (activeVariantIndex >= index && activeVariantIndex > 0) {
            setActiveVariantIndex(activeVariantIndex - 1);
        }
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData(prev => ({ ...prev, variants: newVariants }));
        setErrors(prev => ({ ...prev, [`variant${index}_${field}`]: '' }));
    };

    // File Handlers
    const handleVariantJsonUpload = (e, variantIndex, viewIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);

                if (!json.layers) {
                    setErrors(prev => ({ ...prev, [`variant${variantIndex}_view${viewIndex}`]: 'Invalid JSON: missing layers' }));
                    return;
                }

                const newVariants = [...formData.variants];
                const newViews = [...newVariants[variantIndex].jsonViews];
                newViews[viewIndex] = json;
                newVariants[variantIndex] = { ...newVariants[variantIndex], jsonViews: newViews };

                setFormData(prev => ({ ...prev, variants: newVariants }));
                setErrors(prev => ({ ...prev, [`variant${variantIndex}_view${viewIndex}`]: '' }));

                // Auto-fill top-level fields from PRIMARY view of FIRST variant
                if (variantIndex === 0 && viewIndex === 0) {
                    // Check if top-level fields are empty before overwriting
                    if (!formData.name && json.name) setFormData(prev => ({ ...prev, name: json.name }));
                    if (!formData.category && json.category) setFormData(prev => ({ ...prev, category: json.category }));
                    if (!formData.price && json.price) setFormData(prev => ({ ...prev, price: json.price }));
                }

                // If uploading a view for the active variant, update parsedTemplate if it's the main view
                if (variantIndex === activeVariantIndex && viewIndex === 0) {
                    setParsedTemplate(json);
                }
            } catch (error) {
                setErrors(prev => ({ ...prev, [`variant${variantIndex}_view${viewIndex}`]: 'Invalid JSON syntax' }));
            }
        };
        reader.readAsText(file);
    };

    const removeJsonView = (variantIndex, viewIndex) => {
        const newVariants = [...formData.variants];
        const newViews = [...newVariants[variantIndex].jsonViews];
        newViews[viewIndex] = null;
        newVariants[variantIndex] = { ...newVariants[variantIndex], jsonViews: newViews };

        setFormData(prev => ({ ...prev, variants: newVariants }));
        if (variantIndex === activeVariantIndex && viewIndex === 0) setParsedTemplate(null);
    };

    const handleVariantImageChange = (index, type, value) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [type]: value };
        setFormData(prev => ({ ...prev, variants: newVariants }));
        setErrors(prev => ({ ...prev, [`variant${index}_${type}`]: '' }));
    };

    const handleVariantMultiImageChange = (variantIndex, imageIndex, value) => {
        const newVariants = [...formData.variants];
        const newImages = [...newVariants[variantIndex].images];
        newImages[imageIndex] = value;
        newVariants[variantIndex] = { ...newVariants[variantIndex], images: newImages };
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeVariantImage = (variantIndex, type) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex] = { ...newVariants[variantIndex], [type]: null };
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeVariantMultiImage = (variantIndex, imageIndex) => {
        const newVariants = [...formData.variants];
        const newImages = [...newVariants[variantIndex].images];
        newImages[imageIndex] = null;
        newVariants[variantIndex] = { ...newVariants[variantIndex], images: newImages };
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Template name is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (formData.category && !formData.subcategory && CATEGORIES[formData.category] && CATEGORIES[formData.category].length > 0) {
            newErrors.subcategory = 'Sub-category is required';
        }

        formData.variants.forEach((variant, idx) => {
            if (!variant.jsonViews[0]) {
                newErrors[`variant${idx}_view0`] = `Main View is required for Variant ${idx + 1}`;
            }
            if (!variant.colorHex) {
                newErrors[`variant${idx}_colorHex`] = `Color is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Base template data (using the first variant as the "primary" one for backward compat)
            const primaryVariant = formData.variants[0];
            const mainView = primaryVariant.jsonViews[0] || {};

            const templateData = {
                ...mainView, // Spread main view props like width, height, etc.
                name: formData.name,
                category: formData.category,
                subcategory: formData.subcategory,
                language: formData.language,
                symbols: formData.symbols ? formData.symbols.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,

                // Top-level properties corresponding to the PRIMARY variant (for simple display)
                colorHex: primaryVariant.colorHex,
                previewImage: primaryVariant.previewImage || undefined,
                backgroundUrl: primaryVariant.backgroundImage || undefined,
                images: (primaryVariant.images || []).filter(img => img !== null),
                views: primaryVariant.jsonViews.filter(v => v !== null),

                // Store ALL variants fully
                variants: formData.variants.map(v => ({
                    id: v.id,
                    colorHex: v.colorHex,
                    previewImage: v.previewImage,
                    backgroundUrl: v.backgroundImage,
                    images: (v.images || []).filter(img => img !== null),
                    jsonViews: v.jsonViews.filter(view => view !== null),
                    // Also maintain 'views' alias inside variants for consistency
                    views: v.jsonViews.filter(view => view !== null)
                }))
            };

            // Generate slug from name if no ID
            if (!templateData.id) {
                templateData.id = adminService.generateSlug(formData.name);
            }

            let result;
            if (isEditing) {
                result = adminService.updateTemplate(editId, templateData);
            } else {
                result = adminService.addTemplate(templateData);
            }

            if (result.success) {
                alert(`Template ${isEditing ? 'updated' : 'added'} successfully`);
                navigate('/admin/dashboard');
            } else {
                setErrors({ submit: result.error });
            }
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // helper to get active variant data
    const activeVariant = formData.variants[activeVariantIndex];

    return (
        <div className="admin-upload-page">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-content">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1>{isEditing ? 'Edit Template' : 'Upload New Template'}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="upload-container">
                <form onSubmit={handleSubmit} className="upload-form">
                    {/* Left Column - Form */}
                    <div className="form-column">
                        {/* Common Details */}
                        <div className="form-section">
                            <h3>Template Details</h3>

                            <div className="form-group">
                                <label htmlFor="name">Template Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Elegant Floral Wedding"
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <div className="error-text">{errors.name}</div>}
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="category">Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={errors.category ? 'error' : ''}
                                    >
                                        <option value="">Select Category</option>
                                        {Object.keys(CATEGORIES).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {errors.category && <div className="error-text">{errors.category}</div>}
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="subcategory">Sub-Category *</label>
                                    <select
                                        id="subcategory"
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleInputChange}
                                        disabled={!formData.category}
                                        className={errors.subcategory ? 'error' : ''}
                                    >
                                        <option value="">Select Sub-Category</option>
                                        {formData.category && CATEGORIES[formData.category]?.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="language">Language</label>
                                    <select
                                        id="language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                    >
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Urdu">Urdu</option>
                                        <option value="Mixed">Mixed</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="symbols">Symbols / Stickers (comma-separated)</label>
                                    <input
                                        id="symbols"
                                        type="text"
                                        name="symbols"
                                        value={formData.symbols}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Om, Ganesha, Moon, Cross"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags (comma-separated)</label>
                                <input
                                    id="tags"
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Popular, Premium, Elegant"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">Price per Card ($)</label>
                                <input
                                    id="price"
                                    type="number"
                                    name="price"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 4.10"
                                />
                            </div>
                        </div>

                        {/* Variants Management */}
                        <div className="variants-container">
                            <div className="section-header-row" style={{ marginBottom: '16px', justifyContent: 'space-between', display: 'flex' }}>
                                <h3>Color Variants</h3>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="btn-add-variant"
                                    disabled={formData.variants.length >= 4}
                                >
                                    <Plus size={16} />
                                    <span>Add Color Variant</span>
                                </button>
                            </div>

                            {/* Tabs for Variants */}
                            <div className="variant-tabs">
                                {formData.variants.map((variant, index) => (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        className={`variant-tab ${activeVariantIndex === index ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveVariantIndex(index);
                                            // Update preview to this variant's main view
                                            if (variant.jsonViews[0]) {
                                                setParsedTemplate(variant.jsonViews[0]);
                                            } else {
                                                setParsedTemplate(null);
                                            }
                                        }}
                                    >
                                        <div
                                            className="color-dot"
                                            style={{ backgroundColor: variant.colorHex || '#ddd' }}
                                        />
                                        <span>Variant {index + 1}</span>
                                        {formData.variants.length > 1 && (
                                            <span
                                                className="remove-tab-x"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeVariant(index);
                                                }}
                                            >
                                                ×
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Active Variant Form */}
                            <div className="form-section variant-form-section">
                                <div className="variant-header">
                                    <h4>Variant {activeVariantIndex + 1} Settings</h4>
                                    {formData.variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(activeVariantIndex)}
                                            className="btn-remove-variant"
                                        >
                                            <Trash2 size={16} />
                                            Remove Variant
                                        </button>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Color Palette *</label>
                                    <select
                                        value={activeVariant.colorHex}
                                        onChange={(e) => handleVariantChange(activeVariantIndex, 'colorHex', e.target.value)}
                                        className={errors[`variant${activeVariantIndex}_colorHex`] ? 'error' : ''}
                                    >
                                        <option value="">Select color</option>
                                        <option value="#D4AF37">Gold</option>
                                        <option value="#C0C0C0">Silver</option>
                                        <option value="#800020">Burgundy</option>
                                        <option value="#FFFFF0">Ivory</option>
                                        <option value="#DE5D83">Blush</option>
                                        <option value="#000080">Navy</option>
                                        <option value="#50C878">Emerald</option>
                                        <option value="#E0BFB8">Rose Gold</option>
                                        <option value="#BCB88A">Sage</option>
                                        <option value="#E6E6FA">Lavender</option>
                                        <option value="#000000">Black</option>
                                        <option value="#FFFFFF">White</option>
                                    </select>
                                    {errors[`variant${activeVariantIndex}_colorHex`] && (
                                        <div className="error-text">{errors[`variant${activeVariantIndex}_colorHex`]}</div>
                                    )}
                                </div>

                                {/* JSON Uploads */}
                                <div className="form-group">
                                    <label>Template Views (JSON) *</label>
                                    <div className="field-hint">Upload up to 4 JSON files for this color variant. View 1 is main.</div>
                                    <div className="multi-image-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {activeVariant.jsonViews.map((view, viewIndex) => (
                                            <div key={viewIndex} className="multi-image-slot">
                                                <div className="slot-label">
                                                    {viewIndex === 0 ? 'View 1 (Main)' : `View ${viewIndex + 1}`}
                                                </div>
                                                {view ? (
                                                    <div className="slot-preview" style={{ background: '#f8f9fa', flexDirection: 'column', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FileJson size={24} color="#666" />
                                                        <span style={{ fontSize: '11px', marginTop: '5px', textAlign: 'center' }}>
                                                            {view.name || 'Template'}
                                                        </span>
                                                        <span style={{ fontSize: '10px', color: '#888' }}>
                                                            {view.layers?.length || 0} layers
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeJsonView(activeVariantIndex, viewIndex)}
                                                            className="remove-slot-btn"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="slot-empty">
                                                        <input
                                                            type="file"
                                                            accept=".json"
                                                            onChange={(e) => handleVariantJsonUpload(e, activeVariantIndex, viewIndex)}
                                                            id={`variant-${activeVariantIndex}-json-${viewIndex}`}
                                                            className="hidden-input"
                                                        />
                                                        <label htmlFor={`variant-${activeVariantIndex}-json-${viewIndex}`} className="slot-upload-label">
                                                            <Upload size={16} />
                                                            <span>Upload JSON</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors[`variant${activeVariantIndex}_view0`] && (
                                        <div className="error-text">{errors[`variant${activeVariantIndex}_view0`]}</div>
                                    )}
                                </div>

                                {/* Preview Image */}
                                <div className="form-group">
                                    <label>Preview Image URL (for gallery)</label>
                                    <div className="url-input-container">
                                        <input
                                            type="text"
                                            placeholder="https://example.com/preview.png"
                                            value={activeVariant.previewImage || ''}
                                            onChange={(e) => handleVariantImageChange(activeVariantIndex, 'previewImage', e.target.value)}
                                            className="url-input"
                                        />
                                    </div>
                                    {activeVariant.previewImage && (
                                        <div className="image-preview-container">
                                            <img src={activeVariant.previewImage} alt="Preview" className="image-preview"
                                                onError={(e) => e.target.style.display = 'none'}
                                                onLoad={(e) => e.target.style.display = 'block'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeVariantImage(activeVariantIndex, 'previewImage')}
                                                className="remove-image-btn"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Background Image */}
                                <div className="form-group">
                                    <label>Background Image URL (optional)</label>
                                    <div className="url-input-container">
                                        <input
                                            type="text"
                                            placeholder="https://example.com/background.jpg"
                                            value={activeVariant.backgroundImage || ''}
                                            onChange={(e) => handleVariantImageChange(activeVariantIndex, 'backgroundImage', e.target.value)}
                                            className="url-input"
                                        />
                                    </div>
                                    {activeVariant.backgroundImage && (
                                        <div className="image-preview-container">
                                            <img src={activeVariant.backgroundImage} alt="Background" className="image-preview"
                                                onError={(e) => e.target.style.display = 'none'}
                                                onLoad={(e) => e.target.style.display = 'block'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeVariantImage(activeVariantIndex, 'backgroundImage')}
                                                className="remove-image-btn"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Gallery Images */}
                                <div className="section-header-row">
                                    <h3>Gallery Images</h3>
                                    <div className="image-counter">
                                        <span className="counter-badge">
                                            {(activeVariant.images || []).filter(Boolean).length} / 4 Uploaded
                                        </span>
                                    </div>
                                </div>
                                <div className="multi-image-grid">
                                    {(activeVariant.images || []).map((img, index) => (
                                        <div key={index} className="multi-image-slot">
                                            <div className="slot-label">Image {index + 1}</div>
                                            {img ? (
                                                <div className="slot-preview">
                                                    <img src={img} alt={`View ${index + 1}`}
                                                        onError={(e) => e.target.style.display = 'none'}
                                                        onLoad={(e) => e.target.style.display = 'block'}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantMultiImage(activeVariantIndex, index)}
                                                        className="remove-slot-btn"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="slot-empty">
                                                    <div className="slot-url-input-container">
                                                        <input
                                                            type="text"
                                                            placeholder="Image URL"
                                                            onChange={(e) => handleVariantMultiImageChange(activeVariantIndex, index, e.target.value)}
                                                            className="url-input-small"
                                                            value=""  /* Always empty here as filled slots go to the 'img' block */
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Errors */}
                        {errors.submit && (
                            <div className="error-banner">
                                <AlertCircle size={20} />
                                <span>{errors.submit}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="btn-secondary"
                                disabled={!parsedTemplate}
                            >
                                <Eye size={20} />
                                <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                            </button>
                            <button
                                type="submit"
                                className="btn-primary-1"
                                disabled={isSubmitting}
                            >
                                <Save size={20} />
                                <span>{isSubmitting ? 'Saving...' : (isEditing ? 'Update Template' : 'Upload & Publish')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    {showPreview && parsedTemplate && (
                        <div className="preview-column">
                            <h3>Live Preview ({activeVariant.colorHex ? 'Active Variant' : 'Main View'})</h3>
                            <div className="template-preview-container">
                                <div
                                    className="template-preview-canvas"
                                    style={{
                                        width: parsedTemplate.width,
                                        height: parsedTemplate.height,
                                        backgroundImage: activeVariant.backgroundImage ? `url(${activeVariant.backgroundImage})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <svg
                                        width={parsedTemplate.width}
                                        height={parsedTemplate.height}
                                        style={{ display: 'block' }}
                                    >
                                        {parsedTemplate.layers?.map((layer, i) => (
                                            <text
                                                key={i}
                                                x={layer.x}
                                                y={layer.y}
                                                fontSize={layer.fontSize}
                                                fontFamily={layer.fontFamily}
                                                fill={layer.color}
                                                textAnchor={layer.textAlign === 'center' ? 'middle' : layer.textAlign === 'right' ? 'end' : 'start'}
                                                fontWeight={layer.fontWeight}
                                                fontStyle={layer.fontStyle}
                                                letterSpacing={layer.letterSpacing}
                                            >
                                                {layer.text}
                                            </text>
                                        ))}
                                    </svg>
                                </div>
                                <div className="preview-info">
                                    <p><strong>Variant Color:</strong> <span style={{ display: 'inline-block', width: '12px', height: '12px', background: activeVariant.colorHex || '#000', borderRadius: '50%' }}></span> {activeVariant.colorHex || 'N/A'}</p>
                                    <p><strong>Dimensions:</strong> {parsedTemplate.width} × {parsedTemplate.height}px</p>
                                    <p><strong>Layers:</strong> {parsedTemplate.layers?.length || 0}</p>
                                    <p><strong>Slug:</strong> {parsedTemplate.id || adminService.generateSlug(formData.name)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminUploadPage;
