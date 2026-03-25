/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search, Plus, MapPin, 
  DollarSign, HeartPulse, LayoutGrid, X, Trash2, Edit, Baby, 
  LayoutDashboard, Scale, Settings, Sparkles, Bot, Send, 
  Loader2, CheckCircle2, Download, Archive, Target, PackagePlus, 
  AlertTriangle, ListPlus, ShieldAlert, Wheat, Calculator, 
  FileText, Syringe, CalendarCheck, Users, ChevronRight, ArrowRightLeft,
  MoveHorizontal
} from 'lucide-react';

// --- BASE DE DADOS INICIAL ---
const defaultData = {
  propriedades: [
    { id: 1, nome: 'Fazenda São João', responsavel: 'Administrador', cidade: 'Jaru', estado: 'RO', area_ha: 350, ie: '123.456.789' },
    { id: 2, nome: 'Estância Vitória', responsavel: 'Vinícius', cidade: 'Ariquemes', estado: 'RO', area_ha: 120, ie: '987.654.321' }
  ],
  animais: [
    { id: 1, propId: 1, brinco: 'NEL-001', raca: 'Nelore', peso_entrada: 200, peso: 450, lote: 'Engorda A', categoria: 'Boi Gordo', status: 'Saudável' },
    { id: 2, propId: 1, brinco: 'NEL-002', raca: 'Nelore', peso_entrada: 180, peso: 420, lote: 'Engorda A', categoria: 'Boi Gordo', status: 'Saudável' },
    { id: 3, propId: 2, brinco: 'ANG-050', raca: 'Angus', peso_entrada: 150, peso: 380, lote: 'Pasto Central', categoria: 'Vaca', status: 'Saudável' }
  ],
  financeiro: [
    { id: 1, propId: 1, tipo: 'Despesa', descricao: 'Ração Proteinada', valor: 2500, data: '2024-05-10' },
    { id: 2, propId: 1, tipo: 'Receita', descricao: 'Venda de Bezerros', valor: 8000, data: '2024-05-12' },
    { id: 3, propId: 2, tipo: 'Despesa', descricao: 'Vacinas', valor: 800, data: '2024-05-15' }
  ]
};

// --- COMPONENTES UI ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export default function App() {
  // Estados Principais
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data');
    return saved ? JSON.parse(saved) : defaultData;
  });
  
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPropId, setSelectedPropId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para Modais/Formulários
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [isBatchFormOpen, setIsBatchFormOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isFinanceFormOpen, setIsFinanceFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [movingAnimal, setMovingAnimal] = useState(null);

  // Persistência
  useEffect(() => {
    localStorage.setItem('bovigest_data', JSON.stringify(data));
  }, [data]);

  // Filtros e Cálculos
  const currentProp = useMemo(() => 
    data.propriedades.find(p => p.id === selectedPropId) || data.propriedades[0], 
    [data.propriedades, selectedPropId]
  );

  const filteredAnimais = useMemo(() => 
    data.animais.filter(a => a.propId === selectedPropId && 
      (a.brinco.toLowerCase().includes(searchTerm.toLowerCase()) || 
       a.lote.toLowerCase().includes(searchTerm.toLowerCase()))
    ), 
    [data.animais, selectedPropId, searchTerm]
  );

  const stats = useMemo(() => {
    const animaisProp = data.animais.filter(a => a.propId === selectedPropId);
    const financeiroProp = data.financeiro.filter(f => f.propId === selectedPropId);
    
    const pesoTotal = animaisProp.reduce((acc, curr) => acc + curr.peso, 0);
    const pesoEntradaTotal = animaisProp.reduce((acc, curr) => acc + (curr.peso_entrada || 0), 0);
    const ganhoPesoKg = pesoTotal - pesoEntradaTotal;
    const arrobasProduzidas = ganhoPesoKg / 15;
    
    const totalDespesas = financeiroProp
      .filter(f => f.tipo === 'Despesa')
      .reduce((acc, curr) => acc + curr.valor, 0);
    
    const custoArroba = arrobasProduzidas > 0 
      ? (totalDespesas / arrobasProduzidas).toFixed(2) 
      : "0,00";

    const saldo = financeiroProp.reduce((acc, curr) => 
      acc + (curr.tipo === 'Receita' ? curr.valor : -curr.valor), 0
    );

    return {
      totalAnimais: animaisProp.length,
      pesoMedio: animaisProp.length > 0 ? (pesoTotal / animaisProp.length).toFixed(1) : 0,
      custoArroba,
      saldo: saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      totalDespesas: totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      ganhoArrobas: arrobasProduzidas.toFixed(1)
    };
  }, [data, selectedPropId]);

  // Funções de Gerenciamento
  const handleSaveAnimal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const animal = {
      id: editingAnimal ? editingAnimal.id : Date.now(),
      propId: selectedPropId,
      brinco: formData.get('brinco'),
      raca: formData.get('raca'),
      peso_entrada: Number(formData.get('peso_entrada')),
      peso: Number(formData.get('peso')),
      lote: formData.get('lote'),
      categoria: formData.get('categoria'),
      status: 'Saudável'
    };

    setData(prev => ({
      ...prev,
      animais: editingAnimal 
        ? prev.animais.map(a => a.id === animal.id ? animal : a)
        : [...prev.animais, animal]
    }));
    
    setIsAnimalFormOpen(false);
    setEditingAnimal(null);
  };

  const handleBatchRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const prefixo = formData.get('prefixo') || '';
    const inicio = Number(formData.get('inicio'));
    const quantidade = Number(formData.get('quantidade'));
    const pesoEntrada = Number(formData.get('peso_entrada'));
    const pesoAtual = Number(formData.get('peso'));
    
    const novosAnimais = [];
    for (let i = 0; i < quantidade; i++) {
      novosAnimais.push({
        id: Date.now() + i,
        propId: selectedPropId,
        brinco: `${prefixo}${inicio + i}`,
        raca: formData.get('raca'),
        peso_entrada: pesoEntrada,
        peso: pesoAtual,
        lote: formData.get('lote'),
        categoria: formData.get('categoria'),
        status: 'Saudável'
      });
    }

    setData(prev => ({
      ...prev,
      animais: [...prev.animais, ...novosAnimais]
    }));
    setIsBatchFormOpen(false);
  };

  const deleteAnimal = (id) => {
    if (confirm('Tem certeza que deseja excluir este animal?')) {
      setData(prev => ({
        ...prev,
        animais: prev.animais.filter(a => a.id !== id)
      }));
    }
  };

  const handleMoveAnimal = (e) => {
    e.preventDefault();
    const destPropId = Number(new FormData(e.target).get('destPropId'));
    setData(prev => ({
      ...prev,
      animais: prev.animais.map(a => 
        a.id === movingAnimal.id ? { ...a, propId: destPropId } : a
      )
    }));
    setIsMoveModalOpen(false);
    setMovingAnimal(null);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nova = {
      id: Date.now(),
      propId: selectedPropId,
      tipo: formData.get('tipo'),
      descricao: formData.get('descricao'),
      valor: Number(formData.get('valor')),
      data: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      financeiro: [...prev.financeiro, nova]
    }));
    setIsFinanceFormOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Lateral */}
      <aside className="w-72 bg-slate-900 text-white p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Beef size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tight">BoviGest PRO</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'rebanho', label: 'Rebanho Geral', icon: Beef },
            { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
            { id: 'sanidade', label: 'Sanidade', icon: Syringe },
            { id: 'propriedades', label: 'Minhas Fazendas', icon: MapPin },
            { id: 'configuracoes', label: 'Configurações', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800 mt-auto">
          <button className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2 font-medium w-full">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 ml-72 p-8 pb-24">
        {/* Header Superior */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Olá, {currentProp?.responsavel}</h2>
            <p className="text-slate-500 font-medium">Você está gerenciando: <span className="text-indigo-600">{currentProp?.nome}</span></p>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={selectedPropId}
              onChange={(e) => setSelectedPropId(Number(e.target.value))}
              className="bg-white border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
            >
              {data.propriedades.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200">
              VG
            </div>
          </div>
        </header>

        {/* --- VIEW: DASHBOARD --- */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total de Animais" 
                value={stats.totalAnimais} 
                icon={Beef} 
                color="bg-blue-100 text-blue-600"
                subtitle="Cabeças no pátio"
              />
              <StatCard 
                title="Peso Médio" 
                value={`${stats.pesoMedio} kg`} 
                icon={Scale} 
                color="bg-orange-100 text-orange-600"
                subtitle="Média por animal"
              />
              <StatCard 
                title="Custo / Arroba" 
                value={`R$ ${stats.custoArroba}`} 
                icon={Calculator} 
                color="bg-emerald-100 text-emerald-600"
                subtitle={`Baseado em ${stats.ganhoArrobas} @ prod.`}
              />
              <StatCard 
                title="Despesa Total" 
                value={stats.totalDespesas} 
                icon={DollarSign} 
                color="bg-rose-100 text-rose-600"
                subtitle="Mês atual"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Atividades Recentes</h3>
                  <button className="text-indigo-600 font-bold text-sm">Ver tudo</button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Activity size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Pesagem realizada</p>
                          <p className="text-xs text-slate-400">Há 2 horas • Lote {i}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-bold text-slate-900 mb-6">Ações Rápidas</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => {setEditingAnimal(null); setIsAnimalFormOpen(true);}}
                    className="flex items-center gap-3 p-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={20} /> Cadastrar Animal
                  </button>
                  <button 
                    onClick={() => setIsBatchFormOpen(true)}
                    className="flex items-center gap-3 p-4 bg-slate-50 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-colors"
                  >
                    <ListPlus size={20} /> Entrada em Lote
                  </button>
                  <button 
                    onClick={() => setIsFinanceFormOpen(true)}
                    className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-2xl font-bold hover:bg-rose-100 transition-colors"
                  >
                    <DollarSign size={20} /> Lançar Despesa
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- VIEW: REBANHO GERAL --- */}
        {activeView === 'rebanho' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar por brinco ou lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsBatchFormOpen(true)}
                  className="bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
                >
                  <ListPlus size={20} /> Cadastro em Lote
                </button>
                <button 
                  onClick={() => {setEditingAnimal(null); setIsAnimalFormOpen(true);}}
                  className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200"
                >
                  <Plus size={20} /> Novo Animal
                </button>
              </div>
            </div>

            <Card className="overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Animal</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Lote / Categoria</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Peso (Atual)</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAnimais.map(animal => (
                      <tr key={animal.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                              ID
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">#{animal.brinco}</p>
                              <p className="text-xs text-slate-400 font-medium">{animal.raca}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700">{animal.lote}</p>
                          <p className="text-xs text-slate-400">{animal.categoria}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg font-bold text-sm">
                            <Scale size={14} />
                            {animal.weight || animal.peso} kg
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {setMovingAnimal(animal); setIsMoveModalOpen(true);}}
                              title="Mover de Fazenda"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <MoveHorizontal size={18} />
                            </button>
                            <button 
                              onClick={() => {setEditingAnimal(animal); setIsAnimalFormOpen(true);}}
                              title="Editar"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deleteAnimal(animal.id)}
                              title="Excluir"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAnimais.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                          Nenhum animal encontrado para esta fazenda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* --- OUTRAS VIEWS (PLACEHOLDERS) --- */}
        {['sanidade', 'financeiro', 'propriedades', 'configuracoes'].includes(activeView) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
              <Bot size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Módulo em Desenvolvimento</h3>
            <p className="text-slate-500 max-w-sm mt-2">Estamos trabalhando para trazer as melhores ferramentas de gestão para você.</p>
          </div>
        )}
      </main>

      {/* --- MODAL: FORMULÁRIO DE ANIMAL --- */}
      {isAnimalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingAnimal ? 'Editar Animal' : 'Novo Registro'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">Preencha as informações do animal</p>
              </div>
              <button 
                onClick={() => {setIsAnimalFormOpen(false); setEditingAnimal(null);}}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveAnimal} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Brinco / ID</label>
                  <input name="brinco" defaultValue={editingAnimal?.brinco} placeholder="Ex: NEL-102" required 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Raça</label>
                  <input name="raca" defaultValue={editingAnimal?.raca} placeholder="Ex: Nelore" required 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Peso Entrada (kg)</label>
                  <input name="peso_entrada" type="number" defaultValue={editingAnimal?.peso_entrada} placeholder="0" required 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Peso Atual (kg)</label>
                  <input name="peso" type="number" defaultValue={editingAnimal?.peso} placeholder="0" required 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Lote</label>
                  <input name="lote" defaultValue={editingAnimal?.lote} placeholder="Ex: Piquete 01" required 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Categoria</label>
                  <select name="categoria" defaultValue={editingAnimal?.categoria || 'Garrote'} 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold">
                    <option>Boi Gordo</option>
                    <option>Vaca</option>
                    <option>Bezerro</option>
                    <option>Garrote</option>
                    <option>Novilha</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {setIsAnimalFormOpen(false); setEditingAnimal(null);}}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200">
                  Salvar Registro
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL: CADASTRO EM LOTE --- */}
      {isBatchFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">Entrada de Lote Seqüencial</h3>
              <button onClick={() => setIsBatchFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleBatchRegister} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Prefixo</label>
                  <input name="prefixo" placeholder="Ex: NEL-" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-indigo-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Nº Inicial</label>
                  <input name="inicio" type="number" placeholder="100" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-indigo-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">Quantidade</label>
                  <input name="quantidade" type="number" placeholder="10" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-indigo-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="raca" placeholder="Raça" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-indigo-600" />
                <input name="lote" placeholder="Lote de Destino" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-indigo-600" />
                <input name="peso_entrada" type="number" placeholder="Peso Entrada (kg)" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-indigo-600" />
                <input name="peso" type="number" placeholder="Peso Atual (kg)" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-indigo-600" />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-200 transition-all">
                Gerar Animais Automaticamente
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL: MOVER ANIMAL --- */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">Mover Animal: #{movingAnimal?.brinco}</h3>
            <form onSubmit={handleMoveAnimal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Selecione a Fazenda de Destino</label>
                <select name="destPropId" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-4 font-bold outline-none focus:border-indigo-600 transition-all">
                  {data.propriedades.filter(p => p.id !== selectedPropId).map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsMoveModalOpen(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-200">Confirmar Mudança</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL: LANÇAR DESPESA --- */}
      {isFinanceFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">Lançar Novo Custo</h3>
            <form onSubmit={handleAddExpense} className="space-y-6">
              <input name="descricao" placeholder="Descrição (Ex: Ração, Vacina...)" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-4 font-bold outline-none focus:border-indigo-600" />
              <input name="valor" type="number" placeholder="Valor (R$)" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-4 font-bold outline-none focus:border-indigo-600" />
              <select name="tipo" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-4 font-bold outline-none focus:border-indigo-600">
                <option value="Despesa">Despesa (Custo)</option>
                <option value="Receita">Receita (Venda)</option>
              </select>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-200 transition-all">
                Salvar Lançamento
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
