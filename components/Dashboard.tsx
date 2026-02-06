
import React from 'react';
import { Users, FileAudio, Clock, TrendingUp, Zap, Moon, Stethoscope } from 'lucide-react';
import { View } from '../types';

interface DashboardProps {
  onViewChange?: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const stats = [
    { label: 'Active Clients', value: '12', icon: Users, color: 'bg-blue-500' },
    { label: 'Audio Tracks', value: '45', icon: FileAudio, color: 'bg-purple-500' },
    { label: 'Sessions This Week', value: '8', icon: Clock, color: 'bg-emerald-500' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const recentClients = [
    { name: 'Sarah Miller', issue: 'Abundance Blocks', date: '2 hours ago' },
    { name: 'John Doe', issue: 'Public Speaking Anxiety', date: 'Yesterday' },
    { name: 'Emma Wilson', issue: 'Weight Management', date: '2 days ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Recent Clients</h3>
            <button className="text-indigo-600 text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {recentClients.map((client, idx) => (
              <div key={idx} className={`p-4 flex items-center justify-between ${idx !== recentClients.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{client.name}</h4>
                    <p className="text-xs text-slate-500">{client.issue}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{client.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tools */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Quick Tools</h3>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => onViewChange?.('holistic-dr')}
              className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-left hover:bg-emerald-100 transition-colors"
            >
              <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Holistic Doctor
              </h4>
              <p className="text-xs text-emerald-700 mt-1">Natural prescriptions & wellness plans</p>
            </button>
            <button 
              onClick={() => onViewChange?.('holistic-lab')}
              className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-left hover:bg-indigo-100 transition-colors"
            >
              <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                <Moon className="w-4 h-4" /> Holistic Lab
              </h4>
              <p className="text-xs text-indigo-700 mt-1">Tarot, Astrology & Chakra analysis</p>
            </button>
            <button 
              onClick={() => onViewChange?.('scripts')}
              className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-left hover:bg-purple-100 transition-colors"
            >
              <h4 className="font-bold text-purple-900">Script Generator</h4>
              <p className="text-xs text-purple-700 mt-1">Generate a 21-day transformation</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
