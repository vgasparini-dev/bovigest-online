// src/components/ui/Input.jsx
import React from 'react';

const Input = React.memo(({ label, name, type = 'text', req = false, def = '', error, ...props }) => (
  <div className="mb-1">
    {label && (
      <label className="block text-sm font-bold text-gray-700 mb-1.5">
        {label} {req && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      name={name}
      required={req}
      defaultValue={def}
      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
      }`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
