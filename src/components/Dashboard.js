import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [localId, setLocalId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [editingClassId, setEditingClassId] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [showMenu, setShowMenu] = useState(null); // State to toggle the menu visibility

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

  const handleEditClass = async (classId) => {
    try {
      const classDocRef = doc(db, 'classes', classId);
      await updateDoc(classDocRef, {
        section: newClassName,
      });
      setEditingClassId(null);
      setNewClassName('');
      fetchClasses(localId);
    } catch (error) {
      console.error('Error updating class name:', error);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      const classDocRef = doc(db, 'classes', classId);
      await deleteDoc(classDocRef); 
      fetchClasses(localId); 
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingClassId(null); 
    setNewClassName('');
  };
  

  const handleMenuToggle = (classId) => {
    setShowMenu(showMenu === classId ? null : classId); 
  };

  if (!localId) return null;

  return (
    <div className="dashboard">
      <Sidebar />
      <NavigationBar />
      <div className="dashboard-section">
        <div className="dashboard-header">
          <h1>Section</h1>
        </div>
        <div className="dashboard-grid">
          {classes.map(classItem => (
            <div key={classItem.id} className="dashboard-card">
              <div className="class-info">
                <div className="class-name">
                  {editingClassId === classItem.id ? (
                    <input className="input-box"
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Enter new class name"
                    />
                  ) : (
                    classItem.section
                  )}
                </div>
                <div className="three-dot-menu">
                  <i
                    className="fa-solid fa-ellipsis-vertical"
                    onClick={() => handleMenuToggle(classItem.id)}
                  ></i>
                  {showMenu === classItem.id && (
                    <div className="menu-options">
                      {editingClassId === classItem.id ? (
                        <>
                        <button onClick={() => handleEditClass(classItem.id)}>Save</button>
                        <button onClick={() => handleCancelEdit()}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingClassId(classItem.id)}>Edit</button>
                          <button onClick={() => handleDeleteClass(classItem.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Link to={`/class/${classItem.id}`} className="view-class-link">View class</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
