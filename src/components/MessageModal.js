import React from 'react';
import '../css/Modal.css';

const MessageModal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{message}</h3>
        <button onClick={onClose}>Ok</button>
      </div>
    </div>
  );
};

export default MessageModal;
