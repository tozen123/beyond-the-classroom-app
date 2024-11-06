import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/StudentProfile.css';

const TOTAL_LEVELS = 84;

const StudentProfile = () => {
  const { id } = useParams();
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    classCode: '',
    level: 1,
    points: 0,
    currency: 1,
    tasks: []
  });
  const [rank, setRank] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [studentDocId, setStudentDocId] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentsRef = collection(db, 'students');
        const studentQuery = query(studentsRef, where('lrn', '==', id));
        const studentSnapshot = await getDocs(studentQuery);

        if (!studentSnapshot.empty) {
          const studentDoc = studentSnapshot.docs[0];
          const data = studentDoc.data();
          const classCode = data.classCode;
          setStudentDocId(studentDoc.id);
          setStudentData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            classCode: classCode || '',
            level: data.level || 1,
            points: data.points || 0,
            currency: data.currency || 1,
            tasks: data.tasks || []
          });
          setEditedFirstName(data.firstName || '');
          setEditedLastName(data.lastName || '');
          fetchClassRanking(classCode, data.points);
        } else {
          console.log('No matching student found for the provided LRN.');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    const fetchClassRanking = async (classCode, studentPoints) => {
      try {
        const studentsRef = collection(db, 'students');
        const classQuery = query(studentsRef, where('classCode', '==', classCode));
        const classSnapshot = await getDocs(classQuery);

        const classStudents = classSnapshot.docs.map(doc => ({
          id: doc.id,
          points: doc.data().points || 0
        }));

        classStudents.sort((a, b) => b.points - a.points);

        const studentRank = classStudents.findIndex(student => student.points === studentPoints) + 1;
        setRank(studentRank);
      } catch (error) {
        console.error('Error fetching class ranking:', error);
      }
    };

    fetchStudentData();
  }, [id]);

  const handleSave = async () => {
    if (!studentDocId) return;
    
    try {
      const studentRef = doc(db, 'students', studentDocId);
      await updateDoc(studentRef, {
        firstName: editedFirstName,
        lastName: editedLastName
      });

      setStudentData(prevData => ({
        ...prevData,
        firstName: editedFirstName,
        lastName: editedLastName
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating student data:', error);
    }
  };

  const progress = ((studentData.level / TOTAL_LEVELS) * 100).toFixed(0);

  return (
    <div className="student-profile">
      <Sidebar />
      <NavigationBar />

      <div className="home-section">
        <div className="home-content">
          
          <div className="profile-card">
            <div className="info">
              {isEditing ? (
                <>
                  <label>
                    First Name:
                    <input
                      type="text"
                      value={editedFirstName}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                    />
                  </label>
                  <label>
                    Last Name:
                    <input
                      type="text"
                      value={editedLastName}
                      onChange={(e) => setEditedLastName(e.target.value)}
                    />
                  </label>
                  <button className="btn btn-success" onClick={handleSave}>Save</button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <p><strong>Name:</strong> {studentData.firstName} {studentData.lastName}</p>
                  <p><strong>Class Code:</strong> {studentData.classCode}</p>
                  <p><strong>Current Level:</strong> Level {studentData.level}</p>
                  <p><strong>Current Rank:</strong> {rank ? `${rank}th` : 'Unranked (0)'}</p>
                  <div className="edit-icon">
                    <i className="fas fa-edit" onClick={() => setIsEditing(true)}></i>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="container">
            <div className="progress-bar-container">
              <div className="progress-bar">
                <span className="progress-bar-fill" style={{ width: `${progress}%` }}></span>
              </div>
              <p>Progress: {progress}% Completed</p>
            </div>

            <div className="task-list">
              {studentData.tasks.map((task, index) => (
                <div className="task-item" key={index}>
                  <span className="task-name">{task.name}</span>
                  <span className={`status ${task.status}`}>
                    {task.status === "finished" ? "Finished" : "Unfinished"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
