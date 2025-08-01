import React, { useState, useRef, useEffect } from 'react';
import { Artifact } from '../../types/Artifact';

interface FloatingTextAreaProps {
  artifact: Artifact;
  isVisible: boolean;
  position: { x: number; y: number };
  onSave: (description: string) => void;
  onCancel: () => void;
  initialText?: string;
}

export const FloatingTextArea: React.FC<FloatingTextAreaProps> = ({
  artifact,
  isVisible,
  position,
  onSave,
  onCancel,
  initialText = ''
}) => {
  const [text, setText] = useState(initialText);
  const [isReformulating, setIsReformulating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isVisible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const handleSave = () => {
    onSave(text);
    setText('');
  };

  const handleReformulate = async () => {
    setIsReformulating(true);
    // Simulate AI reformulation
    setTimeout(() => {
      setText(text + ' [Reformulado con IA]');
      setIsReformulating(false);
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-slate-600"
      style={{
        left: Math.max(10, Math.min(position.x - 140, window.innerWidth - 320)),
        top: Math.max(10, Math.min(position.y, window.innerHeight - 200)),
        minWidth: '280px',
        maxWidth: '90vw',
        width: 'min(400px, 90vw)'
      }}
    >
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-blue-400 mb-1">{artifact.name}</h4>
        <p className="text-xs text-slate-400">{artifact.type}</p>
      </div>
      
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe este artefacto... Usa @ para referenciar otros artefactos"
        className="w-full h-24 px-3 py-2 bg-slate-700/50 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none resize-none text-sm"
      />
      
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={handleReformulate}
          disabled={isReformulating}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
        >
          <svg
            className={`w-4 h-4 ${isReformulating ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">Reformular con IA</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};