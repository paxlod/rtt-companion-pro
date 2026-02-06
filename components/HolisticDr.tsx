
import React, { useState } from 'react';
import { Stethoscope, Send, Sparkles, Loader2, Leaf, ShieldAlert, BookOpen, Link as LinkIcon } from 'lucide-react';
import { consultHolisticDr } from '../services/geminiService';

const HolisticDr: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);

  const handleConsult = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      const data = await consultHolisticDr(query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
      {/* Consultation Input */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Holistic Consultation</h3>
            <p className="text-xs text-slate-500">Natural Medicine & Wellness Expert</p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <label className="text-sm font-semibold text-slate-700 block">
            Describe symptoms or wellness goals
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I have been experiencing chronic fatigue and brain fog for 3 months. I prefer herbal and nutritional interventions."
            className="w-full flex-1 min-h-[200px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-700"
          />
          
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-[10px] text-amber-800 leading-relaxed italic">
              Holistic Doctor AI uses Search Grounding to find peer-reviewed natural health information. It is not a replacement for a physical exam by a licensed physician.
            </p>
          </div>

          <button
            onClick={handleConsult}
            disabled={!query.trim() || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Leaf className="w-5 h-5" />}
            {loading ? 'Analyzing Clinical Data...' : 'Get Holistic Wellness Plan'}
          </button>
        </div>
      </section>

      {/* Wellness Plan Display */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Natural Prescription
          </h3>
          {result && <Sparkles className="w-5 h-5 text-yellow-500" />}
        </div>
        
        <div className="flex-1 bg-slate-50 rounded-xl p-6 overflow-y-auto border border-slate-100">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="animate-spin w-12 h-12 text-emerald-600" />
                <Leaf className="absolute inset-0 m-auto w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-slate-700">Consulting Research Databases...</p>
                <p className="text-xs text-slate-400 mt-1">Cross-referencing herbal medicine clinical trials</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="prose prose-emerald max-w-none text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {result.text}
              </div>
              
              {result.sources && result.sources.length > 0 && (
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Clinical References & Sources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={source.web?.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center gap-2 text-slate-600"
                      >
                        <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">
                          {idx + 1}
                        </span>
                        {source.web?.title || 'Research Source'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-12">
              <div className="bg-slate-100 p-8 rounded-full mb-6">
                <Leaf className="w-12 h-12 opacity-20" />
              </div>
              <h4 className="text-slate-600 font-semibold mb-2">Awaiting Consultation</h4>
              <p className="text-sm">Describe your physical or mental health goals to receive a grounded, natural health protocol based on functional medicine and current research.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HolisticDr;
