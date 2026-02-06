
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Mic2, 
  Settings, 
  Sparkles,
  Calendar,
  Zap,
  Moon,
  MessageCircle,
  Video,
  Stethoscope
} from 'lucide-react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'clients', icon: Users, label: 'Client Manager' },
    { id: 'scripts', icon: FileText, label: 'Script Lab' },
    { id: 'holistic-dr', icon: Stethoscope, label: 'Holistic Dr' },
    { id: 'holistic-lab', icon: Moon, label: 'Holistic Lab' },
    { id: 'audio-lab', icon: Mic2, label: 'Audio & TTS' },
    { id: 'ai-therapist', icon: Zap, label: 'AI Voice Therapist' },
    { id: 'video-lab', icon: Video, label: 'Video Understanding' },
    { id: 'ai-chat', icon: MessageCircle, label: 'RTT Chat Expert' },
    { id: 'practice-management', icon: Calendar, label: 'Sessions' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">RTT Pro</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 w-full transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800 capitalize">
            {activeView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              New Session
            </button>
          </div>
        </header>
        
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
