  import React, { useState } from 'react';
  import { db } from '../firebaseConfig';
  import { collection, addDoc, Timestamp } from 'firebase/firestore';
  import { useNavigate } from 'react-router-dom';
  import '../css/CreateClass.css';

  import Sidebar from './Sidebar';
  import NavigationBar from './NavigationBar';

  const CreateClass = () => {
    const [section, setSection] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isClassCreated, setIsClassCreated] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [classCode, setClassCode] = useState('');
    const navigate = useNavigate();
    const localId = localStorage.getItem('localId');

    const generateClassCode = () => `ESP-${Math.floor(100 + Math.random() * 900)}`;

    const handleAddStudent = () => {
      if (!firstName || !lastName) {
        alert('Please fill in all student fields.');
        return;
      }

      const studentNumber = `${section}-${selectedStudents.length + 1}`; 
      const newStudent = { firstName, lastName, lrn: studentNumber };
      setSelectedStudents([...selectedStudents, newStudent]);

      setFirstName('');
      setLastName('');
    };

    const handleRemoveStudent = (index) => {
      setSelectedStudents(selectedStudents.filter((_, i) => i !== index));
    };

    const handleSaveClass = async () => {
      if (!section) {
        alert('Please enter a section name.');
        return;
      }

      const generatedCode = generateClassCode();
      setClassCode(generatedCode);

      const classData = {
        classCode: generatedCode,
        createdBy: localId,
        created_at: Timestamp.now(),
        section,
      };

      try {
        await addDoc(collection(db, 'classes'), classData);

        const studentCollection = collection(db, 'students');
        for (const student of selectedStudents) {
          await addDoc(studentCollection, {
            firstName: student.firstName,
            lastName: student.lastName,
            lrn: student.lrn,
            classCode: generatedCode,
          });
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Error creating class:', error);
      }
    };

    return (
      <div className="create-class-div-parent">
        <Sidebar />
        <NavigationBar />
        <div className="create-class-container">
          {isClassCreated ? (
            <div className="add-students-container">
              <div className='header-container'>
              <h2>Add Students</h2>
              <h2 className='section'>Section: {section}</h2>
              </div>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <button onClick={handleAddStudent} className="btn btn-primary btn-sm">
                Add to Selected Students
              </button>

              <h3>Selected Students</h3>
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Student Number</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((student, index) => (
                    <tr key={index}>
                      <td>{student.lrn}</td>
                      <td>{student.firstName}</td>
                      <td>{student.lastName}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveStudent(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className='button-container'>
              <button onClick={() => setIsClassCreated(false)} className="btn btn-secondary"> Cancel </button>
              <button onClick={handleSaveClass} className="btn btn-success"> Save </button>
              </div>
            </div>
          ) : (
            <div className="create-class-form">
              <h1>Create New Class</h1>
              <p>Class Code: {classCode || generateClassCode()}</p>
              <div className="form-group">
                <label>Section Name:</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={() => setIsClassCreated(true)} className="btn btn-success">
                  Save
                </button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default CreateClass;
