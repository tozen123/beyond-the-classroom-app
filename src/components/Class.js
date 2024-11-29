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

  const [activeWorkTab, setActiveWorkTab] = useState('classwork');
  const [expandedUnits, setExpandedUnits] = useState({});

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classDoc = await getDoc(doc(db, 'classes', id));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          setClassName(classData.section || '');
          setClassCode(classData.classCode || '');
          fetchStudents(classData.classCode);
          fetchLeaderboard(classData.classCode);
        }
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    fetchClassData();
  }, [id]);

  const fetchStudents = async (classCode) => {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('classCode', '==', classCode));
      const querySnapshot = await getDocs(q);

      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        lrn: doc.data().lrn
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

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

  const toggleUnit = (unit) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unit]: !prev[unit],
    }));
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div className="content-section">
            <h2>List of Students</h2>
            <button
              className="add-btn btn btn-success add-student-btn"
              onClick={() => setShowAddStudentForm(true)}
            >
              Add Student
            </button>
            
            {showAddStudentForm && (
              <div className="add-student-form">
                <h3>Add New Student</h3>
                <input
                  className='input-add'
                  type="text"
                  placeholder="First Name"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                />
                <input
                  className='input-add'

                  type="text"
                  placeholder="Last Name"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                />
                <input
                  className='input-add'

                  type="text"
                  placeholder="LRN"
                  value={newStudent.lrn}
                  onChange={(e) => setNewStudent({ ...newStudent, lrn: e.target.value })}
                />
                <div>
                <button className="add-student btn btn-primary" onClick={handleAddStudent}>
                  Save Student
                </button>
                <button className="add-student  btn btn-secondary" onClick={() => setShowAddStudentForm(false)}>
                  Cancel
                </button>
                  </div>
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
        return (
          <div className="content-section">
            <h2>Classwork</h2>
            <div className="dropdown units-container">
              
              <div className="unit" onClick={() => toggleUnit(1)}>
                <i className="fas fa-plus plus-icon"></i>
                <span className="unit-name">Yunit I: Pananagutang Pansarili at Mabuting Kasapi ng Pamilya</span>
                <i className="fas fa-lock lock-icon"></i>
              </div>
              {expandedUnits[1] && (
                <div className="unit-content">
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/1`)}>Aralin 1: Mahirap Man ang Gawain Kakayanin Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/2`)}>Aralin 2: Nag-iisip Ako Bago Gumawa</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/3`)}>Aralin 3: Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/4`)}>Aralin 4: Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito</div>
                </div>
              )}

              <div className="unit" onClick={() => toggleUnit(2)}>
                <i className="fas fa-plus plus-icon"></i>
                <span className="unit-name">Yunit II: Pakikipagkapuwa-Tao</span>
                <i className="fas fa-lock lock-icon"></i>
              </div>
              {expandedUnits[2] && (
                <div className="unit-content">
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/5`)}>Aralin 5: Mahirap Man ang Gawain Kakayanin Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/6`)}>Aralin 6: Nag-iisip Ako Bago Gumawa</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/7`)}>Aralin 7: Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/8`)}>Aralin 8: Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito</div>
                </div>
              )}

              <div className="unit" onClick={() => toggleUnit(3)}>
                <i className="fas fa-plus plus-icon"></i>
                <span className="unit-name">Yunit III: Pagmamahal sa Bansa at Pakikibahagi sa Pandaigdigang Pagkakaisa</span>
                <i className="fas fa-lock lock-icon"></i>
              </div>
              {expandedUnits[3] && (
                <div className="unit-content">
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/9`)}>Aralin 1: Mahirap Man ang Gawain Kakayanin Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/10`)}>Aralin 2: Nag-iisip Ako Bago Gumawa</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/11`)}>Aralin 3: Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/12`)}>Aralin 4: Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito</div>
                </div>
              )}

              <div className="unit" onClick={() => toggleUnit(4)}>
                <i className="fas fa-plus plus-icon"></i>
                <span className="unit-name">Yunit IV: Pananalig at Pagmamahal sa Diyos: Paninindigan sa Kabutihan</span>
                <i className="fas fa-lock lock-icon"></i>
              </div>
              {expandedUnits[4] && (
                <div className="unit-content">
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/13`)}>Aralin 1: Mahirap Man ang Gawain Kakayanin Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/14`)}>Aralin 2: Nag-iisip Ako Bago Gumawa</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/15`)}>Aralin 3: Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/16`)}>Aralin 4: Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito</div>
                </div>
              )}
            </div>
          </div>
        );
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
        <h1>Class: {className} Code: {classCode}</h1>
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
