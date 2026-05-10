import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecipeTimer({ timeString, label }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Audio for alarm
  const audioRef = useRef(null);

  useEffect(() => {
    // Create an audio element for the alarm
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    let totalSeconds = 0;
    if (timeString) {
      // Attempt to parse various formats: "15 mins", "1.5 hours", "1h 30m"
      const timeStr = timeString.toLowerCase();
      
      const hoursMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour)/);
      const minsMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*(?:m|min)/);
      
      if (hoursMatch) totalSeconds += parseFloat(hoursMatch[1]) * 3600;
      if (minsMatch) totalSeconds += parseFloat(minsMatch[1]) * 60;
      
      // Fallback if it's just a number assuming minutes
      if (totalSeconds === 0) {
        const justNumber = timeStr.match(/^(\d+)$/);
        if (justNumber) totalSeconds += parseInt(justNumber[1]) * 60;
      }
    }
    
    setInitialTime(totalSeconds);
    setTimeLeft(totalSeconds);
    setIsActive(false);
    setIsFinished(false);
  }, [timeString]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play prevented by browser', e));
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  if (initialTime === 0) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-lg w-64 text-center">
        <p className="text-sm text-gray-500">Could not parse time from "{timeString}"</p>
      </div>
    );
  }

  const toggleTimer = () => {
    if (isFinished) {
      stopAlarmAndReset();
    } else {
      setIsActive(!isActive);
    }
  };
  
  const stopAlarmAndReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsFinished(false);
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const resetTimer = () => {
    stopAlarmAndReset();
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - Math.max(0, timeLeft)) / initialTime) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-xl w-64 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">{label}</span>
        {isFinished && <BellRing className="w-4 h-4 text-amber-500 animate-bounce" />}
      </div>
      
      <div className="flex justify-center my-2">
        <span className={`font-mono font-bold text-4xl tabular-nums tracking-tight ${isFinished ? 'text-amber-500' : 'text-gray-800'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${isFinished ? 'bg-amber-500' : 'bg-[#6b9b76]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2 mt-2">
        {isFinished ? (
          <Button 
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10"
            onClick={stopAlarmAndReset}
          >
            <BellRing className="w-4 h-4 mr-2" /> Stop Alarm
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              className={`flex-1 rounded-xl h-10 border-gray-200 hover:bg-gray-50 ${isActive ? 'text-amber-600 hover:text-amber-700' : 'text-[#6b9b76] hover:text-[#5a8a65]'}`}
              onClick={toggleTimer}
            >
              {isActive ? <Pause className="w-4 h-4 fill-current mr-1.5" /> : <Play className="w-4 h-4 fill-current mr-1.5" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="w-10 h-10 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-500 shrink-0"
              onClick={resetTimer}
              disabled={timeLeft === initialTime && !isActive}
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}