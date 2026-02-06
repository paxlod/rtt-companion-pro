
import React, { useState } from 'react';
import { Moon, Sun, Sparkles, Loader2, Heart, Eye, Brain, LayoutGrid, Info, Zap, ShieldCheck } from 'lucide-react';
import { generateHolisticReading } from '../services/geminiService';

const HolisticLab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tarot' | 'astrology' | 'chakra' | 'body-code'>('tarot');
  const [context, setContext] = useState('');
  const [reading, setReading] = useState<any>(null);

  const handleGenerate = async () => {
    if (!context && activeTab !== 'chakra' && activeTab !== 'body-code') return;
    setLoading(true);
    try {
      const result = await generateHolisticReading(activeTab, context || "General scanning for session readiness");
      setReading(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'tarot', label: 'Tarot Spread', icon: LayoutGrid, color: 'text-purple-600' },
    { id: 'astrology', label: 'Astrology Chart', icon: Sun, color: 'text-orange-500' },
    { id: 'chakra', label: 'Chakra Map', icon: Heart, color: 'text-red-500' },
    { id: 'body-code', label: 'Body Code', icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  const renderTarotLayout = (components: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {components.map((card: any, idx: number) => (
        <div key={idx} className="group relative bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
            {card.label}
          </div>
          <div className="pt-2 text-center border-b border-slate-50 pb-4 mb-4">
            <h5 className="text-xl font-serif font-bold text-indigo-900">{card.name}</h5>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed italic mb-4">
            {card.meaning}
          </p>
          {card.suggestion && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-indigo-400 block mb-1 uppercase">Subconscious Link</span>
              <p className="text-xs text-slate-500">{card.suggestion}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderGenericLayout = (components: any[]) => (
    <div className="grid gap-4 mt-4">
      {components.map((item: any, idx: number) => (
        <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600">
            {idx + 1}
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-md flex items-center gap-2">
              {item.name} <span className="text-[10px] text-slate-400 font-normal border px-1.5 rounded uppercase">{item.label}</span>
            </h5>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.meaning}</p>
            {item.suggestion && (
              <p className="text-xs text-indigo-600 font-medium mt-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> {item.suggestion}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Holistic Modality
          </h3>
          
          <div className="space-y-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setReading(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${tab.color}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 block">
              {activeTab === 'tarot' ? 'Query or Client Focus' : activeTab === 'astrology' ? 'Birth Details / Specific transit' : activeTab === 'body-code' ? 'Physical Symptom or Emotion' : 'Current Emotional State'}
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={
                activeTab === 'tarot' ? "e.g. Guidance on financial abundance blocks..." : 
                activeTab === 'astrology' ? "e.g. How will the upcoming solar eclipse affect my self-worth?" :
                activeTab === 'body-code' ? "e.g. Chronic shoulder pain and feeling 'stuck' in career..." :
                "e.g. I feel a heavy weight in my chest when thinking about the future..."
              }
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Eye className="w-5 h-5" />}
              Identify Higher Truths
            </button>
          </div>
        </section>

        <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-6 rounded-2xl text-white shadow-xl">
          <h4 className="font-bold flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4" /> RTT Alchemy
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">
            Integrating {activeTab} insights allows you to bypass conscious resistance. Use the summary below to craft a specific "Command Cell Therapy" instruction.
          </p>
        </section>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full min-h-[600px] flex flex-col">
          {reading ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-800 font-serif">{reading.title}</h2>
                <div className="text-xs font-bold text-indigo-500 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-widest bg-indigo-50">
                  {reading.type || activeTab}
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8 relative">
                <Sparkles className="absolute top-4 right-4 text-indigo-200 w-8 h-8" />
                <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-3">Holistic Synthesis</h4>
                <p className="text-slate-700 leading-relaxed italic text-lg font-serif">
                  "{reading.summary}"
                </p>
              </div>

              {reading.type === 'tarot' || activeTab === 'tarot' 
                ? renderTarotLayout(reading.components || [])
                : renderGenericLayout(reading.components || [])
              }

              <div className="mt-12 flex items-center justify-between pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">Insights powered by Gemini 3 Flash & RTT Logic</p>
                <button 
                  onClick={() => window.print()}
                  className="text-indigo-600 text-xs font-bold hover:underline"
                >
                  Export to Client File
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center px-12">
              <div className="bg-slate-50 p-10 rounded-full mb-6 border border-slate-100 relative group transition-all hover:scale-105">
                <div className="absolute inset-0 bg-indigo-400 opacity-0 group-hover:opacity-5 blur-2xl rounded-full transition-opacity" />
                <Moon className="w-20 h-20 opacity-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-600 mb-3 font-serif">Awaken the Subconscious</h3>
              <p className="text-sm max-w-sm text-slate-500">
                Select a spiritual or energetic lens to view your client's challenges. These insights provide a roadmap for the 21-day transformation script.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolisticLab;
