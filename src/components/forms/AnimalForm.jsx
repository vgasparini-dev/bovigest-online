// src/components/forms/AnimalForm.jsx
import React from 'react';
import Input from '../ui/Input';

const AnimalForm = React.memo(({ editingItem, lotes, today }) => {
  const arr = (v) => Array.isArray(v) ? v : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Input label="Brinco" name="brinco" req def={editingItem?.brinco} />
      <Input label="Nome (Opcional)" name="nome" def={editingItem?.nome !== '-' ? editingItem?.nome : ''} />
      <Input label="Peso Atual (kg)" name="peso" type="number" req def={editingItem?.peso} />
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Lote Destino</label>
        <select name="lote" defaultValue={editingItem?.lote || ''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium">
          <option value="">Sem Lote</option>
          {arr(lotes).map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo</label>
        <select name="tipo" defaultValue={editingItem?.tipo || 'Corte'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium">
          <option>Corte</option><option>Leite</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Sexo <span className="text-red-500">*</span></label>
        <select name="sexo" required defaultValue={editingItem?.sexo || 'F'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium">
          <option value="F">Fêmea</option><option value="M">Macho</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Categoria</label>
        <select name="categoria" defaultValue={editingItem?.categoria || 'Bezerro(a)'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium">
          {['Bezerro(a)', 'Novilha', 'Garrote', 'Vaca', 'Boi Gordo', 'Touro'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <Input label="Raça" name="raca" req def={editingItem?.raca || 'Nelore'} />
      <div className="sm:col-span-2">
        <Input label="Data Nasc." name="dataNasc" type="date" req def={editingItem?.dataNasc || today} />
      </div>
    </div>
  );
});

AnimalForm.displayName = 'AnimalForm';
export default AnimalForm;
