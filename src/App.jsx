// @ts-nocheck
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
    { id: 1, propId: 1, descricao: "Sal Mineral", categoria: "Nutrição", tipo: "despesa", valor: 2500, data: "2024-03-01", status: "pago" },
    { id: 2, propId: 1, descricao: "Venda Gado", categoria: "Receita", tipo: "receita", valor: 65000, data: "2024-03-10", status: "recebido" }
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
  const [sanidadeSubView, setSanidadeSubView] = useState('historico');

  useEffect(() => {
    localStorage.setItem('bovigest_data_v2', JSON.stringify(appData));
  }, [appData]);

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

  const indicadoresFinanceiros = useMemo(() => {
    const despesas = financeiroProp.filter(f => f.tipo === 'despesa').reduce((acc, f) => acc + f.valor, 0);
    const receitas = financeiroProp.filter(f => f.tipo === 'receita').reduce((acc, f) => acc + f.valor, 0);
    const ganhoPesoTotal = animaisProp.reduce((acc, a) => acc + (a.peso - (a.pesoInicial || a.peso)), 0);
    const arrobasProduzidas = ganhoPesoTotal / 15;
    const custoPorArroba = arrobasProduzidas > 0 ? despesas / arrobasProduzidas : 0;
    const saldo = receitas - despesas;
    return { despesas, receitas, arrobasProduzidas, custoPorArroba, saldo };
  }, [animaisProp, financeiroProp]);

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setCurrentView(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        currentView === id ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
          <h1 className="text-2xl font-black text-white italic">BoviGest<span className="text-green-500">PRO</span></h1>
        </div>

        <div className="mb-8">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block px-2">Propriedade Ativa</label>
          <select 
            value={selectedPropId} 
            onChange={(e) => setSelectedPropId(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-green-500"
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0f172a] p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white capitalize">{currentView.replace('-', ' ')}</h2>
            <p className="text-slate-500 text-sm mt-1">{currentProp?.nome} • {currentProp?.cidade}</p>
          </div>
        </header>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <Beef className="text-blue-500 mb-4" size={32} />
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Rebanho</p>
              <h3 className="text-4xl font-black text-white mt-2">{animaisProp.length}</h3>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <Scale className="text-green-500 mb-4" size={32} />
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Produção Acumulada</p>
              <h3 className="text-4xl font-black text-white mt-2">{indicadoresFinanceiros.arrobasProduzidas.toFixed(1)} <span className="text-lg">@</span></h3>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <Calculator className="text-amber-500 mb-4" size={32} />
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Custo por @</p>
              <h3 className="text-4xl font-black text-white mt-2">R$ {indicadoresFinanceiros.custoPorArroba.toFixed(2)}</h3>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <DollarSign className="text-red-500 mb-4" size={32} />
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Saldo Global</p>
              <h3 className={`text-4xl font-black mt-2 ${indicadoresFinanceiros.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                R$ {Math.abs(indicadoresFinanceiros.saldo).toLocaleString()}
              </h3>
            </div>
          </div>
        )}

        {/* Propriedades View */}
        {currentView === 'propriedades' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appData.propriedades.map(p => (
              <div key={p.id} className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
                <MapPin className="text-green-500 mb-4" size={24} />
                <h4 className="text-xl font-bold text-white">{p.nome}</h4>
                <p className="text-slate-500">{p.cidade} - {p.estado}</p>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400 uppercase font-bold">Responsável: {p.responsavel}</p>
                  <p className="text-xs text-slate-400 uppercase font-bold">Área: {p.area_ha} ha</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rebanho View */}
        {currentView === 'rebanho' && (
          <div className="bg-[#1e293b] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Brinco</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Animal</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Categoria</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Peso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {animaisProp.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-green-500">#{a.brinco}</td>
                    <td className="p-4 text-white font-bold">{a.nome}</td>
                    <td className="p-4 text-slate-400">{a.categoria}</td>
                    <td className="p-4 text-white font-black">{a.peso} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Financeiro View */}
        {currentView === 'financeiro' && (
          <div className="space-y-4">
            {financeiroProp.map(f => (
              <div key={f.id} className="bg-[#1e293b] p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${f.tipo === 'despesa' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {f.tipo === 'despesa' ? <Trash2 size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{f.descricao}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{f.categoria} • {f.data}</p>
                  </div>
                </div>
                <p className={`font-black text-lg ${f.tipo === 'despesa' ? 'text-red-500' : 'text-green-500'}`}>
                  {f.tipo === 'despesa' ? '-' : '+'} R$ {f.valor.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Sanidade View */}
        {currentView === 'sanidade' && (
          <div className="space-y-6">
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-2xl w-fit">
              <button onClick={() => setSanidadeSubView('historico')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${sanidadeSubView === 'historico' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>Histórico</button>
              <button onClick={() => setSanidadeSubView('calendario')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${sanidadeSubView === 'calendario' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>Calendário RO</button>
            </div>
            {sanidadeSubView === 'calendario' && (
              <div className="bg-[#1e293b] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Mês</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Procedimento</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {appData.calendarioSanitario.map(task => (
                      <tr key={task.id}>
                        <td className="p-4 font-bold text-white">{task.mes}</td>
                        <td className="p-4 text-sm">{task.tarefa}</td>
                        <td className="p-4"><span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase ${task.tipo === 'Obrigatória' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{task.tipo}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {sanidadeSubView === 'historico' && (
              <div className="bg-[#1e293b] rounded-3xl p-12 text-center border border-slate-800 border-dashed">
                <Syringe size={48} className="mx-auto text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">Lance as vacinações para ver o histórico</h3>
              </div>
            )}
          </div>
        )}

        {/* Configurações View */}
        {currentView === 'configuracoes' && (
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Administração do Sistema</h3>
            <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">VG</div>
                <div>
                  <p className="font-bold text-white">Vinicius Gasparini</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Admin Master</p>
                </div>
              </div>
              <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter">Status Ativo</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
