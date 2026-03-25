// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Tractor, Beef, Activity, LogOut, Bell, Search, Plus, MapPin, DollarSign,
  HeartPulse, LayoutGrid, X, Trash2, Edit, Baby, LayoutDashboard, Scale,
  Settings, Sparkles, Bot, Send, Loader2, CheckCircle2, Download, Archive,
  Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert, Wheat,
  Calculator, FileText, Syringe, CalendarCheck, Users, ChevronRight, ArrowRightLeft
} from 'lucide-react';

const defaultData = {
  selectedPropId: 1,
  propriedades: [
    { id: 1, nome: 'Fazenda São João', responsavel: 'Administrador', cidade: 'Jaru', estado: 'RO', area_ha: 350, ie: '123.456.789' },
    { id: 2, nome: 'Estância Vitória', responsavel: 'Vinícius', cidade: 'Ariquemes', estado: 'RO', area_ha: 120, ie: '987.654.321' }
  ],
  animais: [
    { id: 1, propId: 1, brinco: 'NEL-001', raca: 'Nelore', peso: 450, lote: 'Engorda A', categoria: 'Boi Gordo', status: 'Saudável' },
    { id: 2, propId: 1, brinco: 'NEL-002', raca: 'Nelore', peso: 420, lote: 'Engorda A', categoria: 'Boi Gordo', status: 'Saudável' },
    { id: 3, propId: 2, brinco: 'ANG-050', raca: 'Angus', peso: 380, lote: 'Pasto Central', categoria: 'Vaca', status: 'Saudável' }
  ],
  financeiro: [
    { id: 1, propId: 1, tipo: 'Despesa', descricao: 'Ração Proteinada', valor: 1500, data: '2024-05-10' },
    { id: 2, propId: 1, tipo: 'Receita', descricao: 'Venda de Bezerros', valor: 8000, data: '2024-05-12' }
  ]
};

const Card = ({ children, className = '' }) => (
  <div className={'bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ' + className}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className='hover:scale-[1.02] transition-transform cursor-pointer'>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-slate-500 text-sm font-medium'>{title}</p>
        <h3 className='text-2xl font-black mt-1 text-slate-800'>{value}</h3>
      </div>
      <div className={'p-3 rounded-xl ' + color}>
        <Icon size={24} className='text-white' />
      </div>
    </div>
  </Card>
);

export default function App() {
  const [data, setData] = useState(defaultData);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPropId, setSelectedPropId] = useState(defaultData.selectedPropId);
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [isBatchFormOpen, setIsBatchFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  const filteredAnimais = useMemo(() => data.animais.filter(a => a.propId === selectedPropId), [data.animais, selectedPropId]);
  const filteredFinanceiro = useMemo(() => data.financeiro.filter(f => f.propId === selectedPropId), [data.financeiro, selectedPropId]);
  const currentProp = useMemo(() => data.propriedades.find(p => p.id === selectedPropId), [data.propriedades, selectedPropId]);

  const stats = useMemo(() => {
    const pesoTotal = filteredAnimais.reduce((acc, curr) => acc + curr.peso, 0);
    const totalDespesas = filteredFinanceiro.filter(f => f.tipo === 'Despesa').reduce((acc, curr) => acc + curr.valor, 0);
    const ganhoPesoTotal = pesoTotal * 0.1;
    const arrobasProduzidas = ganhoPesoTotal / 15;
    const custoArroba = arrobasProduzidas > 0 ? (totalDespesas / arrobasProduzidas).toFixed(2) : 0;
    return {
      total: filteredAnimais.length,
      pesoMedio: filteredAnimais.length > 0 ? (pesoTotal / filteredAnimais.length).toFixed(1) : 0,
      custoArroba,
      saldo: (filteredFinanceiro.reduce((acc, curr) => acc + (curr.tipo === 'Receita' ? curr.valor : -curr.valor), 0)).toLocaleString('pt-BR')
    };
  }, [filteredAnimais, filteredFinanceiro]);

  const handleSaveAnimal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const animal = {
      id: editingAnimal ? editingAnimal.id : Date.now(),
      propId: selectedPropId,
      brinco: formData.get('brinco'),
      raca: formData.get('raca'),
      peso: Number(formData.get('peso')),
      lote: formData.get('lote'),
      categoria: formData.get('categoria'),
      status: 'Saudável'
    };
    if (editingAnimal) {
      setData(prev => ({ ...prev, animais: prev.animais.map(a => a.id === animal.id ? animal : a) }));
    } else {
      setData(prev => ({ ...prev, animais: [...prev.animais, animal] }));
    }
    setIsAnimalFormOpen(false);
    setEditingAnimal(null);
  };

  const handleBatchRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const prefixo = formData.get('prefixo') || '';
    const inicio = Number(formData.get('inicio'));
    const quantidade = Number(formData.get('quantidade'));
    const novos = [];
    for (let i = 0; i < quantidade; i++) {
      novos.push({
        id: Date.now() + i,
        propId: selectedPropId,
        brinco: prefixo + (inicio + i),
        raca: formData.get('raca'),
        peso: Number(formData.get('peso')),
        lote: formData.get('lote'),
        categoria: formData.get('categoria'),
        status: 'Saudável'
      });
    }
    setData(prev => ({ ...prev, animais: [...prev.animais, ...novos] }));
    setIsBatchFormOpen(false);
  };

  const deleteAnimal = (id) => {
    if (window.confirm('Excluir animal?')) {
      setData(prev => ({ ...prev, animais: prev.animais.filter(a => a.id !== id) }));
    }
  };

  const moveAnimal = (animal, newPropId) => {
    setData(prev => ({ ...prev, animais: prev.animais.map(a => a.id === animal.id ? { ...a, propId: newPropId } : a) }));
  };

  return (
    <div className='flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden'>
      <aside className='w-72 bg-slate-900 text-white flex flex-col p-6 space-y-8'>
        <div className='flex items-center gap-3 px-2'>
          <div className='bg-indigo-500 p-2 rounded-xl'><Tractor size={28} /></div>
          <h1 className='text-2xl font-black italic'>BoviGest<span className='text-indigo-400'>PRO</span></h1>
        </div>
        <nav className='flex-1 space-y-1'>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'rebanho', label: 'Rebanho Geral', icon: Beef },
            { id: 'sanidade', label: 'Sanidade', icon: Syringe },
            { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
            { id: 'propriedades', label: 'Propriedades', icon: MapPin },
            { id: 'configuracoes', label: 'Configurações', icon: Settings },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold ' + (activeView === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800')}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className='flex-1 flex flex-col overflow-hidden'>
        <header className='h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8'>
          <select value={selectedPropId} onChange={(e) => setSelectedPropId(Number(e.target.value))} className='bg-slate-100 rounded-xl px-4 py-2 font-bold outline-none'>
            {data.propriedades.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <div className='flex items-center gap-3'>
            <div className='text-right'><p className='text-sm font-bold'>Vinícius Gasparini</p><p className='text-xs text-slate-400'>Veterinário</p></div>
            <div className='w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black'>VG</div>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto p-8'>
          {activeView === 'dashboard' && (
            <div className='grid grid-cols-4 gap-6'>
              <StatCard title='Total Cabeças' value={stats.total} icon={Beef} color='bg-blue-500' />
              <StatCard title='Peso Médio (kg)' value={stats.pesoMedio} icon={Scale} color='bg-emerald-500' />
              <StatCard title='Custo/Arroba (@)' value={'R$ ' + stats.custoArroba} icon={Calculator} color='bg-orange-500' />
              <StatCard title='Saldo' value={'R$ ' + stats.saldo} icon={DollarSign} color='bg-indigo-500' />
            </div>
          )}
          {activeView === 'rebanho' && (
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-black'>Rebanho</h2>
                <div className='flex gap-3'>
                  <button onClick={() => setIsBatchFormOpen(true)} className='bg-slate-800 text-white px-4 py-2 rounded-xl font-bold'>Lote</button>
                  <button onClick={() => {setEditingAnimal(null); setIsAnimalFormOpen(true);}} className='bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold'>+ Animal</button>
                </div>
              </div>
              <Card><table className='w-full'>
                <thead><tr className='text-slate-400 text-sm border-b'><th>Brinco</th><th>Raça</th><th className='text-right'>Ações</th></tr></thead>
                <tbody>{filteredAnimais.map(a => (
                  <tr key={a.id} className='border-b last:border-0'>
                    <td className='py-4 font-bold text-indigo-600'>{a.brinco}</td><td>{a.raca}</td>
                    <td className='py-4 text-right flex justify-end gap-2'>
                      <button onClick={() => moveAnimal(a, selectedPropId === 1 ? 2 : 1)} className='p-2 text-orange-600 hover:bg-orange-50 rounded-lg'><ArrowRightLeft size={18}/></button>
                      <button onClick={() => {setEditingAnimal(a); setIsAnimalFormOpen(true);}} className='p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg'><Edit size={18}/></button>
                      <button onClick={() => deleteAnimal(a.id)} className='p-2 text-red-600 hover:bg-red-50 rounded-lg'><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}</tbody>
              </table></Card>
            </div>
          )}
          {['sanidade', 'financeiro', 'propriedades', 'configuracoes'].includes(activeView) && <div className='py-20 text-center text-slate-400 font-bold'>Em breve: {activeView}</div>}
        </div>
      </main>

      {(isAnimalFormOpen || isBatchFormOpen) && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-md'>
            <h2 className='text-xl font-black mb-6'>{isBatchFormOpen ? 'Cadastro Lote' : 'Form Animal'}</h2>
            <form onSubmit={isBatchFormOpen ? handleBatchRegister : handleSaveAnimal} className='space-y-4'>
              {isBatchFormOpen ? (
                <><input name='prefixo' placeholder='Prefixo' className='w-full p-3 border rounded-xl' /><input name='inicio' type='number' placeholder='Início' required className='w-full p-3 border rounded-xl' /><input name='quantidade' type='number' placeholder='Qtd' required className='w-full p-3 border rounded-xl' /></>
              ) : (
                <input name='brinco' defaultValue={editingAnimal?.brinco} placeholder='Brinco' required className='w-full p-3 border rounded-xl' />
              )}
              <input name='raca' defaultValue={editingAnimal?.raca} placeholder='Raça' required className='w-full p-3 border rounded-xl' />
              <input name='peso' type='number' defaultValue={editingAnimal?.peso} placeholder='Peso' required className='w-full p-3 border rounded-xl' />
              <input name='lote' defaultValue={editingAnimal?.lote} placeholder='Lote' required className='w-full p-3 border rounded-xl' />
              <div className='flex gap-2 mt-4'>
                <button type='button' onClick={() => {setIsAnimalFormOpen(false); setIsBatchFormOpen(false);}} className='flex-1 p-3 bg-slate-100 rounded-xl'>Cancelar</button>
                <button type='submit' className='flex-1 p-3 bg-indigo-600 text-white rounded-xl'>Salvar</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
