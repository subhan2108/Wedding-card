import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    PlusCircle,
    LayoutGrid,
    TrendingUp,
    Edit2,
    Trash2,
    Eye,
    Tag,
    Calendar
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        byCategory: {}
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = () => {
        const allTemplates = adminService.getTemplates();
        setTemplates(allTemplates);

        // Calculate stats
        const byCategory = {};
        allTemplates.forEach(t => {
            const cat = t.category || 'Uncategorized';
            byCategory[cat] = (byCategory[cat] || 0) + 1;
        });

        setStats({
            total: allTemplates.length,
            byCategory
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('admin-authenticated');
        navigate('/admin/login');
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            const result = adminService.deleteTemplate(id);
            if (result.success) {
                alert('Template deleted successfully!');
                loadTemplates();
            } else {
                alert('Error deleting template: ' + result.error);
            }
        }
    };

    const handlePreview = (id) => {
        window.open(`/editor/${id}`, '_blank');
    };

    return (
        <div className="admin-dashboard-page">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-logo">
                        <h1>Wedding Admin</h1>
                        <p>Template Management Dashboard</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-container">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-card-primary">
                        <div className="stat-icon">
                            <LayoutGrid size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Templates</div>
                        </div>
                    </div>

                    {Object.entries(stats.byCategory).slice(0, 3).map(([category, count]) => (
                        <div key={category} className="stat-card">
                            <div className="stat-icon stat-icon-secondary">
                                <Tag size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{count}</div>
                                <div className="stat-label">{category}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Bar */}
                <div className="action-bar">
                    <h2>All Templates</h2>
                    <button
                        onClick={() => navigate('/admin/upload')}
                        className="btn-add-template"
                    >
                        <PlusCircle size={20} />
                        <span>Add New Template</span>
                    </button>
                </div>

                {/* Templates List */}
                {templates.length === 0 ? (
                    <div className="empty-state">
                        <LayoutGrid size={64} strokeWidth={1} />
                        <h3>No Templates Yet</h3>
                        <p>Start by adding your first wedding card template</p>
                        <button
                            onClick={() => navigate('/admin/upload')}
                            className="btn-primary"
                        >
                            <PlusCircle size={20} />
                            <span>Add First Template</span>
                        </button>
                    </div>
                ) : (
                    <div className="templates-grid">
                        {templates.map((template) => (
                            <div key={template.id} className="template-card">
                                <div className="template-preview">
                                    {template.previewImage ? (
                                        <img
                                            src={template.previewImage}
                                            alt={template.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="template-preview-placeholder" style={{ display: template.previewImage ? 'none' : 'flex' }}>
                                        <LayoutGrid size={40} strokeWidth={1.5} />
                                    </div>
                                    {template.category && (
                                        <div className="template-badge">{template.category}</div>
                                    )}
                                </div>

                                <div className="template-info">
                                    <h3>{template.name}</h3>
                                    <div className="template-meta">
                                        <span className="template-meta-item">
                                            <TrendingUp size={14} />
                                            {template.width} × {template.height}
                                        </span>
                                        <span className="template-meta-item">
                                            <Tag size={14} />
                                            {template.layers?.length || 0} layers
                                        </span>
                                    </div>
                                    {template.tags && template.tags.length > 0 && (
                                        <div className="template-tags">
                                            {template.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    {template.createdAt && (
                                        <div className="template-date">
                                            <Calendar size={12} />
                                            {new Date(template.createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                <div className="template-actions">
                                    <button
                                        onClick={() => handlePreview(template.id)}
                                        className="btn-icon"
                                        title="Preview"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/upload?edit=${template.id}`)}
                                        className="btn-icon"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id, template.name)}
                                        className="btn-icon btn-icon-danger"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
