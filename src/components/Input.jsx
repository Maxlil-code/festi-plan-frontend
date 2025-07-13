import React from 'react';

const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const inputClasses = `w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
  } ${className}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
