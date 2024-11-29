import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateClass from './components/CreateClass';
import Profile from './components/Profile';
import Class from './components/Class';
import StudentProfile from './components/StudentProfile';
import Aralin from './components/Aralin';


import ProtectedRoute from './components/ProtectedRoute';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Analytics from './components/Analytics';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const localId = localStorage.getItem('localId');
    setIsAuthenticated(!!localId);
  }, []);

  const protectedRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/createclass', element: <CreateClass /> },
    { path: '/profile', element: <Profile /> },
    { path: '/class/:id', element: <Class /> },
    { path: '/studentprofile/:id', element: <StudentProfile /> },

    { path: '/analytics', element: <Analytics /> },

    { path: '/aralin/:classid/:id', element: <Aralin /> } 
  ];

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {element}
              </ProtectedRoute>
            }
          />
        ))}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
