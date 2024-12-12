import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/Aralin.css';
import storyData from '../res/story1.json';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const titlesMap = {
  1: 'Mahirap Man ang Gawain Kakayanin Ko', 
  2: 'Nag-iisip Ako Bago Gumawa',
  3: 'Pasiya Mo, Pasiya Ko: Sa Ikabubuti ng Lahat',
  4: 'Tamang Impormasyon, Sinisiguro Ko, Bago Gamitin Ito',
  5: 'Suhestiyon ng Aking Kapuwa, Iginagalang Ko',
  6: 'Ako ay May Isang Salita',
  7: 'Kapuwa Ko, Pinagmamalasakitan Ko',
  8: 'Idea Mo, Igagalang Ko',
  9: 'Mapanagutang Pamamahayag: Isasabuhay Ko',
  10: 'Isinasaalang-alang Ko, Karapatan ng Iba',
  11: 'Nais kong Maging Mabuting Miyembro ng Pamayanan',
  12: 'Mga Natatanging Pilipino, Hinahangaan Ko',
  13: 'Pinagkukunang-yaman: Pahalagahan at Pananagutan Ko',
  14: 'Pagpapatupad ng Batas para sa Kalikasan, Susuportahan Ko',
  15: 'Kalidad ng Aking Gawain, Kaya Kong Ipagmalaki',
  16: 'Pagkamalikhain, Tulong ko sa Pag-unlad ng Bansa',
  17: 'Tumutupad ako sa Batas nang may Kasiyahan',
  18: 'Katulong Tayo sa Pagpapatupad ng Batas',
  19: 'Kapayapaan, Sisikapin Ko',
  20: 'Sisikapin Kong Maging Isang Mabuting Tao',
  21: 'May Pag-asang Dala ang Pananalig ko sa Diyos',
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
    if (id === "1") {
      setStoryContent(storyData.parts);
    }


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
    
              // Fetch assessments where quizId matches the Aralin ID
              const assessmentsRef = collection(db, `students/${studentId}/assessments`);
              const assessmentsQuery = query(assessmentsRef, where('quizId', '==', `quiz${id}`)); // Match quizId with Aralin ID
              const assessmentsSnapshot = await getDocs(assessmentsQuery);
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
                <p>{layuninData.objectives}</p>
                <p>{layuninData.mainthought}</p>
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
                <div key={part.id} className="story-part">
                  <img src={part.image} alt={`Part ${index + 1}`} className="story-image" />
                  <p>{part.text}</p>
                </div>
              ))}
            </div>
          );

        case 'Pagsusulit':
  return (
    <div className="content-section">
      <AssessmentSection students={students} />
      
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
                  <h5>Reflection Level: {reflection.level}</h5>
                  <div className="reflection-details">
                    <p><strong>Reflection:</strong> {reflection.reflection}</p>
                  </div>
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

  useEffect(() => {
    const contentSection = document.querySelector('.content-section');
    if (contentSection) {
      contentSection.scrollTo(0, 0);  // Scroll to the top
    }
  }, [activeTab]); 

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


const AssessmentSection = ({ students }) => {
  const [activeSubTab, setActiveSubTab] = useState('Summary');
  const [expandedAssessments, setExpandedAssessments] = useState({}); // Define expandedAssessments state
  const toggleAssessment = (assessmentId) => {
    setExpandedAssessments((prevState) => ({
      ...prevState,
      [assessmentId]: !prevState[assessmentId],
    }));
  };
  const handleSubTabClick = (tab) => {
    setActiveSubTab(tab);
  };

  const getScoresData = () => {
    const scores = students.flatMap((student) =>
      student.assessments.map((assessment) => assessment.score)
    );

    const totalStudents = students.length;
    const labels = Array.from(new Set(scores))
      .sort((a, b) => a - b)
      .map((score) => `${score} pts`);

    const data = Array.from(new Set(scores))
      .sort((a, b) => a - b)
      .map(
        (score) =>
          (scores.filter((studentScore) => studentScore === score).length / totalStudents) *
          100
      );

    return {
      labels,
      datasets: [
        {
          data: data.map((percentage) => Math.round((percentage / 100) * totalStudents)), // Actual count
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#FFA726'],
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };
  };

  const pieOptions = {
    responsive: false,
    plugins: {
      legend: {
        position: 'top',
      },
      datalabels: {
        formatter: (value, context) => {
          const percentage = (
            (value / students.length) *
            100
          ).toFixed(2); // Calculate percentage
          const label = context.chart.data.labels[context.dataIndex];
          return `${label} ${percentage}%`;
        },
        color: '#000',
        anchor: 'end',
        align: 'start',
        offset: 10,
      },
    },
  };

          return (
            <div className="assessment-section">
              <h3>Assessments</h3>
        
              <div className="sub-tab-bar">
                <button
                  className={`sub-tab-item ${activeSubTab === 'Summary' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('Summary')}
                >
                  Summary
                </button>
                <button
                  className={`sub-tab-item ${activeSubTab === 'Question' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('Question')}
                >
                  Question
                </button>
                <button
                  className={`sub-tab-item ${activeSubTab === 'Individual' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('Individual')}
                >
                  Individual
                </button>
              </div>
        
              <div className="sub-tab-content">
                {activeSubTab === 'Summary' && (
                   <div>
                   <h4>Quiz Scores Distribution Summary</h4>
                   <div style={{ width: '300px', height: '300px', margin: 'auto' }}>
                     <Pie data={getScoresData()} options={pieOptions} width={300} height={300} />
                   </div>
                 </div>
                )}
                {activeSubTab === 'Question' && (
  <div>
    <h4>Assessment Questions</h4>
    {students.map((student) =>
      student.assessments.map((assessment) => {
        const firstAnswer = assessment.answers[0]; // Get the first question
        return firstAnswer ? (
          <div key={assessment.id} className="question-answer-card">
            <p><strong>Question:</strong> {firstAnswer.questionText}</p>
            <hr />
          </div>
        ) : null;
      })
    )}
  </div>
)}
{activeSubTab === 'Individual' && (
  <div>
    {students.map((student) => (
      <div key={student.id} className="student-card">
        <h4>{student.firstName} {student.lastName}</h4>
        <p><strong>Class Code:</strong> {student.classCode}</p>
        {student.assessments.length > 0 ? (
          student.assessments.map((assessment) => {
            const maxScore = assessment.answers.length;

            return (
              <div key={assessment.id} className="assessment-card">
                <h5 onClick={() => toggleAssessment(assessment.id)}>
                  Pagsusulit: {assessment.quizId || assessment.id} {expandedAssessments[assessment.id] ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i> }
                </h5>
                <table className="assessment-details">
                <tbody>
      <tr>
        <td><strong>Score:</strong></td>
        <td>{assessment.score}/{maxScore}</td>
      </tr>
      <tr>
        <td><strong>Percentage:</strong></td>
        <td>
          {maxScore > 0 
            ? ((assessment.score / maxScore) * 100).toFixed(2) + '%' 
            : 'N/A'}
        </td>
      </tr>
      <tr>
        <td><strong>Status:</strong></td>
        <td>{assessment.passed ? 'Passed' : 'Failed'}</td>
      </tr>
    </tbody>
                </table>
                {expandedAssessments[assessment.id] && (
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
                )}
              </div>
            );
          })
        ) : (
          <p>No Assessments Available</p>
        )}
      </div>
    ))}
  </div>
)}

      </div>
    </div>
  );
};

export default Aralin;
