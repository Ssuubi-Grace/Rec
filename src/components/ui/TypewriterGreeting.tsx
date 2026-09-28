import React, { useEffect, useState } from 'react';

interface TypewriterGreetingProps {
  text: string;
  speedMs?: number;
  className?: string;
}

export const TypewriterGreeting: React.FC<TypewriterGreetingProps> = ({
  text,
  speedMs = 350,
  className = '',
}) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
  }, [text]);

  useEffect(() => {
    if (visibleCount >= text.length) return undefined;
    const timer = window.setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [visibleCount, text.length, speedMs]);

  const isComplete = visibleCount >= text.length;

  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={
            index < visibleCount
              ? 'typewriter-char typewriter-char-in'
              : 'typewriter-char typewriter-char-hidden'
          }
          style={{ animationDelay: '0ms' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
      {!isComplete && <span className="typewriter-cursor" aria-hidden="true" />}
    </span>
  );
};
