import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, createUserWithEmailAndPassword, setDoc, doc } from '../firebaseConfig';
import MessageModal from './MessageModal';
import '../css/SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveLogin, setSaveLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLocalId = localStorage.getItem('localId') || sessionStorage.getItem('localId');
    if (savedLocalId) {
      navigate('/dashboard'); 
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData, 
      [e.target.name]: e.target.value
    });
  };

  const handleSaveLoginChange = (e) => {
    setSaveLogin(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fname, lname, email, password } = formData;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'teacher_accounts', user.uid), {
        email: email,
        first_name: fname,
        last_name: lname,
        localId: user.uid
      });

      if (saveLogin) {
        localStorage.setItem('localId', user.uid);
      } else {
        sessionStorage.setItem('localId', user.uid);
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error signing up:', error.message);
      setError(error.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="fname">First Name</label>
        <input
          type="text"
          id="fname"
          name="fname"
          value={formData.fname}
          onChange={handleChange}
          required
        />
        <label htmlFor="lname">Last Name</label>
        <input
          type="text"
          id="lname"
          name="lname"
          value={formData.lname}
          onChange={handleChange}
          required
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <label className="save-login">
          <input
            type="checkbox"
            checked={saveLogin}
            onChange={handleSaveLoginChange}
          />
          Save Login
        </label>
        <input type="submit" value="Sign Up" />
      </form>
      {isModalOpen && <MessageModal message="Sign-up Successful" onClose={handleModalClose} />}
    </div>
  );
};

export default SignUp;
