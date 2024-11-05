import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import logo from '../img/beyond-logo-colored.png';
import '../css/Sidebar.css';

const Sidebar = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const localId = localStorage.getItem('localId'); 
        if (!localId) return; 
  
        const classesRef = collection(db, 'classes');
        const q = query(classesRef, where('createdBy', '==', localId)); 
        const querySnapshot = await getDocs(q);
  
        const classList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClasses(classList);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
  
    fetchClasses();
  }, []);

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="Beyond+" className="logo-image" />
      </div>

      <ul className="nav-list">
        <li>
          <Link to="/dashboard">
            <i className="fas fa-tachometer-alt"></i>
            <span className="link-name">Dashboard</span>
          </Link>
        </li>
        <li>
          <div className="icon-link" onClick={toggleSubMenu}>
            {/* <Link to="/classes">
              <i className="fas fa-chalkboard-teacher"></i>
              <span className="link-name">Classes</span>
            </Link> */}

            <Link>
              <i className="fas fa-chalkboard-teacher"></i>
              <span className="link-name">Classes</span>
            </Link>
            <i className={`fas fa-caret-down arrow ${isSubMenuOpen ? 'rotate' : ''}`}></i>
          </div>
          {isSubMenuOpen && (
            <ul className="sub-menu">
              {classes.map((classData) => (
                <li key={classData.id}>
                  <Link to={`/class/${classData.id}`}>
                    {`Class: ${classData.section}`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li>
          <Link to="/analytics">
            <i className="fas fa-chart-line"></i>
            <span className="link-name">Analytics</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
