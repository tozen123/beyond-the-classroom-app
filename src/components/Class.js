import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
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

  const [studentCount, setStudentCount] = useState(0);


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);


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

      studentsData.sort((a, b) => a.lrn.localeCompare(b.lrn));

      setStudentCount(studentsData.length);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };
  const showDeleteModal = (student) => {
    setStudentToDelete(student);
    setIsModalVisible(true);
  };

  const handleRemoveStudent = async () => {
    try {
      if (studentToDelete) {
        await deleteDoc(doc(db, 'students', studentToDelete.id));
        setStudents((prevStudents) => prevStudents.filter((student) => student.id !== studentToDelete.id));
        setStudentCount(studentCount - 1);
      }
      setIsModalVisible(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName) {
      alert('Please fill in all fields for the new student.');
      return;
    }

    // Generate Student Number (LRN)
    const studentNumber = `${className}-${studentCount + 1}`;

    const newStudentData = {
      ...newStudent,
      classCode: classCode,
      lrn: studentNumber, // Auto-generated LRN
    };

    try {
      await addDoc(collection(db, 'students'), newStudentData);
      setStudents((prevStudents) => [...prevStudents, newStudentData]);
      setNewStudent({ firstName: '', lastName: '' });
      setShowAddStudentForm(false);
      setStudentCount(studentCount + 1); // Increment student count
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
            <div className='header-section'>
            <h2>List of Students</h2>
            <button className="add-btn btn btn-success add-student-btn"
              onClick={() => setShowAddStudentForm(true)}>
              Add Student</button>
            </div>

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
                <th>Student Number</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Profile</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index}>
                    <td>{student.lrn}</td>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                    
                    <td>
                      <button className="btn btn-primary btn-sm profile-link-btn" 
                      onClick={() => navigate(`/studentprofile/${student.lrn}`)}>
                        View Profile </button>
                    </td>
                    <td>
                    <button className="btn btn-danger btn-sm"
                        onClick={() => showDeleteModal(student)}>
                        Remove </button>
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
              
              </div>
              {expandedUnits[2] && (
                <div className="unit-content">
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/5`)}>Aralin 5: Suhestiyon ng Aking Kapuwa, Iginagalang Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/6`)}>Aralin 6: Ako ay May Isang Salita</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/7`)}>Aralin 7: Kapuwa Ko, Pinagmamalasakitan Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/8`)}>Aralin 8: Idea Mo, Igagalang Ko</div>
                </div>
              )}

              <div className="unit" onClick={() => toggleUnit(3)}>
                <i className="fas fa-plus plus-icon"></i>
                <span className="unit-name">Yunit III: Pagmamahal sa Bansa at Pakikibahagi sa Pandaigdigang Pagkakaisa</span>

              </div>
              {expandedUnits[3] && (
                <div className="unit-content">
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/9`)}>Aralin 9: Mapanagutang Pamamahayag: Isasabuhay Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/10`)}>Aralin 10: Isinasaalang-alang Ko, Karapatan ng Iba</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/11`)}>Aralin 11: Nais kong Maging Mabuting Miyembro ng Pamayanan</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/12`)}>Aralin 12: Mga Natatanging Pilipino, Hinahangaan Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/13`)}>Aralin 13: Pinagkukunang-yaman: Pahalagahan at Pananagutan Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/14`)}>Aralin 14: Pagpapatupad ng Batas para Sa Kalikasan, Susuportahan Ko</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/15`)}>Aralin 15: Kalidad ng Aking Gawain, Kaya Kong Ipagmalaki</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/16`)}>Aralin 16: Pagkamalikhain, Tulong ko sa Pag-unlad ng Bansa</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/17`)}>Aralin 17: Tumutupad ako sa Batas nang may Kasiyahan</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/18`)}>Aralin 18: Katulong Tayo sa Pagpapatupad ng Batas</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/19`)}>Aralin 19: Kapayapaan, Sisikapin Ko</div>
                </div>
              )}

              <div className="unit" onClick={() => toggleUnit(4)}>
                <i className="fas fa-plus plus-icon"></i>
                <span className="unit-name">Yunit IV: Pananalig at Pagmamahal sa Diyos: Paninindigan sa Kabutihan</span>
              
              </div>
              {expandedUnits[4] && (
                <div className="unit-content">
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/20`)}>Aralin 20: Sisikapin Kong Maging Isang Mabuting Tao</div>
                  <div className="aralin-item" onClick={() => navigate(`/aralin/${id}/14`)}>Aralin 21: May Pag-asang Dala ang Pananalig ko sa Diyos</div>
                
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
        <h2 className='section-header'>Section: {className}</h2>
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
        {isModalVisible && (
          <div className="modal class-modal">
            
              <h4>Are you sure you want to delete this student?</h4>
              <p>
                {studentToDelete?.firstName} {studentToDelete?.lastName} - {studentToDelete?.lrn}
              </p>
              <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsModalVisible(false)}> Cancel </button>
                <button className="btn btn-danger" onClick={handleRemoveStudent}> Yes, Delete </button>
                
              </div>
            </div>
      
        )}
      </div>
    </div>
  );
};

export default Class;
