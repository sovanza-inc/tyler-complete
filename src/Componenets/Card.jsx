import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  icon, 
  title, 
  value, 
  trend, 
  trendUp,
  color = '#f8f9fa',
  data
}) => {
  // If data prop is provided, use it (for backward compatibility)
  if (data) {
    const { heading, subheading, image, projects } = data;
    return (
      <div className="card box" style={{ backgroundColor: color }}>
        <div>
          <div className="boxHeading d-flex justify-content-between">
            <div className="card-content">
              <h6>{heading}</h6>
              <p>{subheading}</p>
            </div>
            <div>
              <img src={`/img/${image}`} alt="" />
            </div>
          </div>
          <div className="boxDes">
            <div>
              {projects?.map((project, index) => (
                <ul key={index} className="d-flex justify-content-between flex-row flex-wrap">
                  <li>{project.projectName}</li>
                  <li className="boxDesStatus">{project.status}</li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New card design for stats
  return (
    <div className="card stat-card" style={{ backgroundColor: color }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="card-icon">
            {icon}
          </div>
          {trend && (
            <div className={`trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
              {trend}
            </div>
          )}
        </div>
        <h6 className="card-subtitle mb-2">{title}</h6>
        <h3 className="card-title mb-0">{value}</h3>
      </div>
    </div>
  );
};

Card.propTypes = {
  // For new stat cards
  icon: PropTypes.node,
  title: PropTypes.string,
  value: PropTypes.string,
  trend: PropTypes.string,
  trendUp: PropTypes.bool,
  color: PropTypes.string,
  // For legacy data prop
  data: PropTypes.shape({
    heading: PropTypes.string,
    subheading: PropTypes.string,
    image: PropTypes.string,
    color: PropTypes.string,
    projects: PropTypes.arrayOf(
      PropTypes.shape({
        projectName: PropTypes.string,
        status: PropTypes.string
      })
    )
  })
};

export default Card;