// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Tractor, Beef, Activity, LogOut, Bell, Search, Plus, MapPin, DollarSign,
  HeartPulse, LayoutGrid, X, Trash2, Edit, Baby, LayoutDashboard, Scale,
  Settings, Sparkles, Bot, Send, Loader2, CheckCircle2, Download, Archive,
  Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert, Wheat,
  Calculator, FileText, Syringe, CalendarCheck, Users, ChevronRight
} from 'lucide-react';

// --- BASE DE DADOS INICIAL MESCLADA ---
const defaultData = {
  selectedPropId: 1,
  propriedades: [
    { id: 1, nome: "Fazenda São João", responsavel: "Administrador", cidade: "Jaru", estado: "RO", area_ha: 350, ie: "123.456.789-00" },
    { id: 2, nome: "Estância Vitória", responsavel: "Vinicius", cidade: "Ariquemes", estado: "RO", area_ha: 120, ie: "987.654.321-00" }
  ],
  lotes: [
    { id: 1, propId: 1, nome: "Matrizes A", capacidade: 50, tipo: "Pasto", obs: "Pasto Central" },
    { id: 2, propId: 1, nome: "Confinamento 1", capacidade: 100, tipo: "Baia", obs: "Terminação" },
  ],
  animais: [
    { id: 1, propId: 1, brinco: "001", nome: "Mimosa", sexo: "F", categoria: "Vaca", tipo: "Cria", raca: "Nelore", dataNasc: "2020-03-15", peso: 420, pesoInicial: 380, ativo: true, lote: "Matrizes A" },
    { id: 2, propId: 1, brinco: "105", nome: "Soberano", sexo: "M", categoria: "Boi Gordo", tipo: "Corte", raca: "Angus", dataNasc: "2024-01-10", peso: 490, pesoInicial: 410, ativo: true, lote: "Confinamento 1" }
  ],
  pesagens: [
    { id: 1, brinco: "105", data: "2025-11-10", pesoAnterior: 400, pesoAtual: 450, obs: "Entrada seca" }
  ],
  reproducao: [
    { id: 1, brincoVaca: "001", dataInseminacao: "2025-06-10", previsaoParto: "2026-03-15", metodo: "IA", reprodutor: "Nelore PO", status: "Prenhe" }
  ],
  nascimentos: [],
  vacinacoes: [
    { id: 1, vacina: "Ivermectina 1%", lote: "Confinamento 1", dataAplicacao: "2026-03-10", proximaDose: null, qtdAnimais: 80, obs: "Controle parasitário", carenciaDias: 35, dataLiberacao: "2026-04-14", status: "concluida" }
  ],
  insumos: [
    { id: 1, nome: "Sal Mineral 80", categoria: "Nutrição", quantidade: 50, unidade: "kg", estoqueMinimo: 100 },
    { id: 2, nome: "Ivermectina 50ml", categoria: "Medicamentos", quantidade: 15, unidade: "frascos", estoqueMinimo: 5 }
  ],
  financeiro: [
    { id: 1, propId: 1, descricao: "Venda lote engorda", categoria: "Venda de Gado", tipo: "receita", valor: 68000, data: "2026-02-18", status: "pago" },
    { id: 2, propId: 1, descricao: "Compra Ração", categoria: "Nutrição", tipo: "despesa", valor: 4500, data: "2026-02-20", status: "pago" }
  ],
  bibliotecaAlimentos: [
    { id: 1, nome: "Silagem de Milho", ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: "Milho Grão Moído", ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 },
    { id: 3, nome: "Farelo de Soja 46", ms: 89, elm: 2.05, elg: 1.40, pm: 320, ca: 3.5, p: 6.5, precoKg: 2.50 }
  ],
  calendarioSanitario: [
    { id: 1, mes: "Janeiro", tarefa: "Vacinação Brucelose (Fêmeas 3-8 meses)", tipo: "Obrigatória" },
    { id: 2, mes: "Maio", tarefa: "Vermifugação Estratégica (Início da Seca)", tipo: "Manejo" },
    { id: 3, mes: "Novembro", tarefa: "Vacinação Clostridioses", tipo: "Recomendada" },
    { id: 4, mes: "Contínuo", tarefa: "Controle de Ectoparasitas (Carrapato/Mosca)", tipo: "Sanidade" }
  ]
};

// --- COMPONENTES UI REUTILIZÁVEIS ---
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

// --- FUNÇÕES DE CÁLCULO NASEM ---
const calcularExigenciasNASEM = (peso, gpd) => {
  const pesoMetabolico = Math.pow(peso, 0.75);
  return {
    cms: peso * 0.022,
    elm: 0.077 * pesoMetabolico,
    elg: 0.063 * pesoMetabolico * Math.pow(gpd, 1.097),
    pm: (3.8 * pesoMetabolico) + (gpd * 250)
  };
};

export default function App() {
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_pro_v12');
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPropId, setSelectedPropId] = useState(appData.selectedPropId || 1);
  const [sanidadeSubView, setSanidadeSubView] = useState('historico');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados Nutrição
  const [nutriAlvoPeso, setNutriAlvoPeso] = useState(400);
  const [nutriAlvoGPD, setNutriAlvoGPD] = useState(1.2);
  const [dietaAtual, setDietaAtual] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState('');

  // Persistência
  useEffect(() => {
    localStorage.setItem('bovigest_data_pro_v12', JSON.stringify(appData));
  }, [appData]);

  // --- MEMOS ---
  const currentProp = useMemo(() => 
    appData.propriedades.find(p => p.id === selectedPropId), 
    [selectedPropId, appData.propriedades]
  );

  const animaisProp = useMemo(() => 
    appData.animais.filter(a => a.propId === selectedPropId), 
    [selectedPropId, appData.animais]
  );

  const financeiroProp = useMemo(() => 
    appData.financeiro.filter(f => f.propId === selectedPropId), 
    [selectedPropId, appData.financeiro]
  );

  const totaisFinanceiros = useMemo(() => {
    return financeiroProp.reduce((acc, item) => {
      if (item.status === 'pago') {
        if (item.tipo === 'receita') acc.receitas += Number(item.valor);
        if (item.tipo === 'despesa') acc.despesas += Number(item.valor);
      }
      return acc;
    }, { receitas: 0, despesas: 0 });
  }, [financeiroProp]);

  const saldoAtual = totaisFinanceiros.receitas - totaisFinanceiros.despesas;

  const indicadoresNutri = useMemo(() => {
    const exigencias = calcularExigenciasNASEM(nutriAlvoPeso, nutriAlvoGPD);
    let fornecido = { cms: 0, elm: 0, elg: 0, pm: 0, custo: 0 };
    
    dietaAtual.forEach(item => {
      const ali = appData.bibliotecaAlimentos.find(a => a.id === item.idInsumo);
      if (ali) {
        const kgMS = item.kgMN * (ali.ms / 100);
        fornecido.cms += kgMS;
        fornecido.elm += kgMS * ali.elm;
        fornecido.elg += kgMS * ali.elg;
        fornecido.pm += kgMS * ali.pm;
        fornecido.custo += item.kgMN * ali.precoKg;
      }
    });
    return { exigencias, fornecido };
  }, [nutriAlvoPeso, nutriAlvoGPD, dietaAtual, appData.bibliotecaAlimentos]);

  const navItems = [
    { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard },
    { id: 'propriedades', label: 'Propriedades', icon: MapPin },
    { id: 'animais', label: 'Rebanho Geral', icon: Beef, badge: animaisProp.length },
    { id: 'nutricao', label: 'Nutrição & Dietas', icon: Wheat },
    { id: 'reproducao', label: 'Inseminações', icon: HeartPulse },
    { id: 'sanidade', label: 'Sanidade', icon: ShieldAlert },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1544866582-90e808381861?q=80&w=2074&auto=format&fit=crop)'}}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <Tractor size={64} className="text-green-500 mx-auto drop-shadow-lg mb-4" />
          <h2 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">BoviGest <span className="text-green-500">PRO</span></h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-8 shadow-2xl sm:rounded-3xl border border-slate-700/50">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
              <input type="email" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl outline-none" placeholder="E-mail" defaultValue="gestor@bovigest.com" />
              <input type="password" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl outline-none" placeholder="Senha" defaultValue="123456" />
              <button type="submit" className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-bold text-white bg-green-600 hover:bg-green-500 transition-all shadow-lg">Aceder ao Painel</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 flex flex-col shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
          <Tractor className="text-green-500 mr-4" size={32} />
          <span className="text-2xl font-black tracking-tight text-white">BoviGest</span>
        </div>
        
        <div className="px-6 py-6 border-b border-slate-800/50">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Propriedade Ativa</label>
          <select 
            value={selectedPropId}
            onChange={(e) => setSelectedPropId(Number(e.target.value))}
            className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-green-500"
          >
            {appData.propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-bold text-sm">{item.label}</span>
              {item.badge > 0 && <span className="ml-auto bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsLoggedIn(false)} className="p-6 border-t border-slate-800/50 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors font-bold text-sm">
          <LogOut size={18} className="mr-2" /> Terminar Sessão
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 z-10 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 capitalize flex items-center">
            {navItems.find(n => n.id === currentView)?.label}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                <span className="text-sm font-bold text-green-600">Sincronizado</span>
             </div>
             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-black">VG</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {currentView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 w-fit mb-4"><Beef size={24} /></div>
                  <h3 className="text-4xl font-black">{animaisProp.length}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-2">Animais na Propriedade</p>
                </Card>
                <Card>
                  <div className="bg-green-50 p-4 rounded-2xl text-green-600 w-fit mb-4"><DollarSign size={24} /></div>
                  <h3 className="text-3xl font-black text-green-700">R$ {saldoAtual.toLocaleString()}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-2">Saldo Pago</p>
                </Card>
                <Card>
                  <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 w-fit mb-4"><Scale size={24} /></div>
                  <h3 className="text-4xl font-black">{animaisProp.reduce((acc, a) => acc + a.peso, 0) / (animaisProp.length || 1)} kg</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-2">Média de Peso</p>
                </Card>
                <Card>
                  <div className="bg-pink-50 p-4 rounded-2xl text-pink-600 w-fit mb-4"><HeartPulse size={24} /></div>
                  <h3 className="text-4xl font-black">{appData.reproducao.filter(r => r.status === 'Prenhe').length}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-2">Matrizes Prenhes</p>
                </Card>
              </div>
            </div>
          )}

          {currentView === 'nutricao' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-emerald-800 rounded-3xl p-8 text-white flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-2">Formulação de Dietas</h2>
                  <p className="text-emerald-100 font-medium">Cálculo de exigências baseado no NASEM 2021</p>
                </div>
                <Wheat size={120} className="absolute right-0 opacity-10 -mr-8" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                  <Card>
                    <h3 className="text-lg font-black mb-4 flex items-center"><Target size={20} className="mr-2 text-blue-600" /> 1. Perfil do Animal</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block">Peso Vivo (kg)</label>
                        <input type="number" value={nutriAlvoPeso} onChange={(e) => setNutriAlvoPeso(Number(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block">GPD Alvo (kg/dia)</label>
                        <input type="number" step="0.1" value={nutriAlvoGPD} onChange={(e) => setNutriAlvoGPD(Number(e.target.value))} className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl font-bold text-blue-900" />
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <h3 className="text-lg font-black mb-4 flex items-center"><Archive size={20} className="mr-2 text-orange-600" /> 2. Composição da Dieta</h3>
                    <div className="flex gap-2 mb-4">
                      <select value={insumoSelecionado} onChange={(e) => setInsumoSelecionado(e.target.value)} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm">
                        <option value="">Selecione Ingrediente...</option>
                        {appData.bibliotecaAlimentos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                      </select>
                      <button onClick={() => {
                        if (insumoSelecionado && !dietaAtual.find(d => d.idInsumo === Number(insumoSelecionado))) {
                          setDietaAtual([...dietaAtual, { idInsumo: Number(insumoSelecionado), kgMN: 1 }]);
                        }
                      }} className="bg-orange-600 text-white p-3 rounded-xl"><Plus size={20} /></button>
                    </div>
                    <div className="space-y-3">
                      {dietaAtual.map(item => {
                        const ali = appData.bibliotecaAlimentos.find(a => a.id === item.idInsumo);
                        return (
                          <div key={item.idInsumo} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                             <div className="font-bold text-sm">{ali?.nome}</div>
                             <div className="flex items-center gap-2">
                                <input type="number" step="0.1" value={item.kgMN} onChange={(e) => {
                                  setDietaAtual(dietaAtual.map(d => d.idInsumo === item.idInsumo ? { ...d, kgMN: Number(e.target.value) } : d));
                                }} className="w-16 p-2 text-right font-bold border rounded-lg" />
                                <span className="text-[10px] font-bold text-gray-400">kg MN</span>
                                <button onClick={() => setDietaAtual(dietaAtual.filter(d => d.idInsumo !== item.idInsumo))} className="text-red-400 p-1"><Trash2 size={16} /></button>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-7">
                  <Card className="h-full">
                    <h3 className="text-2xl font-black mb-8 flex items-center"><Activity size={24} className="mr-3 text-green-500" /> 3. Balanço Nutricional</h3>
                    <div className="space-y-10">
                      {[
                        { label: 'Matéria Seca (CMS)', val: indicadoresNutri.fornecido.cms, target: indicadoresNutri.exigencias.cms, unit: 'kg', color: 'orange' },
                        { label: 'Energia Líquida Ganho (ELg)', val: indicadoresNutri.fornecido.elg, target: indicadoresNutri.exigencias.elg, unit: 'Mcal', color: 'red' },
                        { label: 'Proteína Metabolizável (PM)', val: indicadoresNutri.fornecido.pm, target: indicadoresNutri.exigencias.pm, unit: 'g/dia', color: 'blue' }
                      ].map((bar, i) => {
                        const pct = (bar.val / bar.target) * 100;
                        return (
                          <div key={i}>
                            <div className="flex justify-between items-end mb-2">
                              <span className="font-bold text-sm text-gray-500">{bar.label}</span>
                              <span className={`text-xl font-black ${pct >= 95 && pct <= 105 ? 'text-green-600' : 'text-slate-900'}`}>{bar.val.toFixed(2)} / {bar.target.toFixed(2)} <small className="text-gray-400">{bar.unit}</small></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border">
                              <div className={`h-full transition-all duration-500 bg-${bar.color}-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentView === 'animais' && (
            <div className="space-y-6 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Procurar brinco ou nome..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10" />
                  </div>
                  <button className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg hover:bg-green-700 transition-all"><Plus size={20} className="mr-2" /> Novo Animal</button>
               </div>
               <Card className="overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Identificação</th>
                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Lote</th>
                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Peso</th>
                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {animaisProp.filter(a => a.brinco.includes(searchQuery)).map(a => (
                        <tr key={a.id} className="hover:bg-gray-50/50">
                          <td className="px-8 py-5">
                            <div className="font-black text-gray-900">BRINCO #{a.brinco}</div>
                            <div className="text-xs font-bold text-gray-500">{a.raca} | {a.categoria}</div>
                          </td>
                          <td className="px-8 py-5 font-bold text-gray-700 bg-gray-100/50 rounded-xl m-2 inline-block px-3 py-1">{a.lote}</td>
                          <td className="px-8 py-5 font-black text-gray-900">{a.peso} kg</td>
                          <td className="px-8 py-5 text-right"><button className="text-green-600 font-bold hover:underline">Detalhes</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </Card>
            </div>
          )}

          {currentView === 'reproducao' && (
            <div className="space-y-6 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black">Controlo Reprodutivo</h3>
                  <button className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-md"><HeartPulse size={18} className="mr-2" /> Nova Inseminação</button>
               </div>
               <Card>
                  <table className="w-full text-left">
                    <thead>
                       <tr className="text-pink-800 text-xs font-black uppercase tracking-wider bg-pink-50 rounded-xl">
                          <th className="p-4">Matriz</th>
                          <th className="p-4">Data IA</th>
                          <th className="p-4">Previsão Parto</th>
                          <th className="p-4 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody>
                       {appData.reproducao.map(r => (
                         <tr key={r.id} className="border-b border-gray-100">
                            <td className="p-4 font-black">#{r.brincoVaca}</td>
                            <td className="p-4 font-bold text-gray-600">{r.dataInseminacao}</td>
                            <td className="p-4 font-bold text-gray-900">{r.previsaoParto}</td>
                            <td className="p-4 text-right">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${r.status === 'Prenhe' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </Card>
            </div>
          )}

          {currentView === 'financeiro' && (
             <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Receitas</p>
                      <h4 className="text-3xl font-black text-green-600">R$ {totaisFinanceiros.receitas.toLocaleString()}</h4>
                   </div>
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Despesas</p>
                      <h4 className="text-3xl font-black text-red-600">R$ {totaisFinanceiros.despesas.toLocaleString()}</h4>
                   </div>
                   <div className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2 text-white/50">Saldo Final</p>
                      <h4 className={`text-3xl font-black ${saldoAtual >= 0 ? 'text-white' : 'text-red-400'}`}>R$ {saldoAtual.toLocaleString()}</h4>
                   </div>
                </div>
                <Card>
                   <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-400 text-xs font-black uppercase tracking-widest border-b">
                           <th className="pb-4">Data</th>
                           <th className="pb-4">Descrição</th>
                           <th className="pb-4 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financeiroProp.map(f => (
                          <tr key={f.id} className="border-b border-gray-50">
                             <td className="py-4 text-sm text-gray-500">{f.data}</td>
                             <td className="py-4 font-bold">{f.descricao}</td>
                             <td className={`py-4 text-right font-black ${f.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                {f.tipo === 'receita' ? '+' : '-'} R$ {f.valor.toLocaleString()}
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </Card>
             </div>
          )}

          {currentView === 'configuracoes' && (
            <Card className="text-center py-20">
               <Settings size={64} className="text-gray-200 mx-auto mb-6" />
               <h3 className="text-2xl font-black mb-2">Painel de Administração</h3>
               <p className="text-gray-400 mb-8 max-w-sm mx-auto">Gerencie usuários, permissões e exportação de relatórios avançados.</p>
               <div className="flex justify-center gap-4">
                  <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-md"><Download size={18} className="mr-2 inline" /> Exportar CSV</button>
                  <button className="bg-red-50 text-red-600 px-8 py-3 rounded-xl font-bold border border-red-100" onClick={() => { if(confirm('Apagar tudo?')) localStorage.clear(); window.location.reload(); }}>Resetar Banco</button>
               </div>
            </Card>
          )}

          {currentView === 'sanidade' && (
            <div className="space-y-6 animate-in fade-in">
               <div className="flex gap-4">
                  <button onClick={() => setSanidadeSubView('historico')} className={`px-6 py-2 rounded-xl font-bold ${sanidadeSubView === 'historico' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Histórico</button>
                  <button onClick={() => setSanidadeSubView('calendario')} className={`px-6 py-2 rounded-xl font-bold ${sanidadeSubView === 'calendario' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Calendário RO</button>
               </div>
               {sanidadeSubView === 'calendario' ? (
                 <Card>
                    <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-800 text-sm">
                       <ShieldAlert size={24} className="text-orange-500" />
                       <strong>Rondônia Livre de Aftosa:</strong> Foco em Brucelose e Clostridioses.
                    </div>
                    <div className="space-y-3">
                       {appData.calendarioSanitario.map(t => (
                         <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-200/50">
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase">{t.mes}</p>
                               <p className="font-bold">{t.tarefa}</p>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">{t.tipo}</span>
                         </div>
                       ))}
                    </div>
                 </Card>
               ) : (
                 <Card className="text-center py-16 text-gray-400">
                    <Syringe size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Nenhum registro de tratamento recente.</p>
                 </Card>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
