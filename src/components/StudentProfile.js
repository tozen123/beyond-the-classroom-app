import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/StudentProfile.css';

const StudentProfile = () => {
  const [showFlashMessage, setShowFlashMessage] = useState(false);

  const flashMessagesData = JSON.parse(localStorage.getItem('flashMessagesData') || '[]'); // Placeholder for flash messages
  const studentData = {
    name: "Jeonghan Yoon",
    level: "Level 3",
    rank: "26th",
    progress: 60,
    tasks: [
      { name: "Level 3: Subukan Mo", status: "finished" },
      { name: "Level 7: Gawin Mo", status: "finished" },
      { name: "Level 11: Gawin Mo", status: "unfinished" },
      { name: "Level 15: Subukan Mo", status: "unfinished" },
      { name: "Level 16: Repleksiyon", status: "unfinished" },
    ],
  };

  const handleShowFlashMessage = () => {
    setShowFlashMessage(true);
    setTimeout(() => setShowFlashMessage(false), 3000); // Flash message auto hides after 3 seconds
  };

  return (
    <div className="student-profile">
      {showFlashMessage && (
        <div id="flash-message" className="flash-container">
          {flashMessagesData.map((msg, index) => (
            <div key={index} className={`flash-message ${msg.category}`}>
              {msg.message}
            </div>
          ))}
        </div>
      )}

      <Sidebar />
      <NavigationBar />

      <div className="home-section">
        <div className="home-content">
          <div className="profile-card">
            <div className="avatar">
              <img src="/path/to/icon.png" alt="Profile Icon" />
            </div>
            <div className="info">
              <p><strong>Name:</strong> {studentData.name}</p>
              <p><strong>Current Level:</strong> {studentData.level}</p>
              <p><strong>Current Rank:</strong> {studentData.rank}</p>
            </div>
            <div className="edit-icon">
              <i className="fas fa-edit" onClick={() => alert('Edit Profile')}></i>
            </div>
          </div>

          <div className="container">
            <div className="progress-bar-container">
              <div className="progress-bar">
                <span className="progress-bar-fill" style={{ width: `${studentData.progress}%` }}></span>
              </div>
              <p>Progress: {studentData.progress}% Completed</p>
            </div>

            <div className="task-list">
              {studentData.tasks.map((task, index) => (
                <div className="task-item" key={index}>
                  <span className="task-name">{task.name}</span>
                  <span className={`status ${task.status}`}>{task.status === "finished" ? "Finished" : "Unfinished"}</span>
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
