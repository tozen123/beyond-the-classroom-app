import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/Analytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState('quiz1'); // State for selected quiz

  useEffect(() => {
    const fetchAssessmentData = async () => {
      setLoading(true); // Show loading while fetching data
      try {
        const studentsRef = collection(db, 'students');
        const studentsSnapshot = await getDocs(studentsRef);

        const filteredStudents = await Promise.all(
          studentsSnapshot.docs.map(async (doc) => {
            const student = doc.data();
            const assessmentsRef = collection(db, `students/${doc.id}/assessments`);
            const assessmentQuery = query(assessmentsRef, where('quizId', '==', selectedQuiz)); // Query based on selected quiz
            const assessmentSnapshot = await getDocs(assessmentQuery);

            if (!assessmentSnapshot.empty) {
              const assessment = assessmentSnapshot.docs[0].data(); // Get the first assessment
              return {
                name: `${student.firstName} ${student.lastName}`,
                score: assessment.score || 0,
                totalQuestions: assessment.answers.length || 0,
                percentage: assessment.answers.length
                  ? ((assessment.score / assessment.answers.length) * 100).toFixed(2)
                  : '0',
              };
            }
            return null;
          })
        );

        // Filter out students who didn't take the assessment
        setStudentsData(filteredStudents.filter((student) => student !== null));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [selectedQuiz]); // Refetch data when selectedQuiz changes

  // Prepare data for charts
  const barData = {
    labels: studentsData.map((student) => student.name),
    datasets: [
      {
        label: 'Scores',
        data: studentsData.map((student) => student.score),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: studentsData.map((student) => student.name),
    datasets: [
      {
        label: 'Percentage Score',
        data: studentsData.map((student) => parseFloat(student.percentage)),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Analytics for Assessment: ${selectedQuiz}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <Sidebar />
      <NavigationBar />
      <div className="chart-container">
        <div className="quiz-selector">
          <label htmlFor="quizSelect">Select Quiz:</label>
          <select
            id="quizSelect"
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
          >
            {Array.from({ length: 21 }, (_, i) => (
              <option key={`quiz${i + 1}`} value={`quiz${i + 1}`}>
                Quiz {i + 1}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : studentsData.length > 0 ? (
          <>
            <div className="chart-box">
              <h3>Scores Distribution</h3>
              <Bar data={barData} options={options} />
            </div>
            <div className="chart-box">
              <h3>Percentage Scores</h3>
              <Line data={lineData} options={options} />
            </div>
          </>
        ) : (
          <p>No students have taken this assessment yet.</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
