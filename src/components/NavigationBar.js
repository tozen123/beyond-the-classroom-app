import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/NavigationBar.css';

const NavigationBar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('localId');
    navigate('/login');
  };

  return (
    <div className="navigation-bar">
     

      <div className="nav-icons">
        <Link to="/createclass">
          <i className="fas fa-plus plus-icon"></i>
        </Link>
        <div className="profile-icon">
          <i className="fas fa-user-circle"></i>
          <div className="dropdown-content">
            <Link to="/profile">Edit Profile</Link>
            <Link onClick={() => setShowLogoutModal(true)}>Log Out</Link>
          </div>
        </div>
        
      </div>
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}> 
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white' }}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
     
    </div>
  );
};

export default NavigationBar;
