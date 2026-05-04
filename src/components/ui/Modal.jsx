// src/components/ui/Modal.jsx
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, icon: Icon, onClose, onSubmit, formId, submitText = 'Salvar', children, wide }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className={`bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] ${
      wide ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          {Icon && <div className="bg-green-100 p-2.5 rounded-xl"><Icon size={22} className="text-green-600" /></div>}
          <h2 className="text-xl font-black text-gray-900">{title}</h2>
        </div>
        <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <form id={formId} onSubmit={onSubmit} className="overflow-y-auto p-6 flex-1">
        <div className="space-y-4">{children}</div>
      </form>
      <div className="p-4 border-t bg-gray-50 rounded-b-3xl flex gap-3 justify-end shrink-0">
        <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-2xl">Cancelar</button>
        <button type="submit" form={formId} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg">{submitText}</button>
      </div>
    </div>
  </div>
);

export default Modal;
