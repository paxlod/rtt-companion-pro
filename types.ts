
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  lastSession?: string;
}

export interface Script {
  id: string;
  clientId: string;
  title: string;
  content: string;
  reframes: string[];
  createdAt: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
  duration: string;
  type: 'induction' | 'transformation' | 'command-cell';
}

export type View = 'dashboard' | 'clients' | 'scripts' | 'audio-lab' | 'ai-therapist' | 'practice-management' | 'holistic-lab' | 'ai-chat' | 'video-lab' | 'holistic-dr';
