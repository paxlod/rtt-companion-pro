
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ScriptLab from './components/ScriptLab';
import ClientManager from './components/ClientManager';
import AudioLab from './components/AudioLab';
import HolisticLab from './components/HolisticLab';
import HolisticDr from './components/HolisticDr';
import AIVoiceTherapist from './components/AIVoiceTherapist';
import AIChat from './components/AIChat';
import VideoLab from './components/VideoLab';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'scripts':
        return <ScriptLab />;
      case 'clients':
        return <ClientManager />;
      case 'audio-lab':
        return <AudioLab />;
      case 'holistic-lab':
        return <HolisticLab />;
      case 'holistic-dr':
        return <HolisticDr />;
      case 'ai-therapist':
        return <AIVoiceTherapist />;
      case 'ai-chat':
        return <AIChat />;
      case 'video-lab':
        return <VideoLab />;
      case 'practice-management':
        return (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <h3 className="text-2xl font-serif mb-4">Practice Scheduler</h3>
            <p className="text-slate-500 max-w-md mx-auto">HIPAA-compliant booking and virtual session portal. (Coming soon in Pro Tier)</p>
          </div>
        );
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout activeView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
