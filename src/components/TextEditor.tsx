import React from 'react';
import { HexColorPicker } from 'react-colorful';
import Select from 'react-select';

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
];

const fontSizes = Array.from({ length: 20 }, (_, i) => ({
  value: `${(i + 1) * 4}px`,
  label: `${(i + 1) * 4}px`,
}));

interface TextEditorProps {
  style: React.CSSProperties;
  onChange: (style: React.CSSProperties) => void;
}

export default function TextEditor({ style, onChange }: TextEditorProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Family
        </label>
        <Select
          options={fontFamilies}
          value={fontFamilies.find(f => f.value === style.fontFamily)}
          onChange={(option) => onChange({ ...style, fontFamily: option?.value })}
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size
        </label>
        <Select
          options={fontSizes}
          value={fontSizes.find(f => f.value === style.fontSize)}
          onChange={(option) => onChange({ ...style, fontSize: option?.value })}
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <HexColorPicker
          color={style.color as string}
          onChange={(color) => onChange({ ...style, color })}
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => onChange({
            ...style,
            fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold'
          })}
          className={`px-3 py-1 rounded ${
            style.fontWeight === 'bold'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          B
        </button>
        <button
          onClick={() => onChange({
            ...style,
            fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic'
          })}
          className={`px-3 py-1 rounded ${
            style.fontStyle === 'italic'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          I
        </button>
        <button
          onClick={() => onChange({
            ...style,
            textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline'
          })}
          className={`px-3 py-1 rounded ${
            style.textDecoration === 'underline'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          U
        </button>
      </div>
    </div>
  );
}