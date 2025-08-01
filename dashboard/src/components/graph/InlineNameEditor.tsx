import React, { useState, useRef, useEffect } from 'react';

interface InlineNameEditorProps {
  isVisible: boolean;
  initialValue: string;
  onSave: (name: string) => void;
  onCancel: () => void;
  position: { x: number; y: number };
}

export const InlineNameEditor: React.FC<InlineNameEditorProps> = ({
  isVisible,
  initialValue,
  onSave,
  onCancel,
  position
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-lg border border-slate-600"
      style={{
        left: Math.max(10, Math.min(position.x - 60, window.innerWidth - 140)),
        top: Math.max(10, Math.min(position.y, window.innerHeight - 40)),
        minWidth: '120px',
        maxWidth: '200px'
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Nombre del artefacto..."
        className="bg-transparent text-white text-sm font-medium outline-none w-full px-1 placeholder-slate-400"
      />
    </div>
  );
};