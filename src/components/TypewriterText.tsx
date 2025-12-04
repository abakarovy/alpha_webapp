import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  onComplete?: () => void;
  isStopped?: boolean;
}

export function useTypewriter({ 
  text, 
  speed = 30, 
  onComplete,
  isStopped = false 
}: UseTypewriterOptions): string {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStoppedRef = useRef(isStopped);

  useEffect(() => {
    isStoppedRef.current = isStopped;
    if (isStopped && currentIndex < text.length) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
    }
  }, [isStopped, text, currentIndex]);

  useEffect(() => {
    if (isStoppedRef.current) {
      return;
    }

    if (currentIndex < text.length) {
      timeoutRef.current = setTimeout(() => {
        if (!isStoppedRef.current) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }
      }, speed);
    } else {
      if (onComplete && currentIndex === text.length && displayedText === text) {
        onComplete();
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, text, speed, onComplete, displayedText]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return displayedText;
}

