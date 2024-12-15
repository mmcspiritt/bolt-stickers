import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import toast from 'react-hot-toast';

interface NumberInputProps {
  label?: string;
  value: number | string;
  onChange: (value: number) => void;
  onBlur?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export default function NumberInput({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  helpText,
}: NumberInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(value.toString());

  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Allow any input value

    // Only call onChange if the value is a valid number
    const numValue = Number(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let finalValue = Number(e.target.value);

    // Handle empty, invalid, or too small input
    if (e.target.value === '' || isNaN(finalValue) || finalValue < 1) {
      finalValue = 1;  // Enforce minimum of 1
      setInputValue('1');
      toast.error('Minimum size is 1 inch');
    }

    // Apply constraints
    if (typeof min === 'number' && finalValue < min) {
      finalValue = min;
      toast.error(`Minimum value is ${min}`);
    }
    if (typeof max === 'number' && finalValue > max) {
      finalValue = max;
      toast.error(`Maximum value is ${max}`);
    }

    // Round to nearest step
    if (step) {
      finalValue = Math.round(finalValue / step) * step;
    }

    setInputValue(finalValue.toString());
    
    if (onBlur) {
      onBlur(finalValue);
    } else {
      onChange(finalValue);
    }
  };

  return (
    <div>
      {label && (
        <Label className="text-xs text-muted-foreground">{label}</Label>
      )}
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="mt-1"
      />
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
      )}
    </div>
  );
}