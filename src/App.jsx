// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search, 
  Plus, MapPin, DollarSign, HeartPulse, LayoutGrid, X, Trash2, 
  Edit, Baby, LayoutDashboard, Scale, Settings, 
  Sparkles, Bot, Send, Loader2, CheckCircle2, Download,
  Archive, Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert,
  Wheat, Calculator, FileText, Syringe, CalendarCheck, Users, ChevronDown
} from 'lucide-react';

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
  const [sanidadeTab, setSanidadeTab] = useState('historico'); // 'historico' ou 'calendario'
  const [searchQuery, setSearchQuery] = useState('');
  
  const [usuarios, setUsuarios] = useState([{ id: 1, nome: "Administrador", email: "gestor@bovigest.com", senha: "123456", tipo: "admin" }]);
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_pro_v12');
    return saved ? JSON.parse(saved) : defaultData;
  });

  useEffect(() => {
    localStorage.setItem('bovigest_data_pro_v12', JSON.stringify(appData));
  }, [appData]);

  // --- FILTROS POR PROPRIEDADE SELECIONADA ---
  const currentProp = useMemo(() => appData.propriedades.find(p => p.id === selectedPropId) || appData.propriedades[0], [selectedPropId, appData.propriedades]);
  
  const animaisFiltrados = useMemo(() => appData.animais.filter(a => a.propId === selectedPropId), [selectedPropId, appData.animais]);
  const lotesFiltrados = useMemo(() => appData.lotes.filter(l => l.propId === selectedPropId), [selectedPropId, appData.lotes]);
  const financeiroFiltrado = useMemo(() => appData.financeiro.filter(f => f.propId === selectedPropId), [selectedPropId, appData.financeiro]);

  // --- CÁLCULOS ---
  const totaisFinanceiros = useMemo(() => {
    return financeiroFiltrado.reduce((acc, item) => {
      if (item.status === 'pago') {
        if (item.tipo === 'receita') acc.receitas += Number(item.valor);
        if (item.tipo === 'despesa') acc.despesas += Number(item.valor);
      }
      return acc;
    }, { receitas: 0, despesas: 0 });
  }, [financeiroFiltrado]);

  const gastoPorArroba = useMemo(() => {
    const despesasTotais = totaisFinanceiros.despesas;
    const ganhoPesoTotal = animaisFiltrados.reduce((acc, a) => acc + (a.weight - (a.pesoInicial || a.peso)), 0);
    // Nota: usei 'weight' por engano no pensamento anterior, corrigindo para 'peso'
    const ganhoPesoTotalReal = animaisFiltrados.reduce((acc, a) => acc + (Number(a.peso) - (Number(a.pesoInicial) || Number(a.peso))), 0);
    const arrobasProduzidas = ganhoPesoTotalReal / 15;
    return arrobasProduzidas > 0 ? despesasTotais / arrobasProduzidas : 0;
  }, [totaisFinanceiros, animaisFiltrados]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!isLoggedIn) {
    return (
      <div className=\"min-h-screen bg-slate-950 flex items-center justify-center p-6\">
        <div className=\"w-full max-w-md space-y-8 bg-slate-900 p-10 rounded-3xl border border-slate-800\">
          <div className=\"text-center\"><h1 className=\"text-4xl font-black text-green-500\">BoviGest</h1><p className=\"text-slate-400 mt-2\">Gestão Inteligente de Rebanho</p></div>
          <form className=\"space-y-4\" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
            <input type=\"email\" placeholder=\"E-mail\" className=\"w-full p-4 bg-slate-800 rounded-xl border-none text-white\" defaultValue=\"gestor@bovigest.com\" />
            <input type=\"password\" placeholder=\"Senha\" className=\"w-full p-4 bg-slate-800 rounded-xl border-none text-white\" defaultValue=\"123456\" />
            <button className=\"w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition\">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className=\"flex h-screen bg-slate-950 text-slate-100\">
      {/* SIDEBAR */}
      <aside className=\"w-72 bg-slate-900 border-r border-slate-800 flex flex-col p-6\">
        <div className=\"mb-10\"><h1 className=\"text-2xl font-black text-green-500 flex items-center gap-2\"><Tractor size={28}/> BoviGest</h1></div>
        
        {/* SELEÇÃO DE PROPRIEDADE */}
        <div className=\"mb-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700\">
          <label className=\"text-[10px] font-bold text-slate-500 uppercase mb-2 block\">Propriedade Ativa</label>
          <select 
            value={selectedPropId} 
            onChange={(e) => setSelectedPropId(Number(e.target.value))}
            className=\"w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer\"
          >
            {appData.propriedades.map(p => <option key={p.id} value={p.id} className=\"bg-slate-900 text-white\">{p.nome}</option>)}
          </select>
        </div>

        <nav className=\"flex-1 space-y-2\">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${currentView === item.id ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Icon size={20}/> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <main className=\"flex-1 overflow-auto p-10\">
        {currentView === 'dashboard' && (
          <div className=\"space-y-8\">
            <div className=\"flex justify-between items-end\">
              <div><h2 className=\"text-3xl font-bold\">Olá, Administrador</h2><p className=\"text-slate-400\">Fazenda Atual: {currentProp.nome}</p></div>
            </div>
            <div className=\"grid grid-cols-4 gap-6\">
              <div className=\"bg-slate-900 p-6 rounded-3xl border border-slate-800\">
                <p className=\"text-slate-500 text-xs font-bold uppercase\">Gasto por @ Produzida</p>
                <h3 className=\"text-2xl font-black mt-2 text-orange-400\">{formatCurrency(gastoPorArroba)}</h3>
              </div>
              <div className=\"bg-slate-900 p-6 rounded-3xl border border-slate-800\">
                <p className=\"text-slate-500 text-xs font-bold uppercase\">Total Animais</p>
                <h3 className=\"text-2xl font-black mt-2\">{animaisFiltrados.length}</h3>
              </div>
              <div className=\"bg-slate-900 p-6 rounded-3xl border border-slate-800\">
                <p className=\"text-slate-500 text-xs font-bold uppercase\">Saldo Global</p>
                <h3 className=\"text-2xl font-black mt-2 text-green-400\">{formatCurrency(totaisFinanceiros.receitas - totaisFinanceiros.despesas)}</h3>
              </div>
            </div>
          </div>
        )}

        {currentView === 'sanidade' && (
          <div className=\"space-y-6\">
            <div className=\"flex gap-4 border-b border-slate-800 pb-2\">
              <button onClick={() => setSanidadeTab('historico')} className={`px-4 py-2 font-bold ${sanidadeTab === 'historico' ? 'text-green-500 border-b-2 border-green-500' : 'text-slate-500'}`}>Histórico</button>
              <button onClick={() => setSanidadeTab('calendario')} className={`px-4 py-2 font-bold ${sanidadeTab === 'calendario' ? 'text-green-500 border-b-2 border-green-500' : 'text-slate-500'}`}>Calendário RO</button>
            </div>
            
            {sanidadeTab === 'calendario' && (
              <div className=\"bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden\">
                <div className=\"p-6 bg-slate-800/50 border-b border-slate-800\">
                  <h3 className=\"font-bold\">Calendário Sanitário - Estado de Rondônia</h3>
                  <p className=\"text-xs text-slate-400\">Vacinações obrigatórias e recomendadas para a região.</p>
                </div>
                <div className=\"p-6\">
                  <table className=\"w-full text-left\">
                    <thead><tr className=\"text-slate-500 text-xs font-bold uppercase\"><th className=\"pb-4\">Mês</th><th className=\"pb-4\">Vacina / Ação</th><th className=\"pb-4\">Público Alvo</th><th className=\"pb-4\">Status</th></tr></thead>
                    <tbody className=\"divide-y divide-slate-800\">
                      {appData.calendarioRO.map(c => (
                        <tr key={c.id}>
                          <td className=\"py-4 font-bold\">{c.mes}</td>
                          <td className=\"py-4\">{c.vacina}</td>
                          <td className=\"py-4 text-slate-400\">{c.categoria}</td>
                          <td className=\"py-4\"><span className={`px-2 py-1 rounded-md text-[10px] font-black ${c.obrigatoria ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{c.obrigatoria ? 'OBRIGATÓRIA' : 'RECOMENDADA'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'configuracoes' && (
          <div className=\"space-y-8\">
            <h2 className=\"text-2xl font-bold\">Configurações de Administrador</h2>
            <div className=\"grid grid-cols-2 gap-8\">
              <div className=\"bg-slate-900 p-8 rounded-3xl border border-slate-800\">
                <h3 className=\"font-bold mb-4 flex items-center gap-2\"><Users size={20}/> Gestão de Usuários</h3>
                <div className=\"space-y-4\">
                  {usuarios.map(u => (
                    <div key={u.id} className=\"flex justify-between items-center p-4 bg-slate-800 rounded-xl\">
                      <div><p className=\"font-bold\">{u.nome}</p><p className=\"text-xs text-slate-400\">{u.email} • {u.tipo}</p></div>
                      <button className=\"text-slate-500 hover:text-red-500\"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button className=\"w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition\">Adicionar Novo Usuário</button>
                </div>
              </div>
              <div className=\"bg-slate-900 p-8 rounded-3xl border border-slate-800\">
                <h3 className=\"font-bold mb-4\">Segurança e Sistema</h3>
                <div className=\"space-y-4\">
                  <div className=\"flex justify-between items-center p-4 bg-slate-800 rounded-xl\"><span>Logs de Atividade</span><ChevronDown size={16}/></div>
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className=\"w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-sm font-bold transition\">Resetar Banco de Dados</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
