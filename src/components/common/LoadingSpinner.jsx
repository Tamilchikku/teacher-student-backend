import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'large' }) => {
  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`}></div>
    </div>
  );
};

export default LoadingSpinner;