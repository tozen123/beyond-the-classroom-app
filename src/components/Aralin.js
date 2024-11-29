import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/Aralin.css';
import storyData from '../res/story1.json';

const titlesMap = {
  1: 'Mahirap Man ang Gawain Kakayanin Ko',
  2: 'Nag-iisip Ako Bago Gumawa',
  3: 'Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat',
  4: 'Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito',
  5: 'Mahirap Man ang Gawain Kakayanin Ko',
  6: 'Nag-iisip Ako Bago Gumawa',
  7: 'Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat',
  8: 'Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito',
  9: 'Mahirap Man ang Gawain Kakayanin Ko',
  10: 'Nag-iisip Ako Bago Gumawa',
  11: 'Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat',
  12: 'Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito',
  13: 'Mahirap Man ang Gawain Kakayanin Ko',
  14: 'Nag-iisip Ako Bago Gumawa',
  15: 'Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat',
  16: 'Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito',
};

const Aralin = () => {
  const {  id, classid } = useParams();
  const [activeTab, setActiveTab] = useState('Layunin');
  const [layuninData, setLayuninData] = useState(null);
  const [storyContent, setStoryContent] = useState([]);
  const [students, setStudents] = useState([]);
  const aralinTitle = titlesMap[id] || 'Aralin';
  const [expandedAssessments, setExpandedAssessments] = useState({});
  const [expandedReflections, setExpandedReflections] = useState({});
  const toggleAssessment = (assessmentId) => {
    setExpandedAssessments((prevState) => ({
      ...prevState,
      [assessmentId]: !prevState[assessmentId],
    }));
  };
  
  const toggleReflection = (reflectionId) => {
    setExpandedReflections((prevState) => ({
      ...prevState,
      [reflectionId]: !prevState[reflectionId],
    }));
  };
  const [loading, setLoading] = useState(false);
  const handleTabSwitch = (tabName) => {
    setLoading(true); // Show the loading indicator
    setActiveTab(tabName);
  
    // Simulate a slight delay for loading (e.g., fetching data)
    setTimeout(() => {
      setLoading(false); // Hide the loading indicator
    }, 500); // Adjust delay as needed
  };
  
  useEffect(() => {

    console.log('Aralin ID:', id);
    console.log('Class ID:', classid);


    const fetchLayuninData = async () => {
      try {
        const lessonData = await import(`../res/lesson${ id}.json`);
        setLayuninData({
          imageRefUrl: lessonData.image_ref_url,
          subTitle: lessonData.sub_title,
          description: lessonData.description,
        });
      } catch (error) {
        console.error('Error loading local JSON file:', error);
      }
    };

    const fetchStudents = async () => {
      try {
        const classRef = doc(db, 'classes', classid);
        const classDoc = await getDoc(classRef);
    
        if (classDoc.exists()) {
          const classData = classDoc.data();
          const classCode = classData.classCode;
    
          const studentsRef = collection(db, 'students');
          const studentsQuery = query(studentsRef, where('classCode', '==', classCode));
          const studentsSnapshot = await getDocs(studentsQuery);
    
          const studentsData = await Promise.all(
            studentsSnapshot.docs.map(async (doc) => {
              const studentData = doc.data();
              const studentId = doc.id;
    
              // Fetch assessments
              const assessmentsRef = collection(db, `students/${studentId}/assessments`);
              const assessmentsSnapshot = await getDocs(assessmentsRef);
              const assessments = assessmentsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
    
              // Fetch reflections
              const reflectionsRef = collection(db, `students/${studentId}/reflections`);
              const reflectionsSnapshot = await getDocs(reflectionsRef);
              const reflections = reflectionsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
    
              return {
                id: studentId,
                ...studentData,
                assessments,
                reflections,
              };
            })
          );
    
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    
    

    fetchLayuninData();

    if (id.split('/')[1] === "1") {
      setStoryContent(storyData.parts);
    }

    fetchStudents();
  }, [id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Layunin':
        return (
          <div className="content-section">
            {layuninData ? (
              <>
                <img src={layuninData.imageRefUrl} alt={layuninData.subTitle} className="layunin-image" />
                <h2>{layuninData.subTitle}</h2>
                <p>{layuninData.description}</p>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        );
      case 'Kuwento':
        return (
          <div className="content-section scrollable-content">
            {storyContent.map((part, index) => (
              <div key={index} className="story-part">
                <img src={part.image} alt={`Part ${index + 1}`} className="story-image" />
                <p>{part.text}</p>
              </div>
            ))}
          </div>
        );
        case 'Pagsusulit':
  return (
    <div className="content-section">
      <h3>Assessments</h3>
      {students.map((student) => (
        <div key={student.id} className="student-card">
          <h4>{student.firstName} {student.lastName}</h4>
          <p><strong>Class Code:</strong> {student.classCode}</p>
          {student.assessments.length > 0 ? (
            student.assessments.map((assessment) => {
              const maxScore = assessment.answers.length; // Calculate maxScore dynamically

              return (
                <div key={assessment.id} className="assessment-card">
                  <h5 onClick={() => toggleAssessment(assessment.id)}>
                    Quiz ID: {assessment.quizId || assessment.id} {expandedAssessments[assessment.id] ? '-' : '+'}
                  </h5>
                  {expandedAssessments[assessment.id] && (
                    <div className="assessment-details">
                      <p><strong>Score:</strong> {assessment.score}/{maxScore}</p>
                      <p><strong>Percentage:</strong> 
                        {maxScore > 0 
                          ? ((assessment.score / maxScore) * 100).toFixed(2) + '%' 
                          : 'N/A'}
                      </p>
                      <p><strong>Status:</strong> {assessment.passed ? 'Passed' : 'Failed'}</p>
                      <p><strong>Date Taken:</strong> 
                        {assessment.date && assessment.date.seconds 
                          ? new Date(assessment.date.seconds * 1000).toLocaleDateString() 
                          : 'No Date Available'}
                      </p>

                      <div className="questions-section">
                        {assessment.answers.map((answer, idx) => (
                          <div
                            key={idx}
                            className={`question-card ${answer.correct ? 'correct' : 'incorrect'}`}
                          >
                            <p><strong>Question:</strong> {answer.questionText}</p>
                            <p><strong>Your Answer:</strong> {answer.selectedAnswer}</p>
                            <p><strong>Correct:</strong> {answer.correct ? 'Yes' : 'No'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No Data Available</p>
          )}
        </div>
      ))}
    </div>
  );





        
  case 'Repleksiyon':
  return (
    <div className="content-section">
      <h3>Reflections</h3>
      {students.map((student) => (
        <div key={student.id} className="student-card">
          <h4>{student.firstName} {student.lastName}</h4>
          <p><strong>Class Code:</strong> {student.classCode}</p>
          {student.reflections.length > 0 ? (
            student.reflections.map((reflection) => (
              <div key={reflection.id} className="reflection-card">
                <h5 onClick={() => toggleReflection(reflection.id)}>
                  Reflection Level: {reflection.level} {expandedReflections[reflection.id] ? '-' : '+'}
                </h5>
                {expandedReflections[reflection.id] && (
                  <div className="reflection-details">
                    <p><strong>Reflection:</strong> {reflection.reflection}</p>
                    <p><strong>Date:</strong> 
                      {reflection.timestamp && reflection.timestamp.seconds 
                        ? new Date(reflection.timestamp.seconds * 1000).toLocaleDateString() 
                        : 'No Date Available'}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No Data Available</p>
          )}
        </div>
      ))}
    </div>
  );


  
      default:
        return <div className="content-section">Welcome to Aralin {id}</div>;
    }
  };

  return (
    <div>
      <Sidebar />
      <NavigationBar />
      <div className="aralin-section">
        <div className="aralin-header">
          <h1>Aralin {id.split('/')[1]} : {aralinTitle}</h1>
        </div>
        <div className="tab-bar">
          <div className={`tab-item ${activeTab === 'Layunin' ? 'active' : ''}`} onClick={() => setActiveTab('Layunin')}>Layunin</div>
          <div className={`tab-item ${activeTab === 'Kuwento' ? 'active' : ''}`} onClick={() => setActiveTab('Kuwento')}>Kuwento</div>
          <div
            className={`tab-item ${activeTab === 'Pagsusulit' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('Pagsusulit')}
          >
            Pagsusulit
          </div>
          <div
            className={`tab-item ${activeTab === 'Repleksiyon' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('Repleksiyon')}
          >
            Repleksiyon
          </div>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Aralin;
