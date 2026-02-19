
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext'; // Import useAuth
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
import { Skeleton, SkeletonText } from '../components/common/Skeleton';
import './EditorPage.css';

const EditorPage = ({ setCart, customization, loading }) => {
    const { cardName } = useParams();
    const navigate = useNavigate();
    const { user, openAuthModal } = useAuth();

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
    const [inputLanguage, setInputLanguage] = useState('en'); // 'en' or 'hi'

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

            // Handle order view/edit scenario
            const searchParams = new URLSearchParams(location.search);
            const orderId = searchParams.get('orderId');

            if (orderId) {
                // Fetch the order data to get user's design
                // NOTE: In a real app, this should probably be done via a service or effect 
                // that runs when the component mounts, not inside this template logic block.
                // However, for immediate integration, we'll try to fetch it here or handle it.
                // A better approach: distinct effect for initial load.
            }

            setTemplate(foundTemplate);

            // Initialize Multi-View State
            const initialViews = foundTemplate.views && foundTemplate.views.length > 0
                ? foundTemplate.views.map(v => v ? v.layers || [] : [])
                : [foundTemplate.layers || foundTemplate.defaultFields || []];


            setViewLayers(initialViews);
            setLayers(initialViews[0] || []);
            setActiveViewIndex(0); // Ensure we start at view 0
        }
    }, [cardName, location.state, location.search]);

    // Effect to load design from Order ID if present
    useEffect(() => {
        const fetchOrderDesign = async () => {
            const searchParams = new URLSearchParams(location.search);
            const orderId = searchParams.get('orderId');

            if (orderId && template) {
                try {
                    const orderData = await adminService.getOrderById(orderId);

                    if (orderData && orderData.design_data) {
                        let savedDesign = orderData.design_data;

                        if (typeof savedDesign === 'string') {
                            try { savedDesign = JSON.parse(savedDesign); } catch (e) { /* ignore */ }
                        }

                        // Handle structure: sometimes savedDesign is the customization object directly,
                        // sometimes it might be nested
                        // Check for template overrides (background, dimensions, etc.) in the saved design
                        // This handles cases where a variant (different color/bg) was used
                        if (template) {
                            const updates = {};
                            // Check top-level properties if savedDesign is the full cart item
                            if (savedDesign.backgroundUrl) updates.backgroundUrl = savedDesign.backgroundUrl;
                            if (savedDesign.image) updates.image = savedDesign.image; // Layout image
                            if (savedDesign.previewImage) updates.previewImage = savedDesign.previewImage;
                            if (savedDesign.colorHex) updates.colorHex = savedDesign.colorHex;
                            if (savedDesign.width) updates.width = savedDesign.width;
                            if (savedDesign.height) updates.height = savedDesign.height;

                            if (Object.keys(updates).length > 0) {
                                console.log("Restoring template overrides from order:", updates);
                                setTemplate(prev => ({ ...prev, ...updates }));
                            }
                        }

                        let customizationBytes = savedDesign;
                        if (savedDesign.customization) {
                            customizationBytes = savedDesign.customization;
                        }

                        const savedLayers = customizationBytes.layers;
                        const savedViewLayers = customizationBytes.viewLayers;

                        if (savedLayers && Array.isArray(savedLayers)) {
                            console.log("Loading layers from order:", savedLayers.length);

                            // If viewLayers (multi-view history) exists, restore it.
                            if (savedViewLayers && Array.isArray(savedViewLayers)) {
                                setViewLayers(savedViewLayers);
                                // Force start at View 0 to ensure background/layers alignment
                                if (savedViewLayers[0]) {
                                    setLayers(savedViewLayers[0]);
                                } else {
                                    setLayers(savedLayers);
                                }
                                setActiveViewIndex(0);
                            } else {
                                // If legacy single view, sync it
                                setLayers(savedLayers);
                                setViewLayers(prev => {
                                    const newV = [...prev];
                                    newV[0] = savedLayers;
                                    return newV;
                                });
                            }
                        }

                        if (customizationBytes.fieldValues) {
                            setFieldValues(customizationBytes.fieldValues);
                        }
                    }
                } catch (e) {
                    console.error("Error loading order design:", e);
                }
            }
        };

        // Only run if template is firmly loaded (so we have base dimensions etc)
        if (template) {
            fetchOrderDesign();
        }
    }, [location.search, template?.id]); // Depend on template.id so it re-runs when template loads

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
        const newId = `text - ${Date.now()} `;
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
                id: `text - ${Date.now()} `,
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
            alert(`Design saved successfully at ${new Date(result.timestamp).toLocaleTimeString()} `);
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
                        id: `text - ${Date.now()} `,
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
        if (!user) {
            openAuthModal();
            return;
        }

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

        // Ensure current layers are saved to viewLayers before checkout
        const currentViewLayers = [...viewLayers];
        currentViewLayers[activeViewIndex] = layers;

        const cartItem = {
            ...template,
            image: previewImage, // This will be the Edited PNG
            customization: {
                layers: layers,
                viewLayers: currentViewLayers, // Save all views
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
                        console.log(`Font loaded: ${font} `);
                    });
                }
            });
        }
    }, [template]);

    if (loading || !template) {
        return (
            <div className={`editor-page theme-${editorTheme}`}>
                <div className="editor-header" style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Skeleton width="80px" height="36px" borderRadius="20px" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Skeleton width="150px" height="20px" />
                            <Skeleton width="100px" height="14px" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Skeleton width="90px" height="36px" borderRadius="8px" />
                        <Skeleton width="90px" height="36px" borderRadius="8px" />
                        <Skeleton width="140px" height="36px" borderRadius="20px" />
                    </div>
                </div>

                <div className="editor-layout" style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
                    {/* Left Sidebar Skeleton */}
                    <div className="editor-sidebar-left" style={{ width: '320px', padding: '1.5rem', borderRight: '1px solid #eee', background: '#fff' }}>
                        <Skeleton width="50%" height="24px" style={{ marginBottom: '24px' }} />

                        <div style={{ marginBottom: '32px' }}>
                            <Skeleton width="40%" height="16px" style={{ marginBottom: '12px' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Skeleton height="80px" borderRadius="12px" />
                                <Skeleton height="80px" borderRadius="12px" />
                                <Skeleton height="80px" borderRadius="12px" />
                                <Skeleton height="80px" borderRadius="12px" />
                            </div>
                        </div>

                        <div>
                            <Skeleton width="40%" height="16px" style={{ marginBottom: '12px' }} />
                            <Skeleton height="120px" borderRadius="12px" />
                        </div>
                    </div>

                    {/* Canvas Skeleton */}
                    <div className="editor-canvas-container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '40px' }}>
                        <Skeleton width="450px" height="640px" borderRadius="4px" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
                    </div>
                </div>
            </div>
        );
    }

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    return (
        <div className={`editor - page theme - ${editorTheme} ${isPreviewMode ? 'preview-active' : ''} `}>
            {/* 1️⃣ Editor Header (Top Navigation) */}
            {!isPreviewMode && (
                <div className="editor-header">
                    <div className="header-left">
                        <button onClick={() => navigate('/gallery')} className="btn-back-pill" title="Back to Gallery">
                            <BiArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        <div className="header-title">
                            <h2>{template.name}</h2>
                        </div>

                        <div className="theme-selector" style={{ marginLeft: '16px' }}>
                            <select
                                value={editorTheme}
                                onChange={(e) => setEditorTheme(e.target.value)}
                                className="sidebar-select"
                                style={{ width: 'auto', padding: '4px 12px' }}
                            >
                                <option value="light">☀️ Light</option>
                                <option value="dark">🌑 Dark</option>
                            </select>
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="autosave-badge">
                            <div className="dot-green"></div>
                            <span>Auto-saved</span>
                        </div>
                        <div className="vertical-divider sm"></div>
                        <button onClick={() => setIsPreviewMode(true)} className="btn-text" title="Preview Mode">
                            <BiEye size={18} />
                            <span>Preview</span>
                        </button>
                        <button onClick={handleSave} className="btn-text">
                            <BiSave size={18} />
                            <span>Save</span>
                        </button>
                        <button onClick={handleExportPNG} className="btn-text">
                            <BiDownload size={16} /> PNG
                        </button>
                        <button onClick={handleExportPDF} className="btn-text">
                            <BiDownload size={16} /> PDF
                        </button>
                        <button onClick={handleAddToCart} className="checkout-pill">
                            <BiBagCheck size={20} />
                            <span>Checkout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Exit Preview Button */}
            {isPreviewMode && (
                <button className="exit-preview-btn" onClick={() => setIsPreviewMode(false)}>
                    <BiXCircle size={20} />
                    <span>Exit Preview</span>
                </button>
            )}

            {/* Main Workspace */}
            <div className="editor-layout">
                {!isPreviewMode && (
                    <div className="editor-sidebar-left">
                        {/* 3️⃣ Add Element Icons */}
                        <button onClick={() => handleAddLayer()} className="tool-btn-icon" title="Add Text">
                            <BiType size={24} />
                        </button>
                        <button className="tool-btn-icon" title="Add Sticker">
                            <BiStars size={24} />
                        </button>
                        <button className="tool-btn-icon" title="Add Image">
                            <BiImage size={24} />
                        </button>
                        <button className="tool-btn-icon" title="Add Shape">
                            <BiSquare size={20} />
                        </button>
                        <div style={{ flex: 1 }}></div>
                        <button className="tool-btn-icon" title="Settings">
                            <BiSliders size={20} />
                        </button>
                    </div>
                )}

                {/* 7️⃣ Canvas Area */}
                <div className="editor-canvas-container">
                    <div className="canvas-scroll-view">
                        <div className="canvas-content-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                            <div className="canvas-paper-effect">
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
                                    isPreview={isPreviewMode}
                                    zoom={zoom}
                                    showMargins={showMargins}
                                    showWatermark={showWatermark}
                                    onContextMenu={handleContextMenu}
                                />
                            </div>

                            {/* 4️⃣ View Switcher (Moved below Canvas) */}
                            {template && ((template.views && template.views.length > 1) || (template.images && template.images.length > 1)) && !isPreviewMode && (
                                <div className="premium-view-carousel" style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                    <button
                                        className="view-nav-btn"
                                        onClick={() => {
                                            const total = (template.views || template.images).length;
                                            const newIndex = (activeViewIndex - 1 + total) % total;
                                            handleSwitchView(newIndex);
                                        }}
                                        disabled={(template.views || template.images).length <= 1}
                                    >
                                        <BiArrowLeft size={16} />
                                    </button>
                                    <div className="view-info-display" style={{ minWidth: '80px' }}>
                                        <span className="view-num-bold">{activeViewIndex + 1}</span>
                                        <span className="view-label-mute" style={{ display: 'block', marginTop: '2px' }}>of {(template.views || template.images).filter(v => v).length} views</span>
                                    </div>
                                    <button
                                        className="view-nav-btn"
                                        onClick={() => {
                                            const total = (template.views || template.images).length;
                                            const newIndex = (activeViewIndex + 1) % total;
                                            handleSwitchView(newIndex);
                                        }}
                                        disabled={(template.views || template.images).length <= 1}
                                    >
                                        <BiArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 8️⃣ Zoom Controls */}
                    {!isPreviewMode && (
                        <div className="zoom-controls-glass">
                            <button className="zoom-btn-cir" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} title="Zoom Out">
                                <BiZoomOut size={18} />
                            </button>
                            <span className="zoom-pct-bold">{Math.round(zoom * 100)}%</span>
                            <button className="zoom-btn-cir" onClick={() => setZoom(Math.min(3, zoom + 0.1))} title="Zoom In">
                                <BiZoomIn size={18} />
                            </button>
                            <div className="vertical-divider sm"></div>
                            <button className="zoom-btn-cir" onClick={() => setZoom(1)} style={{ fontSize: '10px', fontWeight: '700' }}>
                                RESET
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

                {/* Right Sidebar - Properties & Global Settings */}
                {!isPreviewMode && (
                    <div className="editor-sidebar-right">
                        <div className="sidebar-header">
                            <h3>{selectedLayer ? "Layer Properties" : "Page Settings"}</h3>
                        </div>

                        <div className="sidebar-content">
                            {/* Removed View Switcher from here */}

                            {/* 5️⃣ Layer Properties Panel */}
                            {selectedLayer ? (
                                <div className="data-section">
                                    <div className="properties-group-block">
                                        <div className="segmented-lang">
                                            <button className={`lang-btn ${inputLanguage === 'en' ? 'active' : ''}`} onClick={() => setInputLanguage('en')}>English</button>
                                            <button className={`lang-btn ${inputLanguage === 'hi' ? 'active' : ''}`} onClick={() => setInputLanguage('hi')}>Hindi</button>
                                            <button className={`lang-btn ${inputLanguage === 'ur' ? 'active' : ''}`} onClick={() => setInputLanguage('ur')}>Urdu</button>
                                        </div>
                                        {inputLanguage !== 'en' ? (
                                            <div className="transliterate-container">
                                                <ReactTransliterate
                                                    renderComponent={(props) => (
                                                        <textarea
                                                            {...props}
                                                            className="sidebar-textarea"
                                                            dir={inputLanguage === 'ur' ? 'rtl' : 'ltr'}
                                                            style={{ textAlign: inputLanguage === 'ur' ? 'right' : 'inherit' }}
                                                        />
                                                    )}
                                                    value={selectedLayer.text}
                                                    onChangeText={(text) => handleUpdateLayer(selectedLayer.id, { text })}
                                                    lang={inputLanguage}
                                                    placeholder="Type phonetically..."
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                className="sidebar-textarea"
                                                value={selectedLayer.text}
                                                onChange={(e) => handleUpdateLayer(selectedLayer.id, { text: e.target.value })}
                                                placeholder="Edit text content..."
                                            />
                                        )}
                                    </div>

                                    <div className="properties-group-block">
                                        <div className="prop-control-row">
                                            <div className="prop-field">
                                                <label className="prop-field-label">Font Family</label>
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
                                            <div className="prop-field" style={{ minWidth: '110px' }}>
                                                <label className="prop-field-label">Size</label>
                                                <div className="font-size-stepper">
                                                    <button className="step-btn-circle" onClick={() => handleUpdateLayer(selectedLayer.id, { fontSize: Math.max(8, (selectedLayer.fontSize || 12) - 1) })}>−</button>
                                                    <span className="step-val-bold">{selectedLayer.fontSize}</span>
                                                    <button className="step-btn-circle" onClick={() => handleUpdateLayer(selectedLayer.id, { fontSize: (selectedLayer.fontSize || 12) + 1 })}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="properties-group-block">
                                        <div className="prop-control-row">
                                            <div className="prop-field">
                                                <label className="prop-field-label">Color</label>
                                                <div className="sidebar-color-picker">
                                                    <input
                                                        type="color"
                                                        value={selectedLayer.color}
                                                        onChange={(e) => handleUpdateLayer(selectedLayer.id, { color: e.target.value })}
                                                    />
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedLayer.color}</span>
                                                </div>
                                            </div>
                                            <div className="prop-field">
                                                <label className="prop-field-label">Align</label>
                                                <div className="segmented-lang" style={{ background: 'var(--bg-soft)', padding: '2px' }}>
                                                    <button className={`lang-btn ${selectedLayer.textAlign === 'left' ? 'active' : ''}`} style={{ fontSize: '10px' }} onClick={() => handleUpdateLayer(selectedLayer.id, { textAlign: 'left' })}>L</button>
                                                    <button className={`lang-btn ${selectedLayer.textAlign === 'center' ? 'active' : ''}`} style={{ fontSize: '10px' }} onClick={() => handleUpdateLayer(selectedLayer.id, { textAlign: 'center' })}>C</button>
                                                    <button className={`lang-btn ${selectedLayer.textAlign === 'right' ? 'active' : ''}`} style={{ fontSize: '10px' }} onClick={() => handleUpdateLayer(selectedLayer.id, { textAlign: 'right' })}>R</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="prop-field" style={{ marginTop: '8px' }}>
                                            <label className="prop-field-label">Style</label>
                                            <div className="segmented-lang" style={{ background: 'var(--bg-soft)', padding: '2px' }}>
                                                <button className={`lang-btn ${selectedLayer.fontWeight === 'bold' ? 'active' : ''}`} style={{ fontSize: '10px' }} onClick={() => handleUpdateLayer(selectedLayer.id, { fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold' })}>Bold</button>
                                                <button className={`lang-btn ${selectedLayer.fontStyle === 'italic' ? 'active' : ''}`} style={{ fontSize: '10px' }} onClick={() => handleUpdateLayer(selectedLayer.id, { fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic' })}>Italic</button>
                                                <button className={`lang-btn ${selectedLayer.textTransform === 'uppercase' ? 'active' : ''}`} style={{ fontSize: '10px' }} onClick={() => handleUpdateLayer(selectedLayer.id, { textTransform: selectedLayer.textTransform === 'uppercase' ? 'none' : 'uppercase' })}>Caps</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="properties-group-block">
                                        <label className="prop-field-label">Layer Actions</label>
                                        <div className="layer-action-grid">
                                            <button className="action-pill-btn" onClick={() => bringForward(selectedLayer.id)}>
                                                <BiArrowUpShort size={20} />
                                                <span>Forward</span>
                                            </button>
                                            <button className="action-pill-btn" onClick={() => sendBackward(selectedLayer.id)}>
                                                <BiArrowDownShort size={20} />
                                                <span>Backward</span>
                                            </button>
                                            <button className="action-pill-btn" onClick={() => duplicateLayer(selectedLayer.id)}>
                                                <BiFiles size={16} />
                                                <span>Duplicate</span>
                                            </button>
                                            <button className="action-pill-btn danger" onClick={() => handleDeleteLayer(selectedLayer.id)}>
                                                <BiTrash2 size={16} />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="data-section">
                                    <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-soft)', borderRadius: '12px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Quick Tips</h4>
                                        <ul style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '16px', lineHeight: '1.6' }}>
                                            <li>Double-click text to edit on canvas.</li>
                                            <li>Drag corners to resize (coming soon).</li>
                                            <li>Use arrow keys to nudge elements.</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorPage;

