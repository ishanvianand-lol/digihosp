import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2, Wand2, Sparkles } from 'lucide-react';

interface VoiceSymptomInputProps {
  onSymptomDetected: (text: string) => void;
}

export function VoiceSymptomInput({ onSymptomDetected }: VoiceSymptomInputProps) {
  const [isListening, setIsListening] = useState(false);
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (isListening) {
      const timeout = setTimeout(() => {
        stopListening();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isListening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="card-medical">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 text-center rounded-2xl">
          <Mic className="h-16 w-16 text-red-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-red-700">
            Browser doesn't support speech recognition
          </p>
          <p className="text-xs text-red-600 mt-1">
            Please use Chrome or Edge
          </p>
        </div>
      </div>
    );
  }

  const startListening = () => {
    setIsListening(true);
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: 'hi-IN',
    });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    if (transcript) {
      onSymptomDetected(transcript);
    }
  };

  return (
    <div className="card-medical overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <h3 className="font-semibold">Voice Symptom Input</h3>
          <Sparkles className="ml-auto h-4 w-4 animate-pulse" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Transcript Display */}
        <div className={`relative rounded-2xl min-h-[120px] p-4 transition-all duration-300 ${
          isListening 
            ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 shadow-lg shadow-cyan-100' 
            : 'bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200'
        }`}>
          {isListening && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 shadow-lg">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-white">RECORDING</span>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            {isListening && (
              <div className="flex gap-1 mt-1">
                <div className="w-1 h-8 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-12 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-10 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            
            <p className={`text-sm leading-relaxed flex-1 ${transcript ? 'text-gray-800 font-medium' : 'text-gray-400 italic'}`}>
              {transcript || 'Click microphone and speak your symptoms in Hindi or English...'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isListening ? (
            <Button
              onClick={startListening}
              className="flex-1 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Mic className="h-5 w-5 mr-2" />
              <span className="font-semibold">Start Speaking</span>
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              className="flex-1 h-14 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <MicOff className="h-5 w-5 mr-2" />
              <span className="font-semibold">Stop & Analyze</span>
            </Button>
          )}

          <Button 
            onClick={resetTranscript} 
            variant="outline"
            className="h-14 px-6 border-2 hover:bg-gray-50"
          >
            Clear
          </Button>
        </div>

        {/* Tip Box */}
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <Wand2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Pro Tip</p>
              <p className="text-xs text-blue-700">
                Speak clearly. Try: <span className="font-semibold">"Mujhe sar mein dard hai"</span> or <span className="font-semibold">"I have fever and cough"</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}