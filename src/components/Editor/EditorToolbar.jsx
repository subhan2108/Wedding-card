import React from 'react';
import { Type, Image, Square, Move, ChevronDown, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Trash2, Smile, CalendarDays } from 'lucide-react';

const EditorToolbar = ({
    selectedLayer,
    onUpdateLayer,
    onAddLayer,
    onDeleteLayer,
    onBringToFront,
    onSendToBack,
    onBringForward,
    onSendBackward,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    onAlignTop,
    onAlignMiddle,
    onAlignBottom,
    fonts = ["Great Vibes, cursive", "Cormorant Garamond, serif", "Montserrat, sans-serif", "Playfair Display", "Roboto"]
}) => {

    const handleChange = (field, value) => {
        if (selectedLayer) {
            onUpdateLayer(selectedLayer.id, { [field]: value });
        }
    };

    return (
        <div className="editor-toolbar">
            {/* Left/Center: Primary Tools */}
            <div className="toolbar-section tools-group">
                <button onClick={onAddLayer} className="tool-btn" title="Add Text">
                    <Type size={22} />
                    <span>Text</span>
                </button>
                <button className="tool-btn disabled" title="Add Sticker">
                    <Smile size={22} />
                    <span>Sticker</span>
                </button>
                <button className="tool-btn disabled" title="Add Image">
                    <Image size={22} />
                    <span>Image</span>
                </button>
                <button className="tool-btn disabled" title="Create RSVP">
                    <CalendarDays size={22} />
                    <span>Create RSVP</span>
                </button>
            </div>

            <div className="vertical-divider"></div>

            {/* Center/Right: Properties (Only visible if something selected) */}
            {selectedLayer ? (
                <div className="toolbar-section properties-group">
                    {/* Text Content */}
                    <div className="property-item">
                        <input
                            type="text"
                            value={selectedLayer.text}
                            onChange={(e) => handleChange('text', e.target.value)}
                            className="toolbar-input text-content-input"
                            placeholder="Type here..."
                            style={{ width: '200px', textAlign: 'left' }}
                        />
                    </div>

                    <div className="vertical-divider sm"></div>

                    {/* Font Family */}
                    <div className="property-item">
                        <select
                            value={selectedLayer.fontFamily}

                            onChange={(e) => handleChange('fontFamily', e.target.value)}
                            className="toolbar-select font-select"
                        >
                            {fonts.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font }}>
                                    {font.split(',')[0]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Font Size */}
                    <div className="property-item">
                        <input
                            type="number"
                            value={selectedLayer.fontSize}
                            onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 12)}
                            className="toolbar-input"
                            style={{ width: '60px' }}
                        />
                        <span className="unit">px</span>
                    </div>

                    {/* Letter Spacing */}
                    <div className="property-item">
                        <label style={{ fontSize: '11px', color: '#666', marginRight: '4px' }}>Spacing</label>
                        <input
                            type="number"
                            value={parseInt(selectedLayer.letterSpacing) || 0}
                            onChange={(e) => handleChange('letterSpacing', `${e.target.value}px`)}
                            className="toolbar-input"
                            style={{ width: '50px' }}
                            step="1"
                        />
                        <span className="unit">px</span>
                    </div>

                    <div className="vertical-divider sm"></div>

                    {/* Color */}
                    <div className="property-item">
                        <div className="color-wrapper">
                            <input
                                type="color"
                                value={selectedLayer.color}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="color-picker-input"
                                title="Text Color"
                            />
                        </div>
                    </div>

                    <div className="vertical-divider sm"></div>

                    {/* Styles */}
                    <div className="property-btn-group">
                        <button
                            className={`prop-btn ${selectedLayer.fontWeight === 'bold' ? 'active' : ''}`}
                            onClick={() => handleChange('fontWeight', selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold')}
                            title="Bold"
                        >
                            <Bold size={18} />
                        </button>
                        <button
                            className={`prop-btn ${selectedLayer.fontStyle === 'italic' ? 'active' : ''}`}
                            onClick={() => handleChange('fontStyle', selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic')}
                            title="Italic"
                        >
                            <Italic size={18} />
                        </button>
                        <button
                            className={`prop-btn ${selectedLayer.textTransform === 'uppercase' ? 'active' : ''}`}
                            onClick={() => handleChange('textTransform', selectedLayer.textTransform === 'uppercase' ? 'none' : 'uppercase')}
                            title="Uppercase"
                            style={{ fontWeight: 'bold', fontSize: '14px' }}
                        >
                            AA
                        </button>
                    </div>

                    <div className="vertical-divider sm"></div>

                    {/* Alignment */}
                    <div className="property-btn-group">
                        <button
                            className={`prop-btn ${selectedLayer.textAlign === 'left' ? 'active' : ''}`}
                            onClick={() => handleChange('textAlign', 'left')}
                        >
                            <AlignLeft size={18} />
                        </button>
                        <button
                            className={`prop-btn ${selectedLayer.textAlign === 'center' ? 'active' : ''}`}
                            onClick={() => handleChange('textAlign', 'center')}
                        >
                            <AlignCenter size={18} />
                        </button>
                        <button
                            className={`prop-btn ${selectedLayer.textAlign === 'right' ? 'active' : ''}`}
                            onClick={() => handleChange('textAlign', 'right')}
                        >
                            <AlignRight size={18} />
                        </button>
                    </div>

                    <div className="vertical-divider"></div>

                    {/* Layer Ordering */}
                    <div className="property-btn-group">
                        <button
                            onClick={() => onBringToFront(selectedLayer.id)}
                            className="prop-btn"
                            title="Bring to Front"
                        >
                            ↑↑
                        </button>
                        <button
                            onClick={() => onBringForward(selectedLayer.id)}
                            className="prop-btn"
                            title="Bring Forward"
                        >
                            ↑
                        </button>
                        <button
                            onClick={() => onSendBackward(selectedLayer.id)}
                            className="prop-btn"
                            title="Send Backward"
                        >
                            ↓
                        </button>
                        <button
                            onClick={() => onSendToBack(selectedLayer.id)}
                            className="prop-btn"
                            title="Send to Back"
                        >
                            ↓↓
                        </button>
                    </div>

                    <div className="vertical-divider"></div>

                    {/* Alignment Tools */}
                    <div className="property-btn-group">
                        <button
                            onClick={() => onAlignLeft(selectedLayer.id)}
                            className="prop-btn"
                            title="Align Left"
                        >
                            ⊣
                        </button>
                        <button
                            onClick={() => onAlignCenter(selectedLayer.id)}
                            className="prop-btn"
                            title="Align Center"
                        >
                            ⊢⊣
                        </button>
                        <button
                            onClick={() => onAlignRight(selectedLayer.id)}
                            className="prop-btn"
                            title="Align Right"
                        >
                            ⊢
                        </button>
                        <span style={{ margin: '0 4px', color: '#ccc' }}>|</span>
                        <button
                            onClick={() => onAlignTop(selectedLayer.id)}
                            className="prop-btn"
                            title="Align Top"
                        >
                            ⊤
                        </button>
                        <button
                            onClick={() => onAlignMiddle(selectedLayer.id)}
                            className="prop-btn"
                            title="Align Middle"
                        >
                            ⊥⊤
                        </button>
                        <button
                            onClick={() => onAlignBottom(selectedLayer.id)}
                            className="prop-btn"
                            title="Align Bottom"
                        >
                            ⊥
                        </button>
                    </div>

                    <div className="vertical-divider"></div>

                    {/* Actions */}
                    <button
                        onClick={() => {
                            const newLayer = {
                                ...selectedLayer,
                                id: `text-${Date.now()}`,
                                x: selectedLayer.x + 20,
                                y: selectedLayer.y + 20,
                                zIndex: (selectedLayer.zIndex || 0) + 1
                            };
                            onAddLayer(newLayer);
                        }}
                        className="tool-btn"
                        title="Duplicate Layer"
                    >
                        <Type size={18} />
                        <span style={{ fontSize: '10px' }}>Duplicate</span>
                    </button>
                    <button onClick={() => onDeleteLayer(selectedLayer.id)} className="tool-btn danger" title="Delete Layer">

                        <Trash2 size={18} />
                    </button>

                </div>
            ) : (
                <div className="toolbar-placeholder">
                    <span>Select an element to edit properties</span>
                </div>
            )
            }
        </div >
    );
};

export default EditorToolbar;
