// src/features/onboarding/components/CurrencyInput.jsx
import React from 'react';
import PropTypes from 'prop-types';

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED',
  SGD: 'S$',
};

export default function CurrencyInput({
  label,
  value,
  onChange,
  currency = 'INR',
  placeholder = '50,000',
  frequency = 'Monthly',
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
}) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency || '₹';

  // Format a raw numeric string with commas for display
  const formatDisplay = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const cleanStr = String(val).replace(/[^0-9.]/g, '');
    if (!cleanStr) return '';
    const parts = cleanStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';

    // Indian numbering format if INR, standard western thousands otherwise
    if (currency === 'INR') {
      const lastThree = integerPart.slice(-3);
      const otherNumbers = integerPart.slice(0, -3);
      const formatted = otherNumbers !== ''
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
      return formatted + decimalPart;
    }

    return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + decimalPart;
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
      onChange?.(raw);
    }
  };

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#E5E5E5] flex items-center tracking-wide">
            {label}
            {required && <span className="text-[#F07891] ml-1">*</span>}
          </label>
          {frequency && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#202020] text-[#D5C5FF] border border-[#2D2D2D]">
              {frequency}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-[#A3A3A3] text-sm font-medium select-none pointer-events-none">
          {symbol}
        </span>

        <input
          type="text"
          inputMode="decimal"
          value={formatDisplay(value)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C3ABFA] focus:ring-offset-2 focus:ring-offset-[#101010] ${
            disabled
              ? 'opacity-40 cursor-not-allowed bg-[#181818]/60 border-[#292929] text-[#737373]'
              : error
              ? 'border-[#F07891]/80 bg-[#181818] text-[#FAFAFA]'
              : 'border-[#292929] bg-[#181818] hover:border-[#3D3D3D] hover:bg-[#1E1E1E] text-[#FAFAFA] placeholder-[#555555]'
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px]">
        {error ? (
          <p className="text-[#F07891]">{error}</p>
        ) : helperText ? (
          <p className="text-[#737373]">{helperText}</p>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

CurrencyInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  currency: PropTypes.string,
  placeholder: PropTypes.string,
  frequency: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};
