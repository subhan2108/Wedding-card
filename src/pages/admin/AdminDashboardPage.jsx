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
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import './AdminDashboardPage.css';


const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        byCategory: {}
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const allTemplates = await adminService.getTemplates();
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
        } catch (error) {
            console.error("Failed to load templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!window.confirm("This will upload all your local templates to the cloud. Continue?")) return;

        setSyncing(true);
        const result = await adminService.migrateLocalToCloud();
        setSyncing(false);

        if (result.success) {
            alert(`Migration complete! Uploaded ${result.count} templates.`);
            loadTemplates(); // Reload from cloud
        } else {
            alert('Migration failed: ' + result.error);
        }
    };

    const handleLogout = async () => {
        await signOut();
        localStorage.removeItem('admin-authenticated');
        navigate('/admin/login');
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            const result = await adminService.deleteTemplate(id);
            if (result.success) {
                // Optimistic UI update
                setTemplates(prev => prev.filter(t => t.id !== id));
                alert('Template deleted successfully!');
                loadTemplates(); // Refresh to be safe
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
                    <div className="admin-header-actions">
                        <button
                            onClick={handleSync}
                            className="sync-btn"
                            disabled={syncing}
                            title="Upload local templates to cloud"
                        >
                            {syncing ? 'Syncing...' : '☁️ Sync to Cloud'}
                        </button>
                        <button onClick={handleLogout} className="logout-btn">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
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

                {/* Loading State */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading templates from cloud...</p>
                    </div>
                ) : (
                    /* Templates List */
                    templates.length === 0 ? (
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
                                        {template.preview_url || template.previewImage ? (
                                            <img
                                                src={template.preview_url || template.previewImage}
                                                alt={template.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="template-preview-placeholder"
                                            style={{ display: (template.preview_url || template.previewImage) ? 'none' : 'flex' }}>
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
                                        {template.created_at && (
                                            <div className="template-date">
                                                <Calendar size={12} />
                                                {new Date(template.created_at).toLocaleDateString()}
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
                    )
                )}
                {/* Orders Section */}
                <div className="action-bar" style={{ marginTop: '3rem' }}>
                    <h2>Recent Orders</h2>
                </div>

                {/* Orders List */}
                {/* Note: In a real app, this should be paginated and loaded separately */}
                <div className="orders-section">
                    <OrdersList />
                </div>

            </div>
        </div>
    );
};

function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    // const navigate = useNavigate(); // Removed unused

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const data = await adminService.getOrders();
        setOrders(data);
        setLoading(false);
    };

    if (loading) return <div className="loading-state"><p>Loading orders...</p></div>;
    if (orders.length === 0) return <div className="empty-state"><p>No orders yet.</p></div>;

    return (
        <div className="orders-list">
            <h3 style={{ marginBottom: '1rem' }}>Latest Orders</h3>
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Quantity</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="monospace">{order.id.slice(0, 8)}...</td>
                            <td>
                                <div className="fw-bold">{order.customer_name}</div>
                                <div className="text-muted small">{order.customer_email}</div>
                            </td>
                            <td>${order.total_amount}</td>
                            <td>{order.design_data?.quantity || 'N/A'}</td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td>
                                <span className={`status-badge status-${order.status || 'pending'}`}>
                                    {order.status || 'pending'}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="btn-sm btn-primary"
                                    onClick={() => window.open(`/editor/${order.template_id}?orderId=${order.id}`, '_blank')}
                                >
                                    View Design
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default AdminDashboardPage;
