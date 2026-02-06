
import React, { useState, useRef } from 'react';
import { Wand2, Save, FileText, Sparkles, Loader2, Volume2, User, Mail, Activity, CheckCircle2 } from 'lucide-react';
import { generateReframes, generateFullScript, textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioHelpers'; // Import from utils

const ScriptLab: React.FC = () => {
  const [limitingBeliefs, setLimitingBeliefs] = useState('');
  const [reframes, setReframes] = useState<string[]>([]);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issue, setIssue] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleReframe = async () => {
    if (!limitingBeliefs) return;
    setLoading(true);
    try {
      const result = await generateReframes(limitingBeliefs);
      setReframes(result.reframes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!clientName || !issue || reframes.length === 0) return;
    setLoading(true);
    setIsSaved(false);
    try {
      const result = await generateFullScript(clientName, issue, reframes);
      setScript(result || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTTS = async (text: string) => {
    if (!text || isPlaying) return;
    setIsPlaying(true);
    try {
      const base64 = await textToSpeech(text);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const handleSaveSession = () => {
    if (!script) return;
    // Simulate saving
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSaved(true);
      console.log('Saved RTT Session:', {
        client: clientName,
        email: clientEmail,
        issue,
        scriptLength: script.length
      });
      setTimeout(() => setIsSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
      {/* Left: Input & Reframes */}
      <div className="space-y-6 overflow-y-auto pr-4 pb-12">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            1. Uncover Limiting Beliefs
          </h3>
          <textarea
            value={limitingBeliefs}
            onChange={(e) => setLimitingBeliefs(e.target.value)}
            placeholder="What limiting beliefs came up during regression? (e.g., 'I am not worthy of success because my father left when I was 5')"
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none text-slate-700"
          />
          <button
            onClick={handleReframe}
            disabled={loading || !limitingBeliefs}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            Generate Reframes
          </button>
        </section>

        {reframes.length > 0 && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Empowering Reframes</h3>
            <div className="space-y-3">
              {reframes.map((reframe, idx) => (
                <div key={idx} className="group p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative">
                  <p className="text-indigo-900 font-medium italic pr-12">"{reframe}"</p>
                  <button 
                    onClick={() => handlePlayTTS(reframe)}
                    disabled={isPlaying}
                    title="Listen to reframe"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-md font-semibold text-slate-700 mb-2">Client Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="relative md:col-span-2">
                  <Activity className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Main Therapeutic Issue (e.g. Chronic Procrastination)"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateScript}
                disabled={loading || !clientName || !issue}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-purple-100"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
                Generate Full Transformation Script
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Right: Script Editor */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Transformation Script</h3>
          <div className="flex gap-2">
             <button 
              onClick={handleSaveSession}
              disabled={!script || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSaved 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } disabled:opacity-50 disabled:bg-slate-200`}
            >
              {isSaved ? (
                <><CheckCircle2 className="w-4 h-4" /> Saved to File</>
              ) : (
                <><Save className="w-4 h-4" /> Save Session</>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-50 rounded-xl p-6 overflow-y-auto border border-slate-100">
          {loading && !script ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
              <div className="text-center">
                <p className="font-medium text-slate-600">Gemini is thinking deeply...</p>
                <p className="text-xs mt-1">Applying RTT psychological frameworks</p>
              </div>
            </div>
          ) : script ? (
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-lg selection:bg-indigo-100 selection:text-indigo-900">
              {script}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-12">
              <div className="bg-slate-100 p-6 rounded-full mb-6">
                <FileText className="w-12 h-12 opacity-20" />
              </div>
              <h4 className="text-slate-600 font-semibold mb-2 text-lg">Script Laboratory</h4>
              <p className="text-sm">Identify root cause beliefs on the left to generate a personalized 21-day transformation script using advanced psychological reframing.</p>
            </div>
          )}
        </div>

        {script && !loading && (
          <div className="absolute bottom-12 right-12">
            <button 
              onClick={() => handlePlayTTS(script.substring(0, 1000))} // Sample the start
              disabled={isPlaying}
              className="bg-white border border-slate-200 p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all text-indigo-600"
              title="Preview with RTT Voice"
            >
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptLab;
