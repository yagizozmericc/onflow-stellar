import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon">
        {icon}
      </div>
      <div className="stats-info">
        <span className="stats-title">{title}</span>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard; 