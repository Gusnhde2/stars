'use client';

import { useCallback } from 'react';
import type { Observer } from '@/types/observer';

interface DateTimeInputProps {
  observer: Observer;
  onObserverChange: (observer: Observer) => void;
}

export function DateTimeInput({ observer, onObserverChange }: DateTimeInputProps) {
  // Format date for datetime-local input (local time)
  const formatForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  const handleDateTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onObserverChange({ ...observer, date: newDate });
    }
  }, [observer, onObserverChange]);
  
  const handleSetNow = useCallback(() => {
    onObserverChange({ ...observer, date: new Date() });
  }, [observer, onObserverChange]);
  
  const handleTimeShift = useCallback((hours: number) => {
    const newDate = new Date(observer.date);
    newDate.setHours(newDate.getHours() + hours);
    onObserverChange({ ...observer, date: newDate });
  }, [observer, onObserverChange]);
  
  const handleDayShift = useCallback((days: number) => {
    const newDate = new Date(observer.date);
    newDate.setDate(newDate.getDate() + days);
    onObserverChange({ ...observer, date: newDate });
  }, [observer, onObserverChange]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Date & Time</h3>
        <button
          onClick={handleSetNow}
          className="text-xs px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          Now
        </button>
      </div>
      
      <div>
        <input
          type="datetime-local"
          value={formatForInput(observer.date)}
          onChange={handleDateTimeChange}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:border-amber-500/50"
        />
        <p className="text-xs text-neutral-600 mt-1">
          UTC: {observer.date.toISOString().slice(0, 19).replace('T', ' ')}
        </p>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-neutral-500 mb-1">Time</label>
          <div className="flex gap-1">
            <button
              onClick={() => handleTimeShift(-1)}
              className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 text-xs"
            >
              -1h
            </button>
            <button
              onClick={() => handleTimeShift(1)}
              className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 text-xs"
            >
              +1h
            </button>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-neutral-500 mb-1">Day</label>
          <div className="flex gap-1">
            <button
              onClick={() => handleDayShift(-1)}
              className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 text-xs"
            >
              -1d
            </button>
            <button
              onClick={() => handleDayShift(1)}
              className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 text-xs"
            >
              +1d
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

