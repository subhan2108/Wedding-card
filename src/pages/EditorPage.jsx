import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Canvas from '../components/Editor/Canvas';
import {
    ArrowLeft as BiArrowLeft,
    CloudCheck as BiCloudCheck,
    BagCheck as BiBagCheck,
    Eye as BiEye,
    Type as BiType,
    Image as BiImage,
    Square as BiSquare,
    Sliders as BiSliders,
    Stars as BiStars,
    ZoomIn as BiZoomIn,
    ZoomOut as BiZoomOut,
    ArrowCounterclockwise as BiArrowCounterclockwise,
    Save as BiSave,
    Trash as BiTrash,
    Files as BiFiles,
    ArrowUp as BiArrowUp,
    ArrowDown as BiArrowDown,
    ArrowUpShort as BiArrowUpShort,
    ArrowDownShort as BiArrowDownShort,
    Download as BiDownload,
    PlusCircle as BiPlusCircle,
    ChevronUp as BiChevronUp,
    ChevronDown as BiChevronDown,
    XCircle as BiXCircle,
    Trash2 as BiTrash2,
    Palette as BiPalette
} from 'react-bootstrap-icons';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { storageService } from '../services/storageService';
import { suggestionService } from '../services/suggestionService';
import ContextMenu from '../components/Editor/ContextMenu';
import './EditorPage.css';

const EditorPage = ({ setCart, customization }) => {
    const { cardName } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const [layers, setLayers] = useState([]);
    const [fieldValues, setFieldValues] = useState({
        bride_name: "Rose",
        groom_name: "Mursalin",
        event_date: "20 June 2024",
        venue_name: "LOREM IPSUM PARK"
    });
    const [selectedLayerId, setSelectedLayerId] = useState(null);
    const [showMargins, setShowMargins] = useState(false);
    const [showWatermark, setShowWatermark] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, layerId }
    const [selectedLayerIds, setSelectedLayerIds] = useState([]); // Multi-select support
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [editorTheme, setEditorTheme] = useState('light');

    // Multi-View Support
    const [activeViewIndex, setActiveViewIndex] = useState(0);
    const [viewLayers, setViewLayers] = useState([]); // Array of layer arrays for each view

    const location = useLocation();

    useEffect(() => {
        const templates = adminService.getTemplates();
        let foundTemplate = templates.find(t => t.id === cardName) || templates[0];

        if (foundTemplate) {
            // Handle variant selection from navigation
            const variantIndex = location.state?.variantIndex;
            if (typeof variantIndex === 'number' && foundTemplate.variants && foundTemplate.variants[variantIndex]) {
                const variant = foundTemplate.variants[variantIndex];

                // Determine if variant has valid views
                const variantViews = (variant.views || variant.jsonViews || []).filter(v => v);
                const hasVariantViews = variantViews.length > 0;

                // Create a shallow copy to avoid mutating the original template object in the store permanently for this session
                foundTemplate = {
                    ...foundTemplate,
                    // Override image/preview with variant's image
                    image: variant.previewImage || foundTemplate.image,
                    previewImage: variant.previewImage || foundTemplate.previewImage,
                    colorHex: variant.colorHex || foundTemplate.colorHex,
                    backgroundUrl: variant.backgroundUrl || foundTemplate.backgroundUrl,

                    // Override views/layers if the variant has specific JSON data
                    views: hasVariantViews ? variantViews : foundTemplate.views,
                    layers: hasVariantViews ? (variantViews[0].layers || []) : foundTemplate.layers,

                    // Override dimensions if provided in the variant's main view
                    width: (hasVariantViews && variantViews[0].width) || foundTemplate.width,
                    height: (hasVariantViews && variantViews[0].height) || foundTemplate.height
                };
            }

            setTemplate(foundTemplate);

            // Initialize Multi-View State
            const initialViews = foundTemplate.views && foundTemplate.views.length > 0
                ? foundTemplate.views.map(v => v ? v.layers || [] : [])
                : [foundTemplate.layers || foundTemplate.defaultFields || []];

            // Ensure at least 4 slots if we want fixed slots, or just dynamic. 
            // Admin saves mixed array? No, Admin saves generic array.
            // Let's stick to what's in template.views

            setViewLayers(initialViews);
            setLayers(initialViews[0] || []);
            setActiveViewIndex(0);

            // Legacy support or override from storage could go here
            // For now, let's trust the template data first for the structure
        }
    }, [cardName, location.state]);

    // Update viewLayers whenever current layers change (debounce or sync?)
    // Better to sync on specific actions or just keep them in sync?
    // Let's update viewLayers when we switch OR when saving. 
    // Actually, distinct `layers` state for current view is good for performance.
    // We need to sync `layers` back to `viewLayers` before switching.

    const handleSwitchView = (newIndex) => {
        if (newIndex === activeViewIndex) return;

        // 1. Save current layers to viewLayers
        const updatedViewLayers = [...viewLayers];
        updatedViewLayers[activeViewIndex] = layers;
        setViewLayers(updatedViewLayers);

        // 2. Switch
        setActiveViewIndex(newIndex);
        setLayers(updatedViewLayers[newIndex] || []);
        setSelectedLayerId(null);
        setHistory([]); // reset history for new view? Or keep global? Reset is safer for now.
        setHistoryIndex(-1);
    };

    // Keep viewLayers synced for final save
    useEffect(() => {
        setViewLayers(prev => {
            const newV = [...prev];
            newV[activeViewIndex] = layers;
            return newV;
        });
    }, [layers, activeViewIndex]);

    const handleFieldValueChange = (key, value) => {
        setFieldValues(prev => ({ ...prev, [key]: value }));
    };

    // Save state to history
    const saveToHistory = useCallback((newLayers) => {
        setHistory(prevHistory => {
            const newHistory = prevHistory.slice(0, historyIndex + 1);
            newHistory.push(JSON.parse(JSON.stringify(newLayers)));
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const handleUpdateLayer = useCallback((id, updates, skipHistory = false) => {
        setLayers(prevLayers => {
            const newLayers = prevLayers.map(layer =>
                layer.id === id ? { ...layer, ...updates } : layer
            );
            if (!skipHistory) {
                saveToHistory(newLayers);
            }
            return newLayers;
        });
    }, [saveToHistory]);

    const commitHistory = useCallback(() => {
        saveToHistory(layers);
    }, [saveToHistory, layers]);

    const handleAddLayer = useCallback((layerData = null) => {
        const newId = `text-${Date.now()}`;
        const newLayer = layerData || {
            id: newId,
            text: "Double click to edit",
            x: template.width / 2 - 100,
            y: template.height / 2,
            fontSize: 24,
            fontFamily: "Montserrat, sans-serif",
            color: "#000000",
            textAlign: "center",
            fontWeight: "normal",
            fontStyle: "normal",
            letterSpacing: "normal",
            zIndex: layers.length + 1
        };

        if (!newLayer.id) newLayer.id = newId;

        setLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
    }, [template, layers.length]);

    const handleDeleteLayer = useCallback((id) => {
        setLayers(prev => {
            const newLayers = prev.filter(l => l.id !== id);
            saveToHistory(newLayers);
            return newLayers;
        });
        setSelectedLayerId(null);
    }, [saveToHistory]);

    // Layer reordering
    const bringToFront = (id) => {
        const maxZIndex = Math.max(...layers.map(l => l.zIndex || 0));
        handleUpdateLayer(id, { zIndex: maxZIndex + 1 });
    };

    const sendToBack = (id) => {
        const minZIndex = Math.min(...layers.map(l => l.zIndex || 0));
        handleUpdateLayer(id, { zIndex: minZIndex - 1 });
    };

    const bringForward = (id) => {
        const layer = layers.find(l => l.id === id);
        if (layer) {
            handleUpdateLayer(id, { zIndex: (layer.zIndex || 0) + 1 });
        }
    };

    const sendBackward = (id) => {
        const layer = layers.find(l => l.id === id);
        if (layer) {
            handleUpdateLayer(id, { zIndex: (layer.zIndex || 0) - 1 });
        }
    };

    const duplicateLayer = (id) => {
        const layerToDup = layers.find(l => l.id === id);
        if (layerToDup) {
            handleAddLayer({
                ...layerToDup,
                id: `text-${Date.now()}`,
                x: layerToDup.x + 20,
                y: layerToDup.y + 20,
                zIndex: layers.length + 1
            });
        }
    };

    // --- Intelligent Features (Phase 8) ---
    const [magicTheme, setMagicTheme] = useState('ROMANTIC');

    const handleAutoLayout = useCallback(() => {
        if (!template) return;
        const tidied = suggestionService.tidyLayout(layers, template.width, template.height);
        setLayers(tidied);
        saveToHistory(tidied);
    }, [layers, template, saveToHistory]);

    const handleApplySuggestion = useCallback((type) => {
        if (!selectedLayerId) return;
        const suggestion = suggestionService.getRandomSuggestion(type, magicTheme);
        handleUpdateLayer(selectedLayerId, { text: suggestion });
    }, [selectedLayerId, magicTheme, handleUpdateLayer]);

    const handleContextMenu = (e, layerId) => {
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            layerId
        });
    };

    const handleContextMenuAction = (action, layerId) => {
        if (!layerId && selectedLayerId) layerId = selectedLayerId;
        if (!layerId) return;

        switch (action) {
            case 'duplicate': duplicateLayer(layerId); break;
            case 'delete': handleDeleteLayer(layerId); break;
            case 'lock':
                const layer = layers.find(l => l.id === layerId);
                handleUpdateLayer(layerId, { isLocked: !layer?.isLocked });
                break;
            case 'front': bringToFront(layerId); break;
            case 'back': sendToBack(layerId); break;
            default: break;
        }
    };

    // Alignment tools
    const alignLeft = (id) => {
        handleUpdateLayer(id, { x: 20 });
    };

    const alignCenter = (id) => {
        if (template) {
            handleUpdateLayer(id, { x: template.width / 2 });
        }
    };

    const alignRight = (id) => {
        if (template) {
            handleUpdateLayer(id, { x: template.width - 20 });
        }
    };

    const alignTop = (id) => {
        handleUpdateLayer(id, { y: 20 });
    };

    const alignMiddle = (id) => {
        if (template) {
            handleUpdateLayer(id, { y: template.height / 2 });
        }
    };

    const alignBottom = (id) => {
        if (template) {
            handleUpdateLayer(id, { y: template.height - 20 });
        }
    };

    // Undo/Redo
    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setLayers(JSON.parse(JSON.stringify(history[historyIndex - 1])));
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setLayers(JSON.parse(JSON.stringify(history[historyIndex + 1])));
        }
    };

    // Keyboard controls
    const handleSave = () => {
        if (!template) return;

        // Ensure current layers are saved to viewLayers
        const currentViewLayers = [...viewLayers];
        currentViewLayers[activeViewIndex] = layers;

        const result = storageService.saveDesign(cardName || 'unsaved', {
            templateId: template.id,
            layers: layers, // Curren view
            viewLayers: currentViewLayers, // All views
            fieldValues
        });
        if (result.success) {
            alert(`Design saved successfully at ${new Date(result.timestamp).toLocaleTimeString()}`);
        } else {
            alert('Error saving design: ' + (result.error || 'Unknown error'));
        }
    };

    const handleExportPNG = async () => {
        const canvasElement = document.querySelector('.editor-svg');
        if (!canvasElement) return;

        try {
            // High res scale (3x)
            const dataUrl = await toPng(canvasElement, {
                pixelRatio: 3,
                backgroundColor: '#ffffff'
            });
            const link = document.createElement('a');
            link.download = `${template?.name || 'wedding-invite'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to export image.');
        }
    };

    const handleExportPDF = async () => {
        const canvasElement = document.querySelector('.editor-svg');
        if (!canvasElement) return;

        try {
            const dataUrl = await toPng(canvasElement, {
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });

            // PDF setup based on template aspect ratio
            const pdf = new jsPDF({
                orientation: template.width > template.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [template.width, template.height]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, template.width, template.height);
            pdf.save(`${template?.name || 'wedding-invite'}.pdf`);
        } catch (err) {
            console.error('PDF Export failed', err);
            alert('Failed to generate PDF.');
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Undo/Redo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }

            // Copy/Paste
            else if (e.ctrlKey && e.key === 'c' && selectedLayerId) {
                e.preventDefault();
                const selectedLayer = layers.find(l => l.id === selectedLayerId);
                if (selectedLayer) {
                    localStorage.setItem('copiedLayer', JSON.stringify(selectedLayer));
                }
            } else if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                const copiedLayer = localStorage.getItem('copiedLayer');
                if (copiedLayer) {
                    const layer = JSON.parse(copiedLayer);
                    handleAddLayer({
                        ...layer,
                        id: `text-${Date.now()}`,
                        x: layer.x + 20,
                        y: layer.y + 20,
                        zIndex: layers.length + 1
                    });
                }
            }

            // Delete key
            else if (selectedLayerId && (e.key === 'Delete' || e.key === 'Backspace')) {
                // Don't delete if we are typing in a text field or contentEditable
                const isTyping = e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.isContentEditable;

                if (!isTyping) {
                    e.preventDefault();
                    handleDeleteLayer(selectedLayerId);
                }
            }

            // Arrow key nudging
            else if (selectedLayerId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                const selectedLayer = layers.find(l => l.id === selectedLayerId);
                if (!selectedLayer) return;

                const nudgeAmount = e.shiftKey ? 10 : 1;
                let dx = 0, dy = 0;

                if (e.key === 'ArrowUp') dy = -nudgeAmount;
                else if (e.key === 'ArrowDown') dy = nudgeAmount;
                else if (e.key === 'ArrowLeft') dx = -nudgeAmount;
                else if (e.key === 'ArrowRight') dx = nudgeAmount;

                handleUpdateLayer(selectedLayerId, {
                    x: selectedLayer.x + dx,
                    y: selectedLayer.y + dy
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLayerId, layers, historyIndex, history]);


    const handleAddToCart = async () => {
        if (!setCart) {
            console.error("setCart function not provided to EditorPage");
        }

        let previewImage = template.image;

        // Try to generate a fresh preview to reflect current edits
        const canvasElement = document.querySelector('.editor-svg');
        if (canvasElement) {
            try {
                // 1. Deselect everything to remove borders/UI
                setSelectedLayerId(null);
                // Wait for React to render the deselection
                await new Promise(resolve => setTimeout(resolve, 100));

                // 2. Generate high-quality PNG
                const dataUrl = await toPng(canvasElement, {
                    quality: 1.0,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    skipFonts: true,
                    // Use a valid base64 placeholder to avoid "empty string" errors if an image fails to load
                    imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                });

                if (dataUrl) {
                    previewImage = dataUrl;
                    // Auto-download disabled per user request
                }
            } catch (e) {
                console.error("Failed to generate checkout preview", e);
            }
        }

        const cartItem = {
            ...template,
            image: previewImage, // This will be the Edited PNG
            customization: {
                layers: layers,
                fieldValues: fieldValues,
                quantity: customization?.quantity || 100 // Use passed quantity or default
            },
            price: template.price || 5.00
        };

        console.log("Added to cart:", cartItem);
        if (setCart) {
            setCart([cartItem]);
        }
        navigate('/checkout');
    };

    // Deselect when clicking empty space (handled in Canvas, but we can do it here too if needed)
    const handleCanvasClick = () => {
        // setSelectedLayerId(null); // Optional: if canvas itself clicks
    };

    // Font Preloading
    useEffect(() => {
        if (template && template.fonts) {
            template.fonts.forEach(font => {
                if (document.fonts) {
                    document.fonts.load(font).then(() => {
                        console.log(`Font loaded: ${font}`);
                    });
                }
            });
        }
    }, [template]);

    if (!template) return <div className="loading-screen">Loading template...</div>;

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    return (
        <div className={`editor-page theme-${editorTheme} ${isPreviewMode ? 'preview-active' : ''}`}>
            {/* Top Navigation Header */}
            {!isPreviewMode && (
                <div className="editor-header">
                    <div className="header-left">
                        <button onClick={() => navigate('/gallery')} className="btn btn-outline" title="Back to Gallery">
                            <BiArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        <div className="header-title">
                            <h2>{template.name}</h2>
                        </div>

                        {/* Theme Selector */}
                        <div className="theme-selector" style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <select
                                value={editorTheme}
                                onChange={(e) => setEditorTheme(e.target.value)}
                                style={{
                                    padding: '5px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: 'var(--text-primary)',
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--border-soft)',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="light">☀️ Light</option>
                                <option value="dark">🌑 Dark</option>
                            </select>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button onClick={() => setIsPreviewMode(true)} className="btn btn-text" title="Preview Mode">
                            <BiEye size={18} />
                            <span>Preview</span>
                        </button>
                        <button onClick={handleSave} className="btn btn-text">
                            <BiCloudCheck size={18} />
                            <span>Save</span>
                        </button>
                        <div className="vertical-divider sm"></div>
                        <button onClick={handleExportPNG} className="btn btn-outline btn-sm">
                            <BiDownload size={14} /> PNG
                        </button>
                        <button onClick={handleExportPDF} className="btn btn-outline btn-sm">
                            <BiDownload size={14} /> PDF
                        </button>
                        <button onClick={handleAddToCart} className="btn btn-primary checkout-btn">
                            <BiBagCheck size={18} style={{ marginRight: '6px' }} />
                            <span>Checkout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Preview Exit Button (Phase 8) */}
            {isPreviewMode && (
                <button
                    className="exit-preview-btn"
                    onClick={() => setIsPreviewMode(false)}
                >
                    <BiXCircle size={20} />
                    <span>Exit Preview</span>
                </button>
            )}

            {/* Main Workspace */}
            <div className="editor-layout">
                {/* Unified Left Sidebar (Phase 3 Preservation) */}
                {!isPreviewMode && (
                    <div className="editor-sidebar-left">
                        <div className="sidebar-header">
                            <h3>Invite Editor</h3>
                        </div>
                        <div className="sidebar-content">
                            {/* 1. Add Element tools */}
                            <div className="data-section tools-section">
                                <h4>Add Element</h4>
                                <div className="tools-grid">
                                    <button onClick={() => handleAddLayer()} className="side-tool-btn">
                                        <BiType size={20} />
                                        <span>Text</span>
                                    </button>
                                    <button className="side-tool-btn" onClick={() => {/* TODO */ }}>
                                        <BiStars size={20} />
                                        <span>Sticker</span>
                                    </button>
                                    <button className="side-tool-btn" onClick={() => {/* TODO */ }}>
                                        <BiImage size={20} />
                                        <span>Image</span>
                                    </button>
                                    <button className="side-tool-btn" onClick={() => {/* TODO */ }}>
                                        <BiSquare size={20} />
                                        <span>Shape</span>
                                    </button>
                                </div>
                            </div>

                            {/* View Switcher (Carousel in Sidebar) */}
                            {template && ((template.views && template.views.length > 1) || (template.images && template.images.length > 1)) && (
                                <div className="data-section views-section">
                                    <h4>Card Views</h4>
                                    <div className="view-carousel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                                        <button
                                            className="btn btn-icon btn-sm"
                                            onClick={() => {
                                                const total = (template.views || template.images).length;
                                                const newIndex = (activeViewIndex - 1 + total) % total;
                                                handleSwitchView(newIndex);
                                            }}
                                            disabled={(template.views || template.images).length <= 1}
                                            title="Previous View"
                                        >
                                            <BiChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
                                        </button>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                View {activeViewIndex + 1}
                                            </span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                of {(template.views || template.images).filter(v => v).length}
                                            </span>
                                        </div>

                                        <button
                                            className="btn btn-icon btn-sm"
                                            onClick={() => {
                                                const total = (template.views || template.images).length;
                                                const newIndex = (activeViewIndex + 1) % total;
                                                handleSwitchView(newIndex);
                                            }}
                                            disabled={(template.views || template.images).length <= 1}
                                            title="Next View"
                                        >
                                            <BiChevronUp size={20} style={{ transform: 'rotate(90deg)' }} />
                                        </button>
                                    </div>
                                </div>
                            )}







                            {/* 2. Selection Properties (Contextual) */}
                            {selectedLayer && (
                                <div className="data-section properties-section">
                                    <h4>Layer Properties</h4>
                                    <textarea
                                        className="sidebar-textarea"
                                        value={selectedLayer.text}
                                        onChange={(e) => handleUpdateLayer(selectedLayer.id, { text: e.target.value })}
                                        placeholder="Edit text..."
                                    />

                                    <div className="property-row">
                                        <div className="property-col">
                                            <label>Font Family</label>
                                            <select
                                                className="sidebar-select"
                                                value={selectedLayer.fontFamily}
                                                onChange={(e) => handleUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                                            >
                                                <option value="Montserrat, sans-serif">Montserrat</option>
                                                <option value="Playfair Display, serif">Playfair</option>
                                                <option value="Great Vibes, cursive">Great Vibes</option>
                                                <option value="Inter, sans-serif">Inter</option>
                                            </select>
                                        </div>
                                        <div className="property-col" style={{ minWidth: '100px' }}>
                                            <label>Size</label>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)', borderRadius: '30px', padding: '2px 4px' }}>
                                                <button
                                                    onClick={() => handleUpdateLayer(selectedLayer.id, { fontSize: Math.max(8, (selectedLayer.fontSize || 12) - 1) })}
                                                    style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '2px' }}
                                                >
                                                    −
                                                </button>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedLayer.fontSize}</span>
                                                <button
                                                    onClick={() => handleUpdateLayer(selectedLayer.id, { fontSize: (selectedLayer.fontSize || 12) + 1 })}
                                                    style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="property-row">
                                        <div className="property-col">
                                            <label>Color</label>
                                            <div className="sidebar-color-picker">
                                                <input
                                                    type="color"
                                                    value={selectedLayer.color}
                                                    onChange={(e) => handleUpdateLayer(selectedLayer.id, { color: e.target.value })}
                                                />
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedLayer.color}</span>
                                            </div>
                                        </div>
                                        <div className="property-col">
                                            <label>Align</label>
                                            <div className="sidebar-btn-group">
                                                <button className={selectedLayer.textAlign === 'left' ? 'active' : ''} onClick={() => handleUpdateLayer(selectedLayer.id, { textAlign: 'left' })}>L</button>
                                                <button className={selectedLayer.textAlign === 'center' ? 'active' : ''} onClick={() => handleUpdateLayer(selectedLayer.id, { textAlign: 'center' })}>C</button>
                                                <button className={selectedLayer.textAlign === 'right' ? 'active' : ''} onClick={() => handleUpdateLayer(selectedLayer.id, { textAlign: 'right' })}>R</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="property-row">
                                        <div className="property-col">
                                            <label>Style</label>
                                            <div className="sidebar-btn-group" style={{ display: 'flex', gap: '4px' }}>
                                                <button style={{ flex: 1 }} className={selectedLayer.fontWeight === 'bold' ? 'active' : ''} onClick={() => handleUpdateLayer(selectedLayer.id, { fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold' })}>Bold</button>
                                                <button style={{ flex: 1 }} className={selectedLayer.fontStyle === 'italic' ? 'active' : ''} onClick={() => handleUpdateLayer(selectedLayer.id, { fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic' })}>Italic</button>
                                                <button style={{ flex: 1 }} className={selectedLayer.textTransform === 'uppercase' ? 'active' : ''} onClick={() => handleUpdateLayer(selectedLayer.id, { textTransform: selectedLayer.textTransform === 'uppercase' ? 'none' : 'uppercase' })}>Caps</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="property-row" style={{ marginTop: '15px' }}>
                                        <div className="property-col">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <label>Letter Spacing</label>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{parseInt(selectedLayer.letterSpacing) || 0}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleUpdateLayer(selectedLayer.id, { letterSpacing: Math.max(-5, (parseInt(selectedLayer.letterSpacing) || 0) - 1) })}
                                                    style={{ width: '28px', height: '28px', border: '1px solid var(--border-soft)', background: 'var(--bg-secondary)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', paddingBottom: '2px', fontSize: '16px' }}
                                                >
                                                    −
                                                </button>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 5px' }}>
                                                    <input
                                                        type="range"
                                                        min="-5" max="50"
                                                        value={parseInt(selectedLayer.letterSpacing) || 0}
                                                        onChange={(e) => handleUpdateLayer(selectedLayer.id, { letterSpacing: parseInt(e.target.value) })}
                                                        style={{ width: '100%', accentColor: 'var(--text-primary)', height: '4px', borderRadius: '2px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleUpdateLayer(selectedLayer.id, { letterSpacing: Math.min(50, (parseInt(selectedLayer.letterSpacing) || 0) + 1) })}
                                                    style={{ width: '28px', height: '28px', border: '1px solid var(--border-soft)', background: 'var(--bg-secondary)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontSize: '16px' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Layer Management Controls */}
                                    <div style={{ marginTop: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '8px' }}>Layer Order</label>
                                        <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                style={{ flex: 1 }}
                                                onClick={() => bringForward(selectedLayer.id)}
                                                title="Bring Forward"
                                            >
                                                <BiArrowUpShort size={16} />
                                                <span>Forward</span>
                                            </button>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                style={{ flex: 1 }}
                                                onClick={() => sendBackward(selectedLayer.id)}
                                                title="Send Backward"
                                            >
                                                <BiArrowDownShort size={16} />
                                                <span>Backward</span>
                                            </button>
                                        </div>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            style={{ width: '100%', marginBottom: '12px' }}
                                            onClick={() => duplicateLayer(selectedLayer.id)}
                                            title="Duplicate Layer"
                                        >
                                            <BiFiles size={14} />
                                            <span>Duplicate Layer</span>
                                        </button>
                                    </div>

                                    <button
                                        className="btn-delete-layer"
                                        style={{ marginTop: '12px' }}
                                        onClick={() => handleDeleteLayer(selectedLayer.id)}
                                    >
                                        <BiTrash size={14} />
                                        <span>Remove Element</span>
                                    </button>
                                </div>
                            )}

                            {/* 4. Magic Tools (RETAINED) */}
                            <div className="data-section magic-section">
                                <h4><BiStars size={14} style={{ marginRight: '6px' }} /> Magic Tools</h4>
                                <div className="data-field">
                                    <label>Creative Tone</label>
                                    <select
                                        className="sidebar-select"
                                        style={{ marginBottom: '10px' }}
                                        value={magicTheme}
                                        onChange={(e) => setMagicTheme(e.target.value)}
                                    >
                                        <option value="ROMANTIC">Romantic & Sweet</option>
                                        <option value="MODERN">Modern & Bold</option>
                                        <option value="TRADITIONAL">Traditional & Formal</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => handleApplySuggestion('headers')}>Header</button>
                                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => handleApplySuggestion('bodies')}>Body</button>
                                </div>
                                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={handleAutoLayout}>Magic Tidy</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Canvas Area container */}
                <div className="editor-canvas-container" onClick={() => setSelectedLayerId(null)}>
                    <div className="canvas-wrapper" onClick={(e) => e.stopPropagation()}>
                        <Canvas
                            width={template.views?.[activeViewIndex]?.width || template.width}
                            height={template.views?.[activeViewIndex]?.height || template.height}
                            backgroundUrl={
                                // Use view specific background if available, else standard fallback
                                template.images?.[activeViewIndex] ||
                                template.views?.[activeViewIndex]?.backgroundUrl ||
                                template.backgroundUrl
                            }
                            layers={layers}
                            selectedLayerId={selectedLayerId}
                            onSelectLayer={setSelectedLayerId}
                            onUpdateLayer={handleUpdateLayer}
                            onCommitHistory={commitHistory}
                            fieldValues={fieldValues}
                            showMargins={showMargins}
                            showWatermark={showWatermark}
                            isPreview={isPreviewMode}
                            zoom={zoom}
                            onContextMenu={handleContextMenu}
                        />
                    </div>



                    {/* Zoom UI Refresh */}
                    {!isPreviewMode && (
                        <div className="zoom-controls">
                            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} title="Zoom Out">
                                <BiZoomOut size={18} />
                            </button>
                            <span>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} title="Zoom In">
                                <BiZoomIn size={18} />
                            </button>
                            <button className="zoom-reset-btn" onClick={() => setZoom(1)} title="Reset Zoom">
                                <BiArrowCounterclockwise size={18} />
                            </button>
                        </div>
                    )}

                    {/* Context Menu */}
                    {contextMenu && (
                        <ContextMenu
                            x={contextMenu.x}
                            y={contextMenu.y}
                            layer={layers.find(l => l.id === contextMenu.layerId)}
                            onAction={handleContextMenuAction}
                            onClose={() => setContextMenu(null)}
                        />
                    )}
                </div>
            </div>
        </div >
    );
};

export default EditorPage;
