import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading, openAuthModal } = useAuth();

    if (loading) return <div className="loading-spinner">Loading...</div>;

    if (!user) {
        // If trying to access a protected route directly, redirect to home
        // Ideally, we'd open the modal too, but that requires a side effect
        // or a query param.
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export const AdminRoute = ({ children }) => {
    const { user, profile, loading } = useAuth();

    if (loading) return <div className="loading-spinner">Loading...</div>;

    // Must be logged in AND have admin role
    if (!user || profile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};
