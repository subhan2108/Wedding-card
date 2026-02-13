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
    X
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import './AdminUploadPage.css';

const CATEGORIES = ['Floral', 'Modern', 'Minimal', 'Premium', 'Traditional', 'Vintage', 'Boho', 'Rustic', 'Classic'];

const AdminUploadPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditing = !!editId;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        tags: '',
        price: '',
        colorHex: '',
        templateJson: null,
        previewImage: null,
        backgroundImage: null
    });

    const [parsedTemplate, setParsedTemplate] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load template for editing
    useEffect(() => {
        if (isEditing) {
            const template = adminService.getTemplateById(editId);
            if (template) {
                setFormData({
                    name: template.name,
                    category: template.category || '',
                    tags: template.tags ? template.tags.join(', ') : '',
                    price: template.price || '',
                    colorHex: template.colorHex || '',
                    templateJson: null,
                    previewImage: null,
                    backgroundImage: null
                });
                setParsedTemplate(template);
                setPreviewImageUrl(template.previewImage || '');
                setBackgroundImageUrl(template.backgroundUrl || '');
            }
        }
    }, [isEditing, editId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleJsonUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const validation = adminService.validateTemplate(json);

                if (!validation.valid) {
                    setErrors(prev => ({ ...prev, templateJson: validation.error }));
                    setParsedTemplate(null);
                    return;
                }

                setParsedTemplate(json);
                setFormData(prev => ({ ...prev, templateJson: file }));
                setErrors(prev => ({ ...prev, templateJson: '' }));

                // Auto-fill fields if empty
                if (!formData.name && json.name) {
                    setFormData(prev => ({ ...prev, name: json.name }));
                }
                if (!formData.category && json.category) {
                    setFormData(prev => ({ ...prev, category: json.category }));
                }
                if (!formData.tags && json.tags) {
                    setFormData(prev => ({ ...prev, tags: json.tags.join(', ') }));
                }
                if (!formData.price && json.price) {
                    setFormData(prev => ({ ...prev, price: json.price }));
                }
                if (!formData.colorHex && json.colorHex) {
                    setFormData(prev => ({ ...prev, colorHex: json.colorHex }));
                }
            } catch (error) {
                setErrors(prev => ({ ...prev, templateJson: 'Invalid JSON file' }));
                setParsedTemplate(null);
            }
        };
        reader.readAsText(file);
    };

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, [type]: 'Please upload an image file' }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (type === 'previewImage') {
                setPreviewImageUrl(event.target.result);
                setFormData(prev => ({ ...prev, previewImage: event.target.result }));
            } else if (type === 'backgroundImage') {
                setBackgroundImageUrl(event.target.result);
                setFormData(prev => ({ ...prev, backgroundImage: event.target.result }));
            }
            setErrors(prev => ({ ...prev, [type]: '' }));
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Template name is required';
        }

        if (!isEditing && !parsedTemplate) {
            newErrors.templateJson = 'Please upload a template JSON file';
        }

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
            const templateData = {
                ...parsedTemplate,
                name: formData.name,
                category: formData.category || undefined,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,
                colorHex: formData.colorHex || undefined,
                previewImage: formData.previewImage || previewImageUrl || undefined,
            };

            // Update background URL if new image uploaded
            if (backgroundImageUrl && formData.backgroundImage) {
                templateData.backgroundUrl = backgroundImageUrl;
            }

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
                alert(`Template ${isEditing ? 'updated' : 'added'} successfully!`);
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

    const removeImage = (type) => {
        if (type === 'preview') {
            setPreviewImageUrl('');
            setFormData(prev => ({ ...prev, previewImage: null }));
        } else if (type === 'background') {
            setBackgroundImageUrl('');
            setFormData(prev => ({ ...prev, backgroundImage: null }));
        }
    };

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
                        {/* Template Details */}
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
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
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
                                <div className="field-hint">Separate multiple tags with commas (e.g., Popular, Premium)</div>
                            </div>

                            <div className="form-row">
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

                                <div className="form-group">
                                    <label htmlFor="colorHex">Color Palette</label>
                                    <select
                                        id="colorHex"
                                        name="colorHex"
                                        value={formData.colorHex}
                                        onChange={handleInputChange}
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
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="form-section">
                            <h3>Files</h3>

                            {/* JSON Upload */}
                            <div className="form-group">
                                <label>Template JSON *</label>
                                <div className="file-upload-area">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleJsonUpload}
                                        id="json-upload"
                                        className="file-input"
                                    />
                                    <label htmlFor="json-upload" className="file-upload-label">
                                        <FileJson size={32} />
                                        <span className="upload-text">
                                            {parsedTemplate ? '✓ JSON Loaded' : 'Click to upload JSON'}
                                        </span>
                                        <span className="upload-hint">Generated from convert_svg.py</span>
                                    </label>
                                </div>
                                {errors.templateJson && <div className="error-text">{errors.templateJson}</div>}
                                {parsedTemplate && (
                                    <div className="success-message">
                                        <CheckCircle size={16} />
                                        Valid template with {parsedTemplate.layers?.length || 0} layers
                                    </div>
                                )}
                            </div>

                            {/* Preview Image Upload */}
                            <div className="form-group">
                                <label>Preview Image (for gallery)</label>
                                <div className="file-upload-area">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'previewImage')}
                                        id="preview-upload"
                                        className="file-input"
                                    />
                                    <label htmlFor="preview-upload" className="file-upload-label">
                                        <ImageIcon size={32} />
                                        <span className="upload-text">
                                            {previewImageUrl ? '✓ Preview Image Uploaded' : 'Click to upload preview'}
                                        </span>
                                        <span className="upload-hint">PNG or JPG recommended</span>
                                    </label>
                                </div>
                                {previewImageUrl && (
                                    <div className="image-preview-container">
                                        <img src={previewImageUrl} alt="Preview" className="image-preview" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage('preview')}
                                            className="remove-image-btn"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Background Image Upload */}
                            <div className="form-group">
                                <label>Background Image (optional)</label>
                                <div className="file-upload-area">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                                        id="background-upload"
                                        className="file-input"
                                    />
                                    <label htmlFor="background-upload" className="file-upload-label">
                                        <ImageIcon size={32} />
                                        <span className="upload-text">
                                            {backgroundImageUrl ? '✓ Background Uploaded' : 'Click to upload background'}
                                        </span>
                                        <span className="upload-hint">Will replace JSON backgroundUrl</span>
                                    </label>
                                </div>
                                {backgroundImageUrl && (
                                    <div className="image-preview-container">
                                        <img src={backgroundImageUrl} alt="Background" className="image-preview" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage('background')}
                                            className="remove-image-btn"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
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
                            <h3>Live Preview</h3>
                            <div className="template-preview-container">
                                <div
                                    className="template-preview-canvas"
                                    style={{
                                        width: parsedTemplate.width,
                                        height: parsedTemplate.height,
                                        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
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
