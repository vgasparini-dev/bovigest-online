/* ts-nocheck eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search, Plus, MapPin, 
  DollarSign, HeartPulse, LayoutGrid, X, Trash2, Edit, Baby, 
  LayoutDashboard, Scale, Settings, Sparkles, Bot, Send, 
  Loader2, CheckCircle2, Download, Archive, Target, PackagePlus, 
  AlertTriangle, ListPlus, ShieldAlert, Wheat, Calculator, 
  FileText, Syringe, CalendarCheck, Users 
} from 'lucide-react';

// --- BASE DE DADOS INICIAL ---
const defaultData = {
  propriedades: [
    { id: 1, nome: "Fazenda São João", responsavel: "Administrador", cidade: "Rondonópolis", estado: "MT", area_ha: 350, ie: "123.456.789-00" }
  ],
  lotes: [
    { id: 1, nome: "Matrizes A", capacidade: 50, tipo: "Pasto", obs: "Pasto Central" },
    { id: 2, nome: "Confinamento 1", capacidade: 100, tipo: "Baia", obs: "Terminação" }
  ],
  animais: [
    { id: 1, brinco: "001", nome: "Mimosa", sexo: "F", categoria: "Vaca", tipo: "Cria", raca: "Nelore", dataNasc: "2020-03-15", peso: 420, ativo: true, lote: "Matrizes A", obs: "Matriz principal." },
    { id: 2, brinco: "105", nome: "Soberano", sexo: "M", categoria: "Boi Gordo", tipo: "Corte", raca: "Angus", dataNasc: "2024-01-10", peso: 490, ativo: true, lote: "Confinamento 1", obs: "Fase de terminação." }
  ],
  pesagens: [
    { id: 1, brinco: "105", data: "2025-11-10", pesoAnterior: 400, pesoAtual: 450, obs: "Entrada seca" },
    { id: 2, brinco: "105", data: "2026-02-10", pesoAnterior: 450, pesoAtual: 490, obs: "Pesagem de rotina" }
  ],
  reproducao: [
    { id: 1, brincoVaca: "001", dataInseminacao: "2025-06-10", previsaoParto: "2026-03-15", metodo: "IA", reprodutor: "Nelore PO", status: "Prenhe" }
  ],
  nascimentos: [],
  vacinacoes: [
    { id: 1, vacina: "Ivermectina 1%", lote: "Confinamento 1", dataAplicacao: "2026-03-10", proximaDose: null, qtdAnimais: 80, obs: "Controlo parasitário", carenciaDias: 35, dataLiberacao: "2026-04-14", status: "concluida" }
  ],
  insumos: [
    { id: 1, nome: "Sal Mineral 80", categoria: "Nutrição", quantidade: 50, unidade: "kg", estoqueMinimo: 100 },
    { id: 2, nome: "Ivermectina 50ml", categoria: "Medicamentos", quantidade: 15, unidade: "frascos", estoqueMinimo: 5 }
  ],
  financeiro: [
    { id: 1, descricao: "Venda lote engorda", categoria: "Venda de Gado", tipo: "receita", valor: 68000, data: "2026-02-18", status: "pago" },
    { id: 2, descricao: "Compra Ração", categoria: "Nutrição", tipo: "despesa", valor: 4500, data: "2026-02-20", status: "pago" }
  ],
  bibliotecaAlimentos: [
    { id: 1, nome: "Silagem de Milho", ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: "Milho Grão Moído", ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 },
    { id: 3, nome: "Farelo de Soja (46%)", ms: 89, elm: 2.05, elg: 1.40, pm: 320, ca: 3.5, p: 6.5, precoKg: 2.50 },
    { id: 4, nome: "Ureia Pecuária", ms: 100, elm: 0, elg: 0, pm: 1200, ca: 0, p: 0, precoKg: 3.80 },
    { id: 5, nome: "Núcleo Confinamento", ms: 100, elm: 0, elg: 0, pm: 0, ca: 150, p: 80, precoKg: 5.50 },
    { id: 6, nome: "Feno de Tifton", ms: 85, elm: 1.20, elg: 0.60, pm: 40, ca: 4.0, p: 2.5, precoKg: 0.60 }
  ]
};

// --- FUNÇÕES UTILITÁRIAS IA ---
const calcularExigenciasNASEM = (peso, gpd) => {
  const pesoMetabolico = Math.pow(peso, 0.75);
  return {
    cms: peso * 0.022,
    elm: 0.077 * pesoMetabolico,
    elg: 0.063 * pesoMetabolico * Math.pow(gpd, 1.097),
    pm: 3.8 * pesoMetabolico + gpd * 250,
    ca: 15 + gpd * 10,
    p: 10 + gpd * 8
  };
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados de Modais
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [isBatchAnimalFormOpen, setIsBatchAnimalFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [isFinanceFormOpen, setIsFinanceFormOpen] = useState(false);
  const [isVaccineFormOpen, setIsVaccineFormOpen] = useState(false);
  const [isLoteFormOpen, setIsLoteFormOpen] = useState(false);
  const [isReproducaoFormOpen, setIsReproducaoFormOpen] = useState(false);
  const [isPesagemFormOpen, setIsPesagemFormOpen] = useState(false);
  const [isNascimentoFormOpen, setIsNascimentoFormOpen] = useState(false);
  const [isInsumoFormOpen, setIsInsumoFormOpen] = useState(false);
  const [isPropriedadeFormOpen, setIsPropriedadeFormOpen] = useState(false);
  const [editingPropriedade, setEditingPropriedade] = useState(null);

  const [propriedadeAtiva, setPropriedadeAtiva] = useState(1);
  const [nutriAlvoPeso, setNutriAlvoPeso] = useState(400);
  const [nutriAlvoGPD, setNutriAlvoGPD] = useState(1.2);
  const [dietaAtual, setDietaAtual] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- PERSISTÊNCIA ---
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_pro_v1.1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed };
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('bovigest_data_pro_v1.1', JSON.stringify(appData));
  }, [appData]);

  // --- CÁLCULOS E MEMOS ---
  const totaisFinanceiros = useMemo(() => {
    return appData.financeiro.reduce((acc, item) => {
      if (item.status === 'pago') {
        if (item.tipo === 'receita') acc.receitas += Number(item.valor);
        if (item.tipo === 'despesa') acc.despesas += Number(item.valor);
      }
      return acc;
    }, { receitas: 0, despesas: 0 });
  }, [appData.financeiro]);

  const saldoAtual = totaisFinanceiros.receitas - totaisFinanceiros.despesas;

  const filteredAnimais = useMemo(() => {
    return appData.animais.filter(a => 
      a.brinco.includes(searchQuery) || 
      a.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.categoria.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.lote.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, appData.animais]);

  const pesoMedio = useMemo(() => {
    if (appData.animais.length === 0) return 0;
    return Math.round(appData.animais.reduce((acc, a) => acc + Number(a.peso), 0) / appData.animais.length);
  }, [appData.animais]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSaveAnimal = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const animalData = {
      id: editingAnimal ? editingAnimal.id : Date.now(),
      brinco: fd.get('brinco'),
      nome: fd.get('nome') || "-",
      sexo: fd.get('sexo'),
      categoria: fd.get('categoria'),
      tipo: fd.get('tipo'),
      raca: fd.get('raca'),
      dataNasc: fd.get('dataNasc'),
      peso: Number(fd.get('peso')),
      lote: fd.get('lote') || "Sem Lote",
      obs: fd.get('obs'),
      ativo: true
    };

    if (editingAnimal) {
      setAppData(prev => ({ ...prev, animais: prev.animais.map(a => a.id === animalData.id ? animalData : a) }));
    } else {
      setAppData(prev => ({ ...prev, animais: [animalData, ...prev.animais] }));
    }
    setIsAnimalFormOpen(false);
    setEditingAnimal(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1544866582-90e808381861?q=80&w=2074&auto=format&fit=crop")'}}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center text-green-500 mb-4">
            <Tractor size={64} className="drop-shadow-lg" />
          </div>
          <h2 className="mt-2 text-center text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            BoviGest <span className="text-green-500">PRO</span>
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-8 shadow-2xl sm:rounded-3xl border border-slate-700/50">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
              <div>
                <input type="email" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none" defaultValue="gestor@bovigest.com" />
              </div>
              <div>
                <input type="password" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none" defaultValue="123456" />
              </div>
              <button type="submit" className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-bold text-white bg-green-600 hover:bg-green-500 transition-all shadow-lg">
                Aceder ao Painel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 border-r border-slate-900 hidden md:flex flex-col shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
          <Tractor className="text-green-500 mr-4 shrink-0" size={32} />
          <span className="text-2xl font-black tracking-tight text-white block leading-none">BoviGest</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' },
            { id: 'animais', icon: Beef, label: 'Rebanho Geral' },
            { id: 'propriedades', icon: MapPin, label: 'Propriedades' },
            { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
            { id: 'configuracoes', icon: Settings, label: 'Configurações' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl group transition-all ${currentView === item.id ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <item.icon className={`mr-3 h-5 w-5 shrink-0 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-bold text-sm truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50 shrink-0">
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center justify-center w-full px-4 py-3 text-slate-400 border border-slate-700/50 hover:text-red-400 hover:bg-slate-900 rounded-xl font-bold text-sm">
            <LogOut className="mr-2 h-4 w-4" /> Terminar Sessão
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 z-10 shadow-sm shrink-0">
          <h2 className="text-3xl font-extrabold text-gray-900 capitalize flex items-center tracking-tight">
            {currentView}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-800 relative p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 w-fit mb-4"><Beef size={28} /></div>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{appData.animais.length}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Total Cabeças</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="bg-green-50 p-4 rounded-2xl text-green-600 w-fit mb-4"><DollarSign size={28} /></div>
                  <h3 className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(saldoAtual)}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Saldo Global</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 w-fit mb-4"><Scale size={28} /></div>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{pesoMedio} <span className="text-xl text-gray-300 font-bold">kg</span></h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Média de Peso</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'animais' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-[400px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-13 pr-5 py-4 border border-gray-200 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-green-500" placeholder="Procurar brinco, lote..." />
                </div>
                <button onClick={() => { setEditingAnimal(null); setIsAnimalFormOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center shadow-md">
                  <Plus className="mr-2" /> Novo Animal
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Identificação</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Lote</th>
                      <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Peso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredAnimais.map(animal => (
                      <tr key={animal.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center">
                            <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm mr-5 ${animal.sexo === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{animal.brinco}</div>
                            <div>
                              <div className="text-base font-black text-gray-900">{animal.nome}</div>
                              <div className="text-sm font-semibold text-gray-500">{animal.raca} • {animal.categoria}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{animal.lote}</span>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-gray-900">{animal.peso} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL ANIMAL */}
      {isAnimalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">{editingAnimal ? 'Editar' : 'Novo'} Animal</h2>
              <button onClick={() => setIsAnimalFormOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSaveAnimal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required name="brinco" placeholder="Brinco" className="px-4 py-3 border rounded-xl w-full" defaultValue={editingAnimal?.brinco} />
                <input name="nome" placeholder="Nome" className="px-4 py-3 border rounded-xl w-full" defaultValue={editingAnimal?.nome} />
                <select name="sexo" className="px-4 py-3 border rounded-xl w-full" defaultValue={editingAnimal?.sexo}>
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
                <input required name="raca" placeholder="Raça" className="px-4 py-3 border rounded-xl w-full" defaultValue={editingAnimal?.raca} />
                <input required type="number" name="peso" placeholder="Peso (kg)" className="px-4 py-3 border rounded-xl w-full" defaultValue={editingAnimal?.peso} />
                <input name="lote" placeholder="Lote" className="px-4 py-3 border rounded-xl w-full" defaultValue={editingAnimal?.lote} />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
