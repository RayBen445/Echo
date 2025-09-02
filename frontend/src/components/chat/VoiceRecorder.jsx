import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Play, Pause } from 'lucide-react';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

const VoiceRecorder = ({ onSendVoiceNote, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setDuration(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const sendVoiceNote = async () => {
    if (!audioBlob || uploading) return;

    setUploading(true);
    setError('');

    try {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `voice_notes/${timestamp}.webm`;
      
      // Upload to Firebase Storage
      const voiceRef = storageRef(storage, filename);
      await uploadBytes(voiceRef, audioBlob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(voiceRef);
      
      // Send voice note
      onSendVoiceNote({
        type: 'voice',
        url: downloadURL,
        duration: duration,
        filename: filename
      });

      // Reset state
      deleteRecording();
      
    } catch (error) {
      console.error('Error uploading voice note:', error);
      setError('Failed to send voice note. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  // If we have a recorded audio, show playback controls
  if (audioBlob) {
    return (
      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        
        <button
          onClick={playPause}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          disabled={uploading}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            Voice Note • {formatTime(duration)}
          </div>
          <div className="text-xs text-gray-500">
            Tap play to preview
          </div>
        </div>

        <button
          onClick={deleteRecording}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 transition-colors"
          disabled={uploading}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={sendVoiceNote}
          disabled={uploading}
          className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }

  // Recording interface
  if (isRecording) {
    return (
      <div className="flex items-center space-x-3 bg-red-50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-700 font-medium">Recording</span>
        </div>
        
        <div className="flex-1 text-center">
          <span className="text-lg font-mono text-gray-900">
            {formatTime(duration)}
          </span>
        </div>

        <button
          onClick={stopRecording}
          className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
        >
          <MicOff className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Start recording button
  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Record voice message"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
};

export default VoiceRecorder;