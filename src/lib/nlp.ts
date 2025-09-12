"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Play, Square, AlertTriangle, Settings, TestTube2 } from 'lucide-react';
import { detectDistress, locales, type Locale } from "@/lib/nlp-intent";

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, audioLevel }) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-primary rounded-full transition-all duration-150 ${
            isRecording 
              ? `h-${Math.min(8, Math.max(2, Math.floor(audioLevel * 8) + i))} animate-pulse`
              : 'h-2 opacity-30'
          }`}
          style={{
            height: isRecording 
              ? `${Math.min(32, Math.max(8, audioLevel * 32 + i * 4))}px`
              : '8px'
          }}
        />
      ))}
    </div>
  );
};

export const VoiceAnalysisDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en');
  const [testInput, setTestInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<'distress' | null>(null);
  const [recentTests, setRecentTests] = useState<Array<{
    input: string;
    locale: Locale;
    result: 'distress' | null;
    timestamp: Date;
  }>>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const localeLabels: Record<Locale, string> = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    te: 'తెలుగు (Telugu)'
  };

  const samplePhrases: Record<Locale, string[]> = {
    en: ['help me', 'call police', 'i am scared', 'emergency'],
    hi: ['बचाओ', 'मदद करो', 'पुलिस बुलाओ', 'डर लग रहा है'],
    te: ['సహాయం', 'పోలీస్', 'భయం గా ఉంది', 'రక్షించండి']
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateAudioLevel = () => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        // In a real implementation, this would process the audio data
        // For demo purposes, we'll simulate analysis
        console.log('Audio data received:', event.data);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsRecording(false);
    setAudioLevel(0);
  };

  const testPhrase = (phrase: string) => {
    setTestInput(phrase);
    const result = detectDistress(phrase, selectedLocale);
    setAnalysisResult(result);
    
    // Add to recent tests
    setRecentTests(prev => [{
      input: phrase,
      locale: selectedLocale,
      result,
      timestamp: new Date()
    }, ...prev.slice(0, 4)]);
  };

  const playTestAudio = () => {
    // Simulate audio playback
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Voice Analysis Demo
        </h1>
        <p className="text-muted-foreground">
          Test the multilingual distress detection system
        </p>
      </div>

      {/* Language Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">Language Settings</h3>
              <p className="text-sm text-muted-foreground">
                Select the language for voice analysis
              </p>
            </div>
            <Select value={selectedLocale} onValueChange={(value: Locale) => setSelectedLocale(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales().map(locale => (
                  <SelectItem key={locale} value={locale}>
                    {localeLabels[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Voice Recording */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Voice Recording</h3>
            <p className="text-muted-foreground">
              {isRecording 
                ? "Recording... Speak naturally to test distress detection"
                : "Tap the microphone to start recording"
              }
            </p>
            
            <AudioVisualizer isRecording={isRecording} audioLevel={audioLevel} />
            
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="rounded-full h-16 w-16"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-16 w-16"
                onClick={playTestAudio}
                disabled={isPlayingAudio}
              >
                {isPlayingAudio ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
            </div>
            
            {isRecording && (
              <div className="text-sm text-muted-foreground">
                <Settings className="h-4 w-4 inline mr-1" />
                Analyzing audio in real-time...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Text Testing */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TestTube2 className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Text Analysis Testing</h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Test phrases in {localeLabels[selectedLocale]}:
            </p>
            <div className="flex flex-wrap gap-2">
              {samplePhrases[selectedLocale].map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => testPhrase(phrase)}
                  className="text-xs"
                >
                  "{phrase}"
                </Button>
              ))}
            </div>
          </div>

          {analysisResult && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Distress Detected</p>
                  <p className="text-sm text-muted-foreground">
                    Input: "{testInput}" → Result: {analysisResult}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tests */}
      {recentTests.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Analysis Results</h3>
            <div className="space-y-3">
              {recentTests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">"{test.input}"</p>
                    <p className="text-xs text-muted-foreground">
                      {localeLabels[test.locale]} • {test.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge 
                    variant={test.result === 'distress' ? 'destructive' : 'secondary'}
                    className="ml-2"
                  >
                    {test.result === 'distress' ? 'Distress' : 'Normal'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Info */}
      <Card>
        <CardContent className="p-4">
          <details className="space-y-2">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Technical Implementation Details
            </summary>
            <div className="text-xs text-muted-foreground space-y-2 mt-2">
              <p>
                • <strong>Multilingual Support:</strong> English, Hindi (हिंदी), Telugu (తెలుగు)
              </p>
              <p>
                • <strong>Detection Method:</strong> Lexicon-based pattern matching with normalization
              </p>
              <p>
                • <strong>Offline Capability:</strong> Runs entirely in browser, no server calls
              </p>
              <p>
                • <strong>Performance:</strong> Lightweight, fast response (&lt;1ms typical)
              </p>
              <p>
                • <strong>Fallback:</strong> Cross-language detection for maximum coverage
              </p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};