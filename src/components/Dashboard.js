import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [localId, setLocalId] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const storedLocalId = localStorage.getItem('localId');
    if (!storedLocalId) {
      window.location.href = '/login';
    } else {
      setLocalId(storedLocalId);
      fetchClasses(storedLocalId);
    }
  }, []);

  const fetchClasses = async (userId) => {
    try {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('createdBy', '==', userId));
      const querySnapshot = await getDocs(q);
      const classesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classesList);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  if (!localId) return null;

  return (
    <div className="dashboard">
      <Sidebar />
      <NavigationBar />
      <div className="dashboard-section">
        <div className="dashboard-header">
          <h1>Classes</h1>
        </div>
        <div className="dashboard-grid">
          {classes.map(classItem => (
            <div key={classItem.id} className="dashboard-card">
              <div className="class-name">{classItem.section}</div>
              <Link to={`/class/${classItem.id}`} className="view-class-link">View class</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
