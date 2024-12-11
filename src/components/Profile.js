import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/Profile.css';

const Profile = () => {
  const [teacherData, setTeacherData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const storedLocalId = localStorage.getItem('localId');

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!storedLocalId) return;

      try {
        const teacherRef = doc(db, 'teacher_accounts', storedLocalId);
        const teacherDoc = await getDoc(teacherRef);

        if (teacherDoc.exists()) {
          const data = teacherDoc.data();
          setTeacherData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
          });
        } else {
          console.log('No such teacher document!');
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };

    fetchTeacherData();
  }, [storedLocalId]);

  const handleSave = async () => {
    if (!storedLocalId) return;

    try {
      const teacherRef = doc(db, 'teacher_accounts', storedLocalId);
      await updateDoc(teacherRef, {
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating teacher data:', error);
    }
  };

  return (
    <div className="d-flex w-100">
      <Sidebar />
      <div className="profile-page">
        <NavigationBar />
        <div className="container mt-5">
          <h2 className="mb-2">Teacher Profile</h2>
              <div className="mb-3">
                <div className="card mb-3">
                  <div className="card-body">
                    <label className="form-label">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={teacherData.firstName}
                        onChange={(e) => setTeacherData({ ...teacherData, firstName: e.target.value })}
                      />
                    ) : (
                      <p>{teacherData.firstName}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="card mb-3">
                  <div className="card-body">
                    <label className="form-label">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={teacherData.lastName}
                        onChange={(e) => setTeacherData({ ...teacherData, lastName: e.target.value })}
                      />
                    ) : (
                      <p>{teacherData.lastName}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="card mb-3">
                  <div className="card-body">
                    <label className="form-label">Email</label>
                    <p>{teacherData.email}</p>
                  </div>
                </div>
              </div>
              {isEditing ? (
                <div>
                  <button className="btn btn-success me-2" onClick={handleSave}>Save</button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit</button>
              )}
            </div>
          </div>
        </div>
  );
};

export default Profile;
