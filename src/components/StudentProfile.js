import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  });
  const [assessments, setAssessments] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [expandedAssessments, setExpandedAssessments] = useState({});
  const [expandedReflections, setExpandedReflections] = useState({});

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentsRef = collection(db, 'students');
        const studentQuery = query(studentsRef, where('lrn', '==', id));
        const studentSnapshot = await getDocs(studentQuery);

        if (!studentSnapshot.empty) {
          const studentDoc = studentSnapshot.docs[0];
          const data = studentDoc.data();
          setStudentData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            classCode: data.classCode || '',
            level: data.level || 1,
            points: data.points || 0,
            currency: data.currency || 1,
          });

          fetchAssessmentsAndReflections(studentDoc.id);
        } else {
          console.log('No matching student found for the provided LRN.');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    const fetchAssessmentsAndReflections = async (studentId) => {
      try {
        const assessmentsRef = collection(db, 'students', studentId, 'assessments');
        const assessmentsSnapshot = await getDocs(assessmentsRef);
        const assessmentsData = assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAssessments(assessmentsData);

        const reflectionsRef = collection(db, 'students', studentId, 'reflections');
        const reflectionsSnapshot = await getDocs(reflectionsRef);
        const reflectionsData = reflectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReflections(reflectionsData);
      } catch (error) {
        console.error('Error fetching assessments and reflections:', error);
      }
    };

    fetchStudentData();
  }, [id]);

  const toggleAssessment = (assessmentId) => {
    setExpandedAssessments(prevState => ({
      ...prevState,
      [assessmentId]: !prevState[assessmentId],
    }));
  };

  const toggleReflection = (reflectionId) => {
    setExpandedReflections(prevState => ({
      ...prevState,
      [reflectionId]: !prevState[reflectionId],
    }));
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
              <p><strong>Name:</strong> {studentData.firstName} {studentData.lastName}</p>
              <p><strong>Class Code:</strong> {studentData.classCode}</p>
              <p><strong>Current Level:</strong> Level {studentData.level}</p>
              <p><strong>Points:</strong> {studentData.points}</p>
            </div>
          </div>

          <div className="container">
            <div className="progress-bar-container">
              <div className="progress-bar">
                <span className="progress-bar-fill" style={{ width: `${progress}%` }}></span>
              </div>
              <p>Progress: {progress}% Completed</p>
            </div>

            <div className="assessments-section">
              <h3>Assessments</h3>
              {assessments.map((assessment) => (
                <div key={assessment.id} className="assessment-card">
                  <h4 onClick={() => toggleAssessment(assessment.id)}>
                    Assessment {assessment.id} {expandedAssessments[assessment.id] ? '-' : '+'}
                  </h4>
                  {expandedAssessments[assessment.id] && (
                    <div className="assessment-details">
                      {assessment.answers.map((answer, idx) => (
                        <div key={idx} className="answer-item">
                          <p><strong>Question:</strong> {answer.questionText}</p>
                          <p><strong>Your Answer:</strong> {answer.selectedAnswer}</p>
                          <p><strong>Correct:</strong> {answer.correct ? 'Yes' : 'No'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="reflections-section">
              <h3>Reflections</h3>
              {reflections.map((reflection) => (
                <div key={reflection.id} className="reflection-card">
                  <h4 onClick={() => toggleReflection(reflection.id)}>
                    Reflection {reflection.level} {expandedReflections[reflection.id] ? '-' : '+'}
                  </h4>
                  {expandedReflections[reflection.id] && (
                    <div className="reflection-details">
                      <p><strong>Level:</strong> {reflection.level}</p>
                      <p><strong>Reflection:</strong> {reflection.reflection}</p>
                      <p><strong>Date:</strong> {new Date(reflection.timestamp.seconds * 1000).toLocaleDateString()}</p>
                    </div>
                  )}
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
