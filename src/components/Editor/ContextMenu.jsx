import React from 'react';
import { Copy, Trash2, Lock, Unlock, ArrowUp, ArrowDown } from 'lucide-react';

const ContextMenu = ({ x, y, layer, onAction, onClose }) => {
    if (!x || !y) return null;

    const actions = [
        { id: 'duplicate', label: 'Duplicate', icon: <Copy size={16} />, show: !!layer },
        { id: 'delete', label: 'Delete', icon: <Trash2 size={16} />, show: !!layer, danger: true },
        { divider: true, show: !!layer },
        { id: 'lock', label: layer?.isLocked ? 'Unlock' : 'Lock', icon: layer?.isLocked ? <Unlock size={16} /> : <Lock size={16} />, show: !!layer },
        { divider: true, show: !!layer },
        { id: 'front', label: 'Bring to Front', icon: <ArrowUp size={16} />, show: !!layer },
        { id: 'back', label: 'Send to Back', icon: <ArrowDown size={16} />, show: !!layer },
    ];

    return (
        <div
            className="context-menu"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            {actions.filter(a => a.show).map((action, index) => (
                action.divider ? (
                    <div key={`div-${index}`} className="context-menu-divider" />
                ) : (
                    <button
                        key={action.id}
                        className={`context-menu-item ${action.danger ? 'danger' : ''}`}
                        onClick={() => {
                            onAction(action.id, layer?.id);
                            onClose();
                        }}
                    >
                        {action.icon}
                        <span>{action.label}</span>
                    </button>
                )
            ))}
        </div>
    );
};

export default ContextMenu;
