import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
import '../css/Aralin.css';

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
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Layunin');
  const aralinTitle = titlesMap[id] || 'Aralin';
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Layunin':
        return <div className="content-section">Layunin Content</div>;
      case 'Kuwento':
        return <div className="content-section">Kuwento Content</div>;
      case 'Pagsusulit':
        return <div className="content-section">Pagsusulit Content</div>;
      case 'Repleksiyon':
        return <div className="content-section">Repleksiyon Content</div>;
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
          <h1>Aralin {id} : {aralinTitle}</h1>
        </div>
        <div className="tab-bar">
          <div className={`tab-item ${activeTab === 'Layunin' ? 'active' : ''}`} onClick={() => setActiveTab('Layunin')}>Layunin</div>
          <div className={`tab-item ${activeTab === 'Kuwento' ? 'active' : ''}`} onClick={() => setActiveTab('Kuwento')}>Kuwento</div>
          <div className={`tab-item ${activeTab === 'Pagsusulit' ? 'active' : ''}`} onClick={() => setActiveTab('Pagsusulit')}>Pagsusulit</div>
          <div className={`tab-item ${activeTab === 'Repleksiyon' ? 'active' : ''}`} onClick={() => setActiveTab('Repleksiyon')}>Repleksiyon</div>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Aralin;
