// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { // @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search, 
  Plus, MapPin, DollarSign, HeartPulse, LayoutGrid, X, Trash2, 
  Edit, Baby, LayoutDashboard, Scale, Settings, Sparkles, Bot, Send, 
  Loader2, CheckCircle2, Download, Archive, Target, PackagePlus, 
  AlertTriangle, ListPlus, ShieldAlert, Wheat, Calculator, FileText, 
  Syringe, CalendarCheck, Users, ChevronRight 
} from 'lucide-react';

// --- BASE DE DADOS INICIAL ---
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
  financeiro: [
    { id: 1, propId: 1, descricao: "Sal Mineral", categoria: "Nutrição", tipo: "despesa", valor: 2500, data: "2024-03-01", status: "pago" }
  ],
  vacinacoes: [],
  calendarioSanitario: [
    { id: 1, mes: "Janeiro", tarefa: "Vacinação Brucelose (Fêmeas 3-8 meses)", tipo: "Obrigatória" },
    { id: 2, mes: "Maio", tarefa: "Vermifugação Estratégica (Início da Seca)", tipo: "Manejo" },
    { id: 3, mes: "Novembro", tarefa: "Vacinação Clostridioses", tipo: "Recomendada" },
    { id: 4, mes: "Contínuo", tarefa: "Controle de Ectoparasitas", tipo: "Sanidade" }
  ]
};

export default function App() {
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_v2');
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPropId, setSelectedPropId] = useState(appData.selectedPropId || 1);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [sanidadeSubView, setSanidadeSubView] = useState('historico');

  // --- PERSISTÊNCIA ---
  useEffect(() => {
    localStorage.setItem('bovigest_data_v2', JSON.stringify(appData));
  }, [appData]);

  // --- DADOS FILTRADOS ---
  const currentProp = useMemo(() => 
    appData.propriedades.find(p => p.id === selectedPropId) || appData.propriedades[0], 
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

  // --- CÁLCULOS ---
  const indicadores = useMemo(() => {
    const despesas = financeiroProp.filter(f => f.tipo === 'despesa').reduce((acc, f) => acc + f.valor, 0);
    const ganhoPesoTotal = animaisProp.reduce((acc, a) => acc + (a.peso - (a.pesoInicial || a.peso)), 0);
    const arrobasProduzidas = ganhoPesoTotal / 15;
    const custoPorArroba = arrobasProduzidas > 0 ? despesas / arrobasProduzidas : 0;
    return { despesas, arrobasProduzidas, custoPorArroba };
  }, [animaisProp, financeiroProp]);

  // --- COMPONENTES DE UI ---
  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setCurrentView(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        currentView === id ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] border-r border-slate-800 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <Tractor className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white italic">BoviGest<span className="text-green-500">PRO</span></h1>
        </div>

        <div className="mb-8">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block px-2">Propriedade Ativa</label>
          <select 
            value={selectedPropId} 
            onChange={(e) => setSelectedPropId(Number(e.target.value))}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none cursor-pointer"
          >
            {appData.propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Painel Central" id="dashboard" />
          <SidebarItem icon={MapPin} label="Propriedades" id="propriedades" />
          <SidebarItem icon={Beef} label="Rebanho" id="rebanho" />
          <SidebarItem icon={HeartPulse} label="Sanidade" id="sanidade" />
          <SidebarItem icon={DollarSign} label="Financeiro" id="financeiro" />
          <div className="pt-4 mt-4 border-t border-slate-800">
            <SidebarItem icon={Settings} label="Configurações" id="configuracoes" />
          </div>
        </nav>

        <div className="mt-auto pt-6">
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">V</div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Vinicius</p>
                <p className="text-[10px] text-slate-500 mt-1">Plano Premium</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors p-2">
              <LogOut size={14} /> Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0f172a] p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white capitalize">{currentView.replace('-', ' ')}</h2>
            <p className="text-slate-500 text-sm mt-1">{currentProp?.nome} • {currentProp?.cidade}-{currentProp?.estado}</p>
          </div>
          <div className="flex gap-4">
            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar animal..." 
                className="bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-500 outline-none w-64 text-white"
              />
            </div>
          </div>
        </header>

        {/* Views */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                <Beef size={24} />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Rebanho</p>
              <h3 className="text-4xl font-black text-white mt-2">{animaisProp.length} <span className="text-lg font-medium text-slate-500 italic">cabeças</span></h3>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="bg-green-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-green-500 mb-4">
                <Scale size={24} />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Produção Acumulada</p>
              <h3 className="text-4xl font-black text-white mt-2">{indicadores.arrobasProduzidas.toFixed(1)} <span className="text-lg font-medium text-slate-500 italic">@</span></h3>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
                <Calculator size={24} />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Custo por @</p>
              <h3 className="text-4xl font-black text-white mt-2">R$ {indicadores.custoPorArroba.toFixed(2)}</h3>
              <p className="text-slate-500 text-[10px] mt-2 italic font-medium">Eficiência produtiva da safra</p>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="bg-red-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-red-500 mb-4">
                <DollarSign size={24} />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Despesas</p>
              <h3 className="text-4xl font-black text-white mt-2">R$ {indicadores.despesas.toLocaleString()}</h3>
            </div>
          </div>
        )}

        {currentView === 'sanidade' && (
          <div className="space-y-6">
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-2xl w-fit">
              <button 
                onClick={() => setSanidadeSubView('historico')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${sanidadeSubView === 'historico' ? 'bg-green-600 text-white shadow-lg shadow-green-900/30' : 'text-slate-400 hover:text-white'}`}
              >
                Histórico de Vacinas
              </button>
              <button 
                onClick={() => setSanidadeSubView('calendario')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${sanidadeSubView === 'calendario' ? 'bg-green-600 text-white shadow-lg shadow-green-900/30' : 'text-slate-400 hover:text-white'}`}
              >
                Calendário RO
              </button>
            </div>

            {sanidadeSubView === 'calendario' ? (
              <div className="bg-[#1e293b] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Cronograma Sanitário Rondônia</h3>
                      <p className="text-xs text-slate-500">Status: Livre de Aftosa sem vacinação</p>
                    </div>
                  </div>
                  <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                    <Download size={14} /> Baixar PDF
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mês</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Procedimento</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria Alvo</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {appData.calendarioSanitario.map(task => (
                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">{task.mes}</td>
                          <td className="p-4">
                            <div className="font-medium text-slate-200">{task.tarefa}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">{task.tipo}</div>
                          </td>
                          <td className="p-4 text-slate-400 text-sm">Todo o Rebanho</td>
                          <td className="p-4">
                            <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter">Agendado</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e293b] rounded-3xl p-12 text-center border border-slate-800 border-dashed">
                <Syringe size={48} className="mx-auto text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">Nenhum registro encontrado</h3>
                <p className="text-slate-600 mt-2 max-w-xs mx-auto">Lance as vacinações do seu rebanho para gerar o histórico completo.</p>
                <button className="mt-6 bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                  Adicionar Vacinação
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'configuracoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <Users className="text-green-500" size={24} />
                <h3 className="text-xl font-bold text-white tracking-tight">Gestão de Usuários</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">AG</div>
                    <div>
                      <p className="font-bold text-white text-sm">Administrador</p>
                      <p className="text-xs text-slate-500">gestor@bovigest.com • Master</p>
                    </div>
                  </div>
                  <button className="text-slate-600 hover:text-red-400 p-2"><Trash2 size={18} /></button>
                </div>
              </div>

              <button 
                onClick={() => setIsUserFormOpen(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all border border-slate-700"
              >
                Adicionar Novo Usuário
              </button>
            </div>

            <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <ShieldAlert className="text-amber-500" size={24} />
                <h3 className="text-xl font-bold text-white tracking-tight">Segurança e Sistema</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Logs de Atividade</label>
                  <select className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-sm font-bold text-white outline-none">
                    <option>Visualizar Últimos 30 dias</option>
                    <option>Visualizar Últimos 90 dias</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                    Atenção: O reset do banco de dados removerá permanentemente todos os animais, propriedades e registros financeiros salvos localmente.
                  </p>
                  <button className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-2xl transition-all border border-red-500/20 uppercase tracking-widest text-xs">
                    Resetar Banco de Dados
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

  Tractor, Beef, Activity, LogOut, Bell, Search, 
  Plus, MapPin, DollarSign, HeartPulse, LayoutGrid, X, Trash2, 
  Edit, Baby, LayoutDashboard, Scale, Settings, 
  Sparkles, Bot, Send, Loader2, CheckCircle2, Download,
  Archive, Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert,
  Wheat, Calculator, FileText, Syringe, CalendarCheck, Users, ChevronRight
} from 'lucide-react';

// --- BASE DE DADOS INICIAL ATUALIZADA ---
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
  financeiro: [
    { id: 1, propId: 1, descricao: "Sal Mineral", categoria: "Nutrição", tipo: "despesa", valor: 2500, data: "2026-03-01", status: "pago" }
  ],
  vacinacoes: [],
  calendarioSanitario: [
    { id: 1, mes: "Janeiro", tarefa: "Vacinação Brucelose (Fêmeas 3-8 meses)", tipo: "Obrigatória" },
    { id: 2, mes: "Maio", tarefa: "Vermifugação Estratégica (Início da Seca)", tipo: "Manejo" },
    { id: 3, mes: "Novembro", tarefa: "Vacinação Clostridioses", tipo: "Recomendada" },
    { id: 4, mes: "Contínuo", tarefa: "Controle de Ectoparasitas (Carrapato/Mosca)", tipo: "Sanidade" }
  ]
};

export default function App() {
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_v2');
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPropId, setSelectedPropId] = useState(appData.selectedPropId || 1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [sanidadeSubView, setSanidadeSubView] = useState('historico'); // 'historico' ou 'calendario'

  // --- FILTROS POR PROPRIEDADE ---
  const currentProp = useMemo(() => appData.propriedades.find(p => p.id === selectedPropId), [selectedPropId, appData.propriedades]);
  const animaisProp = useMemo(() => appData.animais.filter(a => a.propId === selectedPropId), [selectedPropId, appData.animais]);
  const financeiroProp = useMemo(() => appData.financeiro.filter(f => f.propId === selectedPropId), [selectedPropId, appData.financeiro]);

  // --- CÁLCULO GASTO POR @ PRODUZIDA ---
  const indicadores@ = useMemo(() => {
    const despesas = financeiroProp.filter(f => f.tipo === 'despesa').reduce((acc, f) => acc + f.valor, 0);
    const ganhoPesoTotal = animaisProp.reduce((acc, a) => acc + (a.peso - (a.pesoInicial || a.peso)), 0);
    const arrobasProduzidas = ganhoPesoTotal / 15;
    const custoPorArroba = arrobasProduzidas > 0 ? despesas / arrobasProduzidas : 0;
    
    return { despesas, arrobasProduzidas, custoPorArroba };
  }, [animaisProp, financeiroProp]);

  useEffect(() => {
    localStorage.setItem('bovigest_data_v2', JSON.stringify(appData));
  }, [appData]);

  // UI Components e Logic continuam aqui...
  // (Omiti o restante da UI por brevidade, mas as variáveis acima integram as novas abas)

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar com Seletor de Propriedade */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <h1 className="text-2xl font-black text-green-500 mb-8 flex items-center gap-2">
          <Tractor size={32} /> BoviGest RO
        </h1>
        
        <div className="mb-6">
          abel className="text-xs font-bold text-slate-500 uppercase mb-2 block">Propriedade Ativa</label>
          <select 
            value={selectedPropId} 
            onChange={(e) => setSelectedPropId(Number(e.target.value))}
            className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-green-500"
          >
            {appData.propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {/* Itens de Navegação */}
        <nav className="flex-1 space-y-2">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${currentView === 'dashboard' ? 'bg-green-600' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Painel Central
          </button>
          <button onClick={() => setCurrentView('sanidade')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${currentView === 'sanidade' ? 'bg-green-600' : 'hover:bg-slate-800'}`}>
            <ShieldAlert size={20} /> Sanidade
          </button>
          <button onClick={() => setCurrentView('configuracoes')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${currentView === 'configuracoes' ? 'bg-green-600' : 'hover:bg-slate-800'}`}>
            <Settings size={20} /> Configurações Admin
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-10">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Resumo: {currentProp?.nome}</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <p className="text-slate-400 text-sm font-medium">Gasto por @ Produzida</p>
                <h3 className="text-3xl font-black text-orange-500">R$ {indicadores@.custoPorArroba.toFixed(2)}</h3>
                <p className="text-xs text-slate-500 mt-2">Baseado em {indicadores@.arrobasProduzidas.toFixed(1)} @ produzidas</p>
              </div>
              {/* Outros cards... */}
            </div>
          </div>
        )}

        {currentView === 'sanidade' && (
          <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-800 pb-4">
              <button onClick={() => setSanidadeSubView('historico')} className={`px-4 py-2 rounded-lg font-bold ${sanidadeSubView === 'historico' ? 'bg-green-600' : 'bg-slate-800'}`}>Histórico</button>
              <button onClick={() => setSanidadeSubView('calendario')} className={`px-4 py-2 rounded-lg font-bold ${sanidadeSubView === 'calendario' ? 'bg-green-600' : 'bg-slate-800'}`}>Calendário RO</button>
            </div>

            {sanidadeSubView === 'calendario' && (
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
                <h3 className="text-xl font-bold mb-4">Calendário Sanitário de Rondônia</h3>
                <p className="text-sm text-yellow-500 mb-6 font-medium">⚠️ Rondônia é livre de Aftosa sem vacinação. Foco em Brucelose e Clostridioses.</p>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase font-bold">
                      <th className="pb-4">Mês</th>
                      <th className="pb-4">Tarefa / Vacina</th>
                      <th className="pb-4">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {appData.calendarioSanitario.map(task => (
                      <tr key={task.id} className="text-sm">
                        <td className="py-4 font-bold">{task.mes}</td>
                        <td className="py-4">{task.tarefa}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${task.tipo === 'Obrigatória' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {task.tipo}
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
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3"><Users /> Gestão de Administrador</h2>
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold">Utilizadores Registados</h4>
                <button onClick={() => setIsUserFormOpen(true)} className="bg-green-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Plus size={18} /> Novo Acesso
                </button>
              </div>
              {/* Lista de usuários e permissões... */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl">
                  <div>
                    <p className="font-bold">Vinicius Gasparini</p>
                    <p className="text-xs text-slate-500">vgasparini@bovigest.com</p>
                  </div>
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-black">ADMIN</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
