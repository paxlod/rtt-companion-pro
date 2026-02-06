
import React, { useState } from 'react';
import { Mic, StopCircle, PlayCircle, Settings2, Music, Waves, Loader2, Volume2, Sparkles } from 'lucide-react';

const AudioLab: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const handleToggleRecord = () => {
    if (isRecording) {
      // Simulate stopping recording
      setIsRecording(false);
      setLoadingAudio(true);
      setTimeout(() => {
        setLoadingAudio(false);
        setHasRecording(true);
        console.log("Simulated recording stopped and saved.");
      }, 1500); // Simulate processing time
    } else {
      // Simulate starting recording
      setIsRecording(true);
      setHasRecording(false);
      console.log("Simulated recording started.");
    }
  };

  const handlePlayRecording = () => {
    if (hasRecording && !isPlaying) {
      setIsPlaying(true);
      // Simulate audio playback (e.g., using a simple alert for now)
      alert("Simulating playback of your latest recording. In a real app, this would play the audio.");
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000); // Simulate 3 seconds of playback
    }
  };

  return (
    <div className="space-y-8">
      {/* Voiceover Recording */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-indigo-500" />
          1. Record Voiceover
        </h3>
        <p className="text-sm text-slate-600 mb-4">Capture your own voice for personalized RTT scripts or affirmations.</p>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={handleToggleRecord}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'}`}
          >
            {isRecording ? <StopCircle className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
          <div className="text-center">
            <p className="text-lg font-medium text-slate-700">
              {isRecording ? "Recording..." : hasRecording ? "Recording Stopped" : "Ready to Record"}
            </p>
            {loadingAudio && <Loader2 className="animate-spin w-5 h-5 text-indigo-500 mt-2 mx-auto" />}
            {!loadingAudio && hasRecording && (
                <button 
                    onClick={handlePlayRecording}
                    disabled={isPlaying}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mx-auto text-sm font-medium"
                >
                    {isPlaying ? <Volume2 className="animate-pulse w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    {isPlaying ? "Playing..." : "Play Latest"}
                </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4">
          <button className="w-full text-left flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <Settings2 className="w-4 h-4" />
            Microphone Settings
          </button>
        </div>
      </section>

      {/* Audio Mixing & Production */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Waves className="w-5 h-5 text-purple-500" />
          2. Mix & Produce Audio
        </h3>
        <p className="text-sm text-slate-600 mb-4">Combine your voiceover with induction tracks and binaural beats.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center gap-3 hover:bg-purple-100 transition-colors">
            <Music className="w-5 h-5 text-purple-700" />
            <span className="font-medium text-purple-900">Add Induction Track</span>
          </button>
          <button className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 hover:bg-emerald-100 transition-colors">
            <Waves className="w-5 h-5 text-emerald-700" />
            <span className="font-medium text-emerald-900">Add Binaural Beats</span>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 disabled:opacity-50">
            <Sparkles className="w-5 h-5" />
            Generate Final Audio Track
          </button>
        </div>
      </section>
    </div>
  );
};

export default AudioLab;
