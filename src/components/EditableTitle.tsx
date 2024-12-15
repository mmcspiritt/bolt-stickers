import React, { useState, useRef, useEffect } from 'react';
import { useSticker } from '../context/StickerContext';

interface EditableTitleProps {
  className?: string;
}

export default function EditableTitle({ className = '' }: EditableTitleProps) {
  const { designName, setDesignName } = useSticker();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(designName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Keep local state in sync with context
  useEffect(() => {
    setEditedName(designName);
  }, [designName]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedName.trim() === '') {
      setEditedName(designName);
      return;
    }
    if (editedName !== designName) {
      setDesignName(editedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditedName(designName);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className={`${className} text-center`}
      onClick={handleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full max-w-[200px]"
          maxLength={50}
        />
      ) : (
        <h1 className="text-lg font-medium cursor-pointer hover:text-blue-600 transition-colors">
          {designName}
        </h1>
      )}
    </div>
  );
}
