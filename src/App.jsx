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
    { id: 1, propId: 1, descricao: "Sal Mineral", categoria: "Nutrição", tipo: "despesa", valor: 2500, data: "2026-03-01", status: "pago" },
    { id: 2, propId: 1, descricao: "Venda Bezerros", categoria: "Venda Gado", tipo: "receita", valor: 15000, data: "2026-02-20", status: "recebido" }
  ],
  vacinacoes: [],
  calendarioSanitario: [
    { id: 1, mes: "Janeiro", tarefa: "Vacinação Brucelose (Fêmeas 3-8 meses)", tipo: "Obrigatória" },
    { id: 2, mes: "Maio", tarefa: "Vermifugação Estratégica (Início da Seca)", tipo: "Manejo" },
    { id: 3, mes: "Novembro", tarefa: "Vacinação Clostridioses", tipo: "Recomendada" },
    { id: 4, mes: "Contínuo", tarefa: "Controle de Ectoparasitas (Carrapato/Mosca)", tipo: "Sanidade" }
  ]
};

function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-800 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_v2');
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPropId, setSelectedPropId] = useState(appData.selectedPropId || 1);
  const [sanidadeSubView, setSanidadeSubView] = useState('historico');

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

  const indicadores = useMemo(() => {
    const despesas = financeiroProp
      .filter(f => f.tipo === 'despesa')
      .reduce((acc, f) => acc + f.valor, 0);
    const receitas = financeiroProp
      .filter(f => f.tipo === 'receita')
      .reduce((acc, f) => acc + f.valor, 0);
    const ganhoPesoTotal = animaisProp.reduce((acc, a) => acc + (a.peso - (a.pesoInicial || a.peso)), 0);
    const arrobasProduzidas = ganhoPesoTotal / 15;
    const custoPorArroba = arrobasProduzidas > 0 ? despesas / arrobasProduzidas : 0;
    
    return { despesas, receitas, arrobasProduzidas, custoPorArroba };
  }, [animaisProp, financeiroProp]);

  useEffect(() => {
    localStorage.setItem('bovigest_data_v2', JSON.stringify(appData));
  }, [appData]);

  const navItems = [
    { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard },
    { id: 'propriedades', label: 'Propriedades', icon: MapPin },
    { id: 'rebanho', label: 'Rebanho', icon: Beef },
    { id: 'sanidade', label: 'Sanidade', icon: ShieldAlert },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-xl">
            <Tractor size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            BoviGest
          </h1>
        </div>

        <div className="px-4 mb-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Propriedade Ativa
            </label>
            <select 
              value={selectedPropId}
              onChange={(e) => setSelectedPropId(Number(e.target.value))}
              className="w-full bg-slate-800 border-none rounded-xl p-2 text-sm font-bold text-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              {appData.propriedades.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize">{currentView}</h2>
            <div className="h-4 w-px bg-slate-700 mx-2" />
            <span className="text-slate-500 text-sm font-medium">{currentProp?.nome}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-500/10 p-2 rounded-lg"><Activity className="text-blue-400" size={20} /></div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Gasto por @ Produzida</p>
                <h3 className="text-2xl font-black text-white">R$ {indicadores.custoPorArroba.toFixed(2)}</h3>
                <p className="text-[10px] text-slate-500 mt-2">Eficiência produtiva baseada em custos diretos</p>
              </Card>
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-500/10 p-2 rounded-lg"><Beef className="text-green-400" size={20} /></div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total de Animais</p>
                <h3 className="text-2xl font-black text-white">{animaisProp.length}</h3>
                <p className="text-[10px] text-slate-500 mt-2">Cabeças ativas nesta propriedade</p>
              </Card>
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-500/10 p-2 rounded-lg"><Scale className="text-orange-400" size={20} /></div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Ganho de Peso Total</p>
                <h3 className="text-2xl font-black text-white">{animaisProp.reduce((acc, a) => acc + (a.peso - a.pesoInicial), 0)} kg</h3>
                <p className="text-[10px] text-slate-500 mt-2">~{indicadores.arrobasProduzidas.toFixed(1)} @ produzidas</p>
              </Card>
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-500/10 p-2 rounded-lg"><DollarSign className="text-purple-400" size={20} /></div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Fluxo Mensal (Saldo)</p>
                <h3 className={`text-2xl font-black ${indicadores.receitas - indicadores.despesas >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  R$ {(indicadores.receitas - indicadores.despesas).toLocaleString()}
                </h3>
                <p className="text-[10px] text-slate-500 mt-2">Receita total menos despesas do período</p>
              </Card>
            </div>
          )}

          {currentView === 'propriedades' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appData.propriedades.map(p => (
                  <Card key={p.id} className={selectedPropId === p.id ? 'ring-2 ring-green-500 border-transparent' : ''}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-white">{p.nome}</h4>
                        <p className="text-sm text-slate-400">{p.cidade} - {p.estado}</p>
                      </div>
                      <button onClick={() => setSelectedPropId(p.id)} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Área</p>
                        <p className="text-sm font-bold">{p.area_ha} ha</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">IE</p>
                        <p className="text-sm font-bold">{p.ie}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentView === 'rebanho' && (
            <Card className="overflow-hidden border border-slate-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-700">
                    <th className="px-6 py-4">Brinco</th>
                    <th className="px-6 py-4">Animal</th>
                    <th className="px-6 py-4">Lote</th>
                    <th className="px-6 py-4">Peso Atual</th>
                    <th className="px-6 py-4">GMD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {animaisProp.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-black text-green-400">#{a.brinco}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{a.nome}</div>
                        <div className="text-[10px] text-slate-500">{a.raca} | {a.categoria}</div>
                      </td>
                      <td className="px-6 py-4"><span className="bg-slate-700 px-2 py-1 rounded-md text-[10px] font-bold">{a.lote}</span></td>
                      <td className="px-6 py-4 font-bold">{a.peso} kg</td>
                      <td className="px-6 py-4 text-green-400 font-bold">+{(a.peso - a.pesoInicial).toFixed(1)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {currentView === 'sanidade' && (
            <div className="space-y-6">
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setSanidadeSubView('historico')}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${sanidadeSubView === 'historico' ? 'bg-green-600 shadow-lg shadow-green-900/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Histórico de Manejo
                </button>
                <button 
                  onClick={() => setSanidadeSubView('calendario')}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${sanidadeSubView === 'calendario' ? 'bg-green-600 shadow-lg shadow-green-900/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Calendário RO
                </button>
              </div>

              {sanidadeSubView === 'calendario' ? (
                <Card>
                  <div className="flex items-center gap-3 mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <ShieldAlert className="text-orange-400" size={24} />
                    <p className="text-sm text-orange-200">
                      <strong>Atenção Rondônia:</strong> Estado livre de Aftosa sem vacinação. Foco total em Brucelose e Clostridioses.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {appData.calendarioSanitario.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{task.mes}</p>
                          <p className="font-bold">{task.tarefa}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${task.type === 'Obrigatória' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {task.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Syringe size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">Nenhum registro de vacinação recente</p>
                  <button className="mt-4 text-green-500 font-bold hover:underline">Registrar aplicação</button>
                </Card>
              )}
            </div>
          )}

          {currentView === 'financeiro' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Saídas Totais</p>
                  <h3 className="text-3xl font-black text-red-400">R$ {indicadores.despesas.toLocaleString()}</h3>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Entradas Totais</p>
                  <h3 className="text-3xl font-black text-green-400">R$ {indicadores.receitas.toLocaleString()}</h3>
                </Card>
              </div>
              <Card>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase font-bold border-b border-slate-700">
                      <th className="pb-4">Data</th>
                      <th className="pb-4">Descrição</th>
                      <th className="pb-4">Categoria</th>
                      <th className="pb-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {financeiroProp.map(f => (
                      <tr key={f.id}>
                        <td className="py-4 text-sm">{f.data}</td>
                        <td className="py-4 font-bold">{f.descricao}</td>
                        <td className="py-4 text-xs text-slate-400">{f.categoria}</td>
                        <td className={`py-4 text-right font-bold ${f.tipo === 'despesa' ? 'text-red-400' : 'text-green-400'}`}>
                          {f.tipo === 'despesa' ? '-' : '+'} R$ {f.valor.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {currentView === 'configuracoes' && (
            <Card>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold">Gestão de Acessos</h3>
                  <p className="text-sm text-slate-400">Controle quem pode editar os dados da fazenda</p>
                </div>
                <button className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
                  <Plus size={18} /> Novo Usuário
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center font-black text-white">VG</div>
                    <div>
                      <p className="font-bold">Vinicius Gasparini</p>
                      <p className="text-xs text-slate-500">vgasparini@bovigest.com</p>
                    </div>
                  </div>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">Dono / Admin</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
