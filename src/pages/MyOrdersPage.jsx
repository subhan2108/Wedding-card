import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Package, Clock, CheckCircle, CreditCard, Eye, LayoutGrid } from 'lucide-react';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const { user, openAuthModal } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchMyOrders = async () => {
            try {
                console.log("Fetching orders for user:", user.email);
                const userEmail = user.email;

                if (!userEmail) return;

                // Match by customer_email only (user_id column does not exist)
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .ilike('customer_email', userEmail)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Supabase error fetching orders:', error);
                    throw error;
                }

                console.log("Orders fetched:", data);
                setOrders(data || []);
            } catch (error) {
                console.error('Error fetching my orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [user]);

    const handleViewDesign = (order) => {
        // Navigate to editor with orderId
        // Opens in new tab
        window.open(`/editor/${order.template_id}?orderId=${order.id}`, '_blank');
    };

    if (!user) {
        return (
            <div className="orders-page-container">
                <div className="empty-state">
                    <Package size={64} className="text-muted" />
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your order history.</p>
                    <button onClick={openAuthModal} className="btn-primary">
                        Log In Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page-container">
            <div className="orders-header">
                <h1>My Orders</h1>
                <p>Track your wedding card orders and revisit your designs.</p>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <LayoutGrid size={64} className="text-muted" />
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet. Start designing!</p>
                    <button onClick={() => navigate('/gallery')} className="btn-primary">
                        Browse Designs
                    </button>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <span className="order-id">Order #{order.id.slice(0, 8)}</span>
                                <span className={`status-badge status-${order.status || 'pending'}`}>
                                    {order.status || 'pending'}
                                </span>
                            </div>

                            <div className="order-body">
                                <div className="order-info-row">
                                    <Clock size={16} />
                                    <span>Ordered on {new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="order-info-row">
                                    <CreditCard size={16} />
                                    <span>Total Amount: ${order.total_amount}</span>
                                </div>
                                <div className="order-info-row">
                                    <Package size={16} />
                                    <span>Quantity: {order.design_data && typeof order.design_data === 'object' ? (order.design_data.quantity || 'N/A') : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="order-footer">
                                <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => handleViewDesign(order)}
                                >
                                    <Eye size={16} />
                                    View Design
                                </button>
                                {/* Add 'Track Order' or other actions here */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
