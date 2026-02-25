import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './BackButton.css';

const BackButton = ({ label = 'Back' }) => {
  const navigate = useNavigate();
  return (
    <div className="back-button-container">
      <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
        <FaArrowLeft className="back-icon" />
        <span className="back-label">{label}</span>
      </button>
    </div>
  );
};

export default BackButton;
