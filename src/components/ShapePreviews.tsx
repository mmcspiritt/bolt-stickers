import React from 'react';

const Square = () => (
  <div className="w-12 h-12 bg-transparent border-2 border-slate-600 rounded-md" />
);

const Circle = () => (
  <div className="w-12 h-12 bg-transparent border-2 border-slate-600 rounded-full" />
);

const Triangle = () => (
  <div className="w-12 h-12 relative">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50 10 L90 90 L10 90 Z"
        fill="transparent"
        stroke="rgb(71, 85, 105)"
        strokeWidth="2"
      />
    </svg>
  </div>
);

const Hexagon = () => (
  <div className="w-12 h-12 relative">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M25 10 L75 10 L100 50 L75 90 L25 90 L0 50 Z"
        fill="transparent"
        stroke="rgb(71, 85, 105)"
        strokeWidth="2"
      />
    </svg>
  </div>
);

export const ShapePreviews = {
  square: Square,
  circle: Circle,
  triangle: Triangle,
  hexagon: Hexagon,
}; 