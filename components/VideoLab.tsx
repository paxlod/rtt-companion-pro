
import React, { useState, useRef } from 'react';
import { Video, Upload, FileSearch, Loader2, Sparkles, Brain, ClipboardCheck } from 'lucide-react';
import { analyzeVideoSession } from '../services/geminiService';

const VideoLab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis('');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const result = await analyzeVideoSession(
        base64, 
        selectedFile.type,
        "Analyze this therapeutic session. Identify key emotional shifts, body language cues, and potential root cause indicators. Provide a summary of the client's progress."
      );
      setAnalysis(result || '');
    } catch (error) {
      console.error(error);
      setAnalysis('Failed to analyze video. Ensure it is a valid format and size.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-14rem)]">
      <div className="space-y-6 flex flex-col h-full">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" />
            Session Recording
          </h3>
          
          <div className="flex-1 flex flex-col">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                selectedFile ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="video/*"
              />
              
              {previewUrl ? (
                <video src={previewUrl} controls className="w-full h-full max-h-[400px] object-contain rounded-xl" />
              ) : (
                <div className="text-center p-8">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4 inline-block">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1">Upload Session Video</h4>
                  <p className="text-xs text-slate-400">MP4, MOV or WebM supported</p>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileSearch className="w-5 h-5" />}
              {loading ? 'Analyzing Session Deeply...' : 'Generate Expert Analysis'}
            </button>
          </div>
        </section>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-purple-600" />
            AI Session Insights
          </h3>
          {analysis && <Sparkles className="w-5 h-5 text-yellow-500" />}
        </div>
        
        <div className="flex-1 bg-slate-50 rounded-xl p-6 overflow-y-auto border border-slate-100">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
                <Brain className="absolute inset-0 m-auto w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-slate-700">Gemini 3 Pro Processing...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Scanning facial micro-expressions and linguistic patterns</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="prose prose-slate max-w-none text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-12">
              <div className="bg-slate-100 p-6 rounded-full mb-4">
                <Brain className="w-10 h-10 opacity-20" />
              </div>
              <h4 className="text-slate-600 font-semibold mb-2">Awaiting Session Analysis</h4>
              <p className="text-xs">Upload a recording to get a high-level summary of root causes, emotional triggers, and therapeutic progress.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
