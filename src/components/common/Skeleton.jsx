import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius, style, className }) => {
    const customStyle = {
        width,
        height,
        borderRadius,
        ...style,
    };

    return (
        <div
            className={`skeleton ${className || ''}`}
            style={customStyle}
        ></div>
    );
};

export const SkeletonText = ({ lines = 1, width = '100%' }) => {
    return (
        <div className="skeleton-text-container">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="1em"
                    width={i === lines - 1 && lines > 1 ? '60%' : width}
                    style={{ marginBottom: '0.5em' }}
                />
            ))}
        </div>
    );
};

export const SkeletonCard = () => {
    return (
        <div className="common-skeleton-card">
            <Skeleton className="skeleton-card-img" />
            <Skeleton height="1.5em" width="80%" />
            <Skeleton height="1em" width="60%" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Skeleton className="skeleton-btn" />
                <Skeleton className="skeleton-btn" width="80px" />
            </div>
        </div>
    );
};

export default Skeleton;
