import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import '../css/Class.css';

import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';

const Class = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', lrn: '' });
  const [leaderboard, setLeaderboard] = useState([]);
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classDoc = await getDoc(doc(db, 'classes', id));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          setClassName(classData.section || '');
          setClassCode(classData.classCode || '');
          setStudents(classData.students || []);

          const classCode = classData.classCode;
          fetchLeaderboard(classCode);
        }
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    fetchClassData();
  }, [id]);

  const handleAddStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.lrn) {
      alert('Please fill in all fields for the new student.');
      return;
    }

    const newStudentData = { ...newStudent, classCode: classCode };

    try {
      await addDoc(collection(db, 'students'), newStudentData);

      const classRef = doc(db, 'classes', id);
      await updateDoc(classRef, {
        students: arrayUnion(newStudent)
      });

      setStudents((prevStudents) => [...prevStudents, newStudent]);
      setNewStudent({ firstName: '', lastName: '', lrn: '' });
      setShowAddStudentForm(false);
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };
  const fetchLeaderboard = async (classCode) => {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('classCode', '==', classCode));
      const querySnapshot = await getDocs(q);

      const leaderboardData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        lrn: doc.data().lrn,
        points: doc.data().points || 0, 
      }));

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div className="content-section">
            <h2>List of Students</h2>
            <button
              className="btn btn-success add-student-btn"
              onClick={() => setShowAddStudentForm(true)}
            >
              Add Student
            </button>
            
            {showAddStudentForm && (
              <div className="add-student-form">
                <h3>Add New Student</h3>
                <input
                  type="text"
                  placeholder="First Name"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="LRN"
                  value={newStudent.lrn}
                  onChange={(e) => setNewStudent({ ...newStudent, lrn: e.target.value })}
                />
                <button className="btn btn-primary" onClick={handleAddStudent}>
                  Save Student
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddStudentForm(false)}>
                  Cancel
                </button>
              </div>
            )}

            <table className="student-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>LRN</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index}>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td>{student.lrn}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm profile-link-btn"
                        onClick={() => navigate(`/studentprofile/${student.lrn}`)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'classwork':
        return <div className="content-section">Classwork</div>;
      case 'leaderboard':
        return (
          <div className="content-section">
            <h2>Leaderboard</h2>
            <div className="leaderboard-list">
              {leaderboard
                .sort((a, b) => b.points - a.points) 
                .map((student, index) => (
                  <div
                    key={student.id}
                    className={`leaderboard-item ${index % 2 === 0 ? 'even' : 'odd'}`}
                  >
                    <span className="leaderboard-name">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="leaderboard-rank">Rank {index + 1}</span>
                    <span className="leaderboard-points">{student.points}</span>
                  </div>
                ))}
            </div>
          </div>
        );
      default:
        return <div className="content-section">Welcome to Class</div>;
    }
  };

  return (
    <div className="class-page">
      <Sidebar />
      <NavigationBar />
      <div className="main-content">
        <h1>Class: {className}</h1>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`tab-button ${activeTab === 'classwork' ? 'active' : ''}`}
            onClick={() => setActiveTab('classwork')}
          >
            Classwork
          </button>
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Class;
