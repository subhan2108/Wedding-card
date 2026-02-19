import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

const LayerItem = React.memo(({
    layer,
    isSelected,
    editingLayerId,
    isDragging,
    dragMode,
    isPreview,
    fieldValues,
    onMouseDown,
    handleDoubleClick,
    handleContextMenu,
    handleTextBlur,
    handleTextKeyDown,
    editableRef,
    replacePlaceholders
}) => {
    const layerType = layer.type || 'text';
    const isLocked = layer.isLocked;
    const getWrappedText = (text, fontSize) => {
        if (!text) return '';
        const limit = 800; // Assumed safe width
        const approxCharWidth = (fontSize || 16) * 0.6;
        const maxChars = Math.floor(limit / approxCharWidth);

        return text.split('\n').map(line => {
            if (line.length <= maxChars) return line;
            const words = line.split(' ');
            let wrapped = '';
            let currentLine = words[0] || '';
            for (let i = 1; i < words.length; i++) {
                if ((currentLine + ' ' + words[i]).length < maxChars) {
                    currentLine += ' ' + words[i];
                } else {
                    wrapped += currentLine + '\n';
                    currentLine = words[i];
                }
            }
            wrapped += currentLine;
            return wrapped;
        }).join('\n');
    };

    const displayText = layerType === 'text' ? getWrappedText(replacePlaceholders(layer.text), layer.fontSize) : '';

    // --- Real Measurement (Phase 8 Logic) ---
    const textRef = useRef(null);
    const [bbox, setBbox] = useState({ x: 0, y: 0, width: 0, height: 0 });

    useLayoutEffect(() => {
        if (layerType === 'text' && textRef.current) {
            // Measure actual rendered pixels
            const measured = textRef.current.getBBox();
            setBbox({
                x: measured.x,
                y: measured.y,
                width: measured.width,
                height: measured.height
            });
        }
    }, [
        displayText,
        layer.fontSize,
        layer.fontFamily,
        layer.fontWeight,
        layer.fontStyle,
        layer.letterSpacing,
        layer.textAlign,
        layer.textTransform,
        layerType
    ]);

    let width = 0;
    let height = 0;
    let xOffset = 0;
    let yOffset = 0;

    const paddingX = 12; // 6px each side
    const paddingY = 8;  // 4px each side

    if (layerType === 'text' && bbox.width > 0) {
        // Use real measured dimensions even when editing
        width = bbox.width + paddingX;
        height = bbox.height + paddingY;
        xOffset = bbox.x - paddingX / 2;
        yOffset = bbox.y - paddingY / 2;
    } else if (layerType === 'text') {
        // Conservative heuristic fallback for initial render or while editing
        const fontSize = layer.fontSize || 16;
        const charWidth = fontSize * 0.55;
        width = (displayText || '').length * charWidth + (fontSize * 0.4);
        height = fontSize * 1.2;

        const align = layer.textAlign || 'left';
        if (align === 'center') xOffset = -width / 2;
        else if (align === 'right') xOffset = -width;
        else xOffset = 0;

        yOffset = -fontSize * 0.95;
    } else if (layerType === 'image' || layerType === 'shape') {
        width = layer.width || 100;
        height = layer.height || 100;
        xOffset = -width / 2;
        yOffset = -height / 2;
    }

    return (
        <g
            transform={`translate(${layer.x}, ${layer.y}) rotate(${layer.rotation || 0})`}
            onMouseDown={(e) => onMouseDown(e, layer, 'move')}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => handleContextMenu(e, layer.id)}
            style={{
                cursor: isLocked ? 'default' : (isDragging && dragMode === 'move' ? 'grabbing' : 'move'),
                opacity: isLocked ? 0.8 : 1
            }}
        >
            <rect
                x={xOffset}
                y={yOffset}
                width={width}
                height={height}
                fill="transparent"
                onDoubleClick={(e) => layerType === 'text' && !isLocked && handleDoubleClick(e, layer)}
            />

            {layerType === 'text' && (
                editingLayerId === layer.id ? (
                    <foreignObject
                        x={xOffset}
                        y={yOffset}
                        width={Math.min(Math.max(width, 200), 760)} // Constrain to safe width (800-40)
                        height={Math.max(height + 200, 300)}
                        style={{ overflow: 'visible' }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div
                            ref={editableRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextBlur(e, layer.id)}
                            onKeyDown={(e) => handleTextKeyDown(e, layer.id)}
                            style={{
                                color: layer.color,
                                fontSize: `${layer.fontSize}px`,
                                fontFamily: layer.fontFamily,
                                fontWeight: layer.fontWeight || 'normal',
                                fontStyle: layer.fontStyle || 'normal',
                                letterSpacing: layer.letterSpacing || 'normal',
                                textAlign: layer.textAlign || 'left',
                                textTransform: layer.textTransform || 'none',
                                outline: 'none',
                                border: '1.5px dashed #4da3ff', // Match selection border
                                padding: '4px 6px', // Align text with visual padding
                                boxSizing: 'border-box',
                                background: 'transparent',
                                minWidth: '50px',
                                maxWidth: '800px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                display: 'inline-block'
                            }}
                        >
                            {layer.text}
                        </div>
                    </foreignObject>
                ) : (
                    <text
                        ref={textRef}
                        fill={layer.color}
                        fontSize={layer.fontSize}
                        fontFamily={layer.fontFamily}
                        fontWeight={layer.fontWeight || 'normal'}
                        fontStyle={layer.fontStyle || 'normal'}
                        letterSpacing={layer.letterSpacing || 'normal'}
                        textAnchor={layer.textAlign === 'center' ? 'middle' : (layer.textAlign === 'right' ? 'end' : 'start')}
                        dominantBaseline="alphabetic"
                        style={{
                            userSelect: 'none',
                            pointerEvents: isLocked ? 'none' : 'all',
                            textTransform: layer.textTransform || 'none'
                        }}
                        onDoubleClick={(e) => !isLocked && handleDoubleClick(e, layer)}
                    >
                        {displayText.split('\n').map((line, index) => (
                            <tspan
                                key={index}
                                x={0}
                                dy={index === 0 ? "0" : "1.2em"}
                            >
                                {line}
                            </tspan>
                        ))}
                    </text>
                )
            )}

            {layerType === 'image' && layer.src && (
                <image
                    href={layer.src} x={xOffset} y={yOffset} width={width} height={height}
                    preserveAspectRatio="none" style={{ pointerEvents: 'none', userSelect: 'none' }}
                />
            )}

            {layerType === 'shape' && (
                layer.shapeType === 'circle' ? (
                    <ellipse cx={0} cy={0} rx={width / 2} ry={height / 2} fill={layer.color} stroke={layer.borderColor || 'none'} strokeWidth={layer.borderWidth || 0} />
                ) : (
                    <rect x={xOffset} y={yOffset} width={width} height={height} fill={layer.color} stroke={layer.borderColor || 'none'} strokeWidth={layer.borderWidth || 0} />
                )
            )}


            {isSelected && !isPreview && editingLayerId !== layer.id && (
                <g className="selection-controls">
                    {/* Dashed Light Blue Selection Border */}
                    <rect
                        x={xOffset - 2} y={yOffset - 2}
                        width={width + 4} height={height + 4}
                        fill="none" stroke="#4da3ff" strokeWidth="1.5"
                        strokeDasharray="4,2"
                        rx="2"
                    />

                    {/* Corner Resize Handles (White with Blue border) */}
                    <circle cx={xOffset - 2} cy={yOffset - 2} r="4" fill="white" stroke="#4da3ff" strokeWidth="1.5" style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => onMouseDown(e, layer, 'nw')} />
                    <circle cx={xOffset + width + 2} cy={yOffset - 2} r="4" fill="white" stroke="#4da3ff" strokeWidth="1.5" style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => onMouseDown(e, layer, 'ne')} />
                    <circle cx={xOffset - 2} cy={yOffset + height + 2} r="4" fill="white" stroke="#4da3ff" strokeWidth="1.5" style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => onMouseDown(e, layer, 'sw')} />
                    <circle cx={xOffset + width + 2} cy={yOffset + height + 2} r="4" fill="white" stroke="#4da3ff" strokeWidth="1.5" style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => onMouseDown(e, layer, 'se')} />

                    {/* White Professional Rotation Handle at Bottom */}
                    <g
                        className="rotation-handle-group"
                        transform={`translate(${xOffset + width / 2}, ${yOffset + height + 22})`}
                        onMouseDown={(e) => onMouseDown(e, layer, 'rotate')}
                        style={{ cursor: 'pointer' }}
                    >
                        <circle r="12" fill="white" stroke="#ccc" strokeWidth="0.5" className="rotation-handle-circle" />
                        <path
                            d="M-5 -1 A 5 5 0 1 1 5 -1 M 2 -4 L 5 -1 L 2 2"
                            fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round"
                            className="rotation-handle-icon"
                        />
                    </g>
                </g>
            )}
        </g>
    );
});

const Canvas = ({
    width,
    height,
    backgroundUrl,
    layers,
    selectedLayerId,
    onSelectLayer,
    onUpdateLayer,
    fieldValues = {},
    showMargins = false,
    showWatermark = false,
    isPreview = false,
    zoom = 1,
    onContextMenu = (e, layerId) => { },
    onCommitHistory = () => { }
}) => {
    const canvasRef = useRef(null);
    const editableRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState('move');
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialLayerState, setInitialLayerState] = useState(null);
    const [editingLayerId, setEditingLayerId] = useState(null);
    const [showCenterGuides, setShowCenterGuides] = useState(false);

    // Context Menu Handler
    const handleContextMenu = (e, layerId = null) => {
        e.preventDefault();
        onContextMenu(e, layerId);
    };

    // Helper to replace placeholders
    const replacePlaceholders = (text) => {
        if (!text) return '';
        return text.replace(/{{(.*?)}}/g, (match, key) => fieldValues[key.trim()] || match);
    };


    // Helper to get SVG coordinates
    const getSvgPoint = (clientX, clientY) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const svg = canvasRef.current;
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    };

    const handleMouseDown = (e, layer, mode = 'move') => {
        e.stopPropagation();
        if (isPreview) return; // Disable interaction in preview mode
        if (layer.isLocked) return; // Prevent interaction with locked layers

        onSelectLayer(layer.id);
        setIsDragging(true);
        setDragMode(mode);

        const svgPoint = getSvgPoint(e.clientX, e.clientY);
        setDragStart(svgPoint);
        setInitialLayerState({ ...layer });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !selectedLayerId || !initialLayerState) return;

        const svgPoint = getSvgPoint(e.clientX, e.clientY);
        const dx = svgPoint.x - dragStart.x;
        const dy = svgPoint.y - dragStart.y;

        if (dragMode === 'move') {
            // Apply canvas bounds
            let newX = initialLayerState.x + dx;
            let newY = initialLayerState.y + dy;

            // Smart snapping to center (within 10px threshold)
            const centerX = width / 2;
            const centerY = height / 2;
            const snapThreshold = 10;

            if (Math.abs(newX - centerX) < snapThreshold) {
                newX = centerX;
                setShowCenterGuides(true);
            } else if (Math.abs(newY - centerY) < snapThreshold) {
                newY = centerY;
                setShowCenterGuides(true);
            } else {
                setShowCenterGuides(false);
            }

            // Clamp to canvas bounds (with some padding)
            const clampedX = Math.max(20, Math.min(width - 20, newX));
            const clampedY = Math.max(20, Math.min(height - 20, newY));

            onUpdateLayer(selectedLayerId, {
                x: clampedX,
                y: clampedY
            }, true);
        } else if (['nw', 'ne', 'sw', 'se'].includes(dragMode)) {
            // Resize from corners with correct sign logic per quadrant
            let sign = 0;
            if (dragMode === 'se') sign = (dx + dy) / 2;
            else if (dragMode === 'nw') sign = -(dx + dy) / 2;
            else if (dragMode === 'ne') sign = (dx - dy) / 2;
            else if (dragMode === 'sw') sign = (-dx + dy) / 2;

            const scaleFactor = 1 + sign / 100;
            const newSize = Math.max(8, Math.min(200, initialLayerState.fontSize * scaleFactor));
            onUpdateLayer(selectedLayerId, {
                fontSize: newSize
            }, true);
        } else if (dragMode === 'rotate') {
            // Rotation logic
            const centerX = initialLayerState.x;
            const centerY = initialLayerState.y;
            const angle = Math.atan2(svgPoint.y - centerY, svgPoint.x - centerX) * (180 / Math.PI);
            onUpdateLayer(selectedLayerId, {
                rotation: Math.round(angle)
            }, true);
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            onCommitHistory();
        }
        setIsDragging(false);
        setDragMode(null);
        setInitialLayerState(null);
        setShowCenterGuides(false);
    };

    const handleDoubleClick = (e, layer) => {
        e.stopPropagation();
        setEditingLayerId(layer.id);
        setIsDragging(false);
    };

    const handleTextBlur = (e, layerId) => {
        const newText = e.target.innerText;
        if (newText !== '') {
            onUpdateLayer(layerId, { text: newText });
        }
        setEditingLayerId(null);
    };

    const handleTextKeyDown = (e, layerId) => {
        if (e.key === 'Escape') {
            setEditingLayerId(null);
            e.target.blur();
        }
    };

    // Auto-focus when entering edit mode
    useEffect(() => {
        if (editingLayerId && editableRef.current) {
            editableRef.current.focus();
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(editableRef.current);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, [editingLayerId]);


    return (
        <div
            className="editor-canvas-wrapper"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ padding: '40px' }} // Visual padding around paper
        >
            <svg
                ref={canvasRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className={`editor-svg ${isPreview ? 'is-preview' : ''}`}
                onClick={() => onSelectLayer(null)}
                onContextMenu={(e) => handleContextMenu(e)}
                style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.2s ease-out',
                    cursor: editingLayerId ? 'text' : 'default',
                    imageRendering: 'optimizeQuality',
                    shapeRendering: 'geometricPrecision',
                    height: "25rem"
                }}
            >
                {/* Background - Locked & Non-selectable */}
                {backgroundUrl && (
                    <image
                        href={backgroundUrl}
                        x="0"
                        y="0"
                        width={width}
                        height={height}
                        preserveAspectRatio="xMidYMid slice"
                        style={{
                            imageRendering: 'high-quality',
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}
                    />
                )}

                {/* Center Guidelines (shown during snapping) */}
                {showCenterGuides && (
                    <>
                        <line
                            x1={width / 2}
                            y1="0"
                            x2={width / 2}
                            y2={height}
                            stroke="#4da3ff"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                            opacity="0.8"
                        />
                        <line
                            x1="0"
                            y1={height / 2}
                            x2={width}
                            y2={height / 2}
                            stroke="#4da3ff"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                            opacity="0.8"
                        />
                    </>
                )}

                {/* Layers */}
                {[...layers]
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map(layer => (
                        <LayerItem
                            key={layer.id}
                            layer={layer}
                            isSelected={selectedLayerId === layer.id}
                            editingLayerId={editingLayerId}
                            isDragging={isDragging}
                            dragMode={dragMode}
                            isPreview={isPreview}
                            fieldValues={fieldValues}
                            onMouseDown={handleMouseDown}
                            handleDoubleClick={handleDoubleClick}
                            handleContextMenu={handleContextMenu}
                            handleTextBlur={handleTextBlur}
                            handleTextKeyDown={handleTextKeyDown}
                            editableRef={editableRef}
                            replacePlaceholders={replacePlaceholders}
                        />
                    ))}
            </svg>

            {/* Overlay Guides */}
            {showMargins && !isPreview && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    border: '1px dashed rgba(126, 91, 239, 0.4)',
                    pointerEvents: 'none',
                    borderRadius: '2px'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '0',
                        fontSize: '10px',
                        color: '#7e5bef'
                    }}>Safe Margin (Print)</div>
                </div>
            )}

            {showWatermark && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    transform: 'rotate(-30deg)',
                    zIndex: 100
                }}>
                    <span style={{
                        fontSize: '40px',
                        fontWeight: 'bold',
                        color: 'rgba(0,0,0,0.1)',
                        textTransform: 'uppercase',
                        letterSpacing: '10px',
                        whiteSpace: 'nowrap'
                    }}>PREVIEW • PREVIEW • PREVIEW</span>
                </div>
            )}
        </div >
    );
};

export default Canvas;
