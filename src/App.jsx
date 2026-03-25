// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
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
