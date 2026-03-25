// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { Tractor, Beef, Activity, LogOut, Bell, Search, Plus, MapPin, DollarSign, HeartPulse, LayoutGrid, X, Trash2, Edit, Baby, LayoutDashboard, Scale, Settings, Sparkles, Bot, Send, Loader2, CheckCircle2, Download, Archive, Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert, Wheat, Calculator, FileText, Syringe, CalendarCheck, Users, ChevronDown } from 'lucide-react';

// --- BASE DE DADOS INICIAL ---
const defaultData = {
  propriedades: [
    { id: 1, nome: "Fazenda São João", responsavel: "Administrador", cidade: "Jaru", estado: "RO", area_ha: 350, ie: "123.456.789-00" }
  ],
  lotes: [
    { id: 1, propId: 1, nome: "Matrizes A", capacidade: 50, tipo: "Pasto", obs: "Pasto Central" },
    { id: 2, propId: 1, nome: "Confinamento 1", capacidade: 100, tipo: "Baia", obs: "Terminação" },
  ],
  animais: [
    { id: 1, propId: 1, brinco: "001", nome: "Mimosa", sexo: "F", categoria: "Vaca", tipo: "Cria", raca: "Nelore", dataNasc: "2020-03-15", peso: 420, pesoInicial: 380, ativo: true, lote: "Matrizes A", obs: "Matriz principal." },
    { id: 2, propId: 1, brinco: "105", nome: "Soberano", sexo: "M", categoria: "Boi Gordo", tipo: "Corte", raca: "Angus", dataNasc: "2024-01-10", peso: 490, pesoInicial: 420, ativo: true, lote: "Confinamento 1", obs: "Fase de terminação." }
  ],
  pesagens: [
    { id: 1, brinco: "105", data: "2025-11-10", pesoAnterior: 400, pesoAtual: 450, obs: "Entrada seca" },
  ],
  reproducao: [],
  nascimentos: [],
  vacinacoes: [
    { id: 1, propId: 1, vacina: "Ivermectina 1%", lote: "Confinamento 1", dataAplicacao: "2026-03-10", proximaDose: null, qtdAnimais: 80, obs: "Controle parasitário", carenciaDias: 35, dataLiberacao: "2026-04-14", status: "concluida" },
  ],
  insumos: [],
  financeiro: [
    { id: 1, propId: 1, descricao: "Venda lote engorda", categoria: "Venda de Gado", tipo: "receita", valor: 68000, data: "2026-02-18", status: "pago" },
    { id: 2, propId: 1, descricao: "Compra Ração", categoria: "Nutrição", tipo: "despesa", valor: 4500, data: "2026-02-20", status: "pago" },
  ],
  bibliotecaAlimentos: [],
  calendarioRO: [
    { id: 1, mes: "Janeiro", vacina: "Brucelose", categoria: "Fêmeas 3-8 meses", obrigatoria: true },
    { id: 2, mes: "Março", vacina: "Clostridioses", categoria: "Todo rebanho (Reforço)", obrigatoria: false },
    { id: 3, mes: "Maio", vacina: "Vermifugação", categoria: "Estratégica (Início Seca)", obrigatoria: false },
    { id: 4, mes: "Novembro", vacina: "Raiva", categoria: "Regiões de risco", obrigatoria: false },
  ]
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPropId, setSelectedPropId] = useState(1);
  const [sanidadeTab, setSanidadeTab] = useState('historico');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modais de Estado
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isPropriedadeFormOpen, setIsPropriedadeFormOpen] = useState(false);

  const [usuarios, setUsuarios] = useState([{ id: 1, nome: "Administrador", email: "gestor@bovigest.com", senha: "123456", tipo: "admin" }]);
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_pro_v12');
    return saved ? JSON.parse(saved) : defaultData;
  });

  useEffect(() => {
    localStorage.setItem('bovigest_data_pro_v12', JSON.stringify(appData));
  }, [appData]);

  // Filtros
  const currentProp = useMemo(() => appData.propriedades.find(p => p.id === selectedPropId) || appData.propriedades[0], [selectedPropId, appData.propriedades]);
  const animaisFiltrados = useMemo(() => appData.animais.filter(a => a.propId === selectedPropId), [selectedPropId, appData.animais]);
  const lotesFiltrados = useMemo(() => appData.lotes.filter(l => l.propId === selectedPropId), [selectedPropId, appData.lotes]);
  const financeiroFiltrado = useMemo(() => appData.financeiro.filter(f => f.propId === selectedPropId), [selectedPropId, appData.financeiro]);

  const totaisFinanceiros = useMemo(() => {
    return financeiroFiltrado.reduce((acc, item) => {
      if (item.status === 'pago') {
        if (item.tipo === 'receita') acc.receitas += Number(item.valor);
        if (item.tipo === 'despesa') acc.despesas += Number(item.valor);
      }
      return acc;
    }, { receitas: 0, despesas: 0 });
  }, [financeiroFiltrado]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center"><Tractor size={64} className="text-green-500" /></div>
          <h1 className="text-4xl font-black text-white tracking-tighter">BoviGest PRO</h1>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
            <input type="email" placeholder="E-mail" className="w-full p-4 bg-slate-800 rounded-xl border-none text-white outline-none ring-2 ring-transparent focus:ring-green-500" defaultValue="gestor@bovigest.com" />
            <input type="password" placeholder="Senha" className="w-full p-4 bg-slate-800 rounded-xl border-none text-white outline-none ring-2 ring-transparent focus:ring-green-500" defaultValue="123456" />
            <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 flex flex-col p-6 space-y-8 fixed h-full">
        <div className="flex items-center gap-3 px-2">
          <Tractor className="text-green-500" size={32} />
          <span className="text-2xl font-black text-white tracking-tighter uppercase">BoviGest</span>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-2xl space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Propriedade Ativa</label>
          <select 
            value={selectedPropId} 
            onChange={(e) => setSelectedPropId(Number(e.target.value))}
            className="w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
          >
            {appData.propriedades.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.nome}</option>)}
          </select>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' },
            { id: 'propriedades', icon: MapPin, label: 'Propriedades' },
            { id: 'animais', icon: Beef, label: 'Rebanho' },
            { id: 'sanidade', icon: ShieldAlert, label: 'Sanidade' },
            { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
            { id: 'configuracoes', icon: Settings, label: 'Configurações' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${currentView === item.id ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Icon size={20} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-10">
        {currentView === 'dashboard' && (
          <div className="max-w-6xl space-y-10">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Olá, Administrador</h1>
                <p className="text-slate-400 font-medium">Gestão ativa em <span className="text-slate-900 font-bold">{currentProp.nome}</span></p>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-2">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Total Animais</p>
                <h3 className="text-4xl font-black">{animaisFiltrados.length}</h3>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-2">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Saldo Global</p>
                <h3 className="text-4xl font-black text-green-600">{formatCurrency(totaisFinanceiros.receitas - totaisFinanceiros.despesas)}</h3>
              </div>
              <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl space-y-2">
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Receitas Totais</p>
                <h3 className="text-4xl font-black">{formatCurrency(totaisFinanceiros.receitas)}</h3>
              </div>
            </div>
          </div>
        )}

        {currentView === 'sanidade' && (
          <div className="max-w-6xl space-y-10">
            <h2 className="text-3xl font-black tracking-tight">Sanidade & Calendário</h2>
            <div className="flex gap-4 border-b border-slate-200">
              <button onClick={() => setSanidadeTab('historico')} className={`px-6 py-3 font-bold transition ${sanidadeTab === 'historico' ? 'text-green-600 border-b-4 border-green-600' : 'text-slate-400'}`}>Histórico</button>
              <button onClick={() => setSanidadeTab('calendario')} className={`px-6 py-3 font-bold transition ${sanidadeTab === 'calendario' ? 'text-green-600 border-b-4 border-green-600' : 'text-slate-400'}`}>Calendário RO</button>
            </div>
            
            {sanidadeTab === 'calendario' && (
              <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-6 font-black text-xs uppercase text-slate-400 tracking-widest">Mês</th>
                      <th className="p-6 font-black text-xs uppercase text-slate-400 tracking-widest">Vacina</th>
                      <th className="p-6 font-black text-xs uppercase text-slate-400 tracking-widest">Público Alvo</th>
                      <th className="p-6 font-black text-xs uppercase text-slate-400 tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {appData.calendarioRO.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-6 font-bold">{c.mes}</td>
                        <td className="p-6 font-bold">{c.vacina}</td>
                        <td className="p-6 text-slate-500 font-medium">{c.categoria}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.obrigatoria ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            {c.obrigatoria ? 'Obrigatória' : 'Recomendada'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentView === 'configuracoes' && (
          <div className="max-w-4xl space-y-12">
            <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Utilizadores do Sistema</h3>
                <button onClick={() => setIsUserFormOpen(true)} className="text-green-600 font-black text-xs uppercase tracking-widest hover:underline">+ Novo</button>
              </div>
              <div className="space-y-4">
                {usuarios.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">{u.nome[0]}</div>
                      <div>
                        <p className="font-black text-slate-900 text-lg">{u.nome}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{u.email} <span className="mx-2 text-slate-200">•</span> {u.tipo}</p>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-red-500 p-3 transition-colors"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-red-50/50 p-10 rounded-[40px] border border-red-100 flex flex-col items-center text-center space-y-6">
               <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center text-red-600"><Settings size={32} /></div>
               <div className="space-y-2">
                 <h4 className="text-xl font-black text-red-900">Área de Perigo</h4>
                 <p className="text-red-600/60 font-medium text-sm max-w-xs">A formatação apaga permanentemente todos os dados locais desta máquina.</p>
               </div>
               <button 
                onClick={() => { if(confirm(\'APAGAR TUDO?\')) { localStorage.clear(); window.location.reload(); } }}
                className="bg-red-600 text-white px-12 py-5 rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-900/20"
               >
                FORMATAR BASE DE DADOS
               </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL USER */}
      {isUserFormOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
          <div className="bg-white w-full max-w-2xl rounded-[48px] p-12 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Novo Utilizador</h3>
              <button onClick={() => setIsUserFormOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={32} /></button>
            </div>
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsUserFormOpen(false); }}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nome Completo</label>
                <input required className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-3xl font-black text-lg outline-none transition" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">E-mail</label>
                  <input type="email" required className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-3xl font-black text-lg outline-none transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Senha</label>
                  <input type="password" required className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-3xl font-black text-lg outline-none transition" />
                </div>
              </div>
              <button className="w-full py-6 bg-green-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-green-900/20 hover:bg-green-700 transition-all">Criar Acesso</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
