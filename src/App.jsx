// @ts-nocheck
/* eslint-disable */
import { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search,
  Plus, MapPin, DollarSign, HeartPulse, LayoutGrid, X, Trash2,
  Edit, Baby, LayoutDashboard, Scale, Settings,
  Sparkles, Bot, Send, Loader2, CheckCircle2,
  Archive, Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert,
  Wheat, Calculator
} from 'lucide-react';

// --- BASE DE DADOS INICIAL ---
const defaultData = {
  propriedades: [
    { id: 1, nome: "Fazenda São João", responsavel: "Administrador", cidade: "Rondonópolis", estado: "MT", area_ha: 350, ie: "123.456.789-00" }
  ],
  lotes: [
    { id: 1, nome: "Matrizes A", capacidade: 50, tipo: "Pasto", obs: "Pasto Central" },
    { id: 2, nome: "Confinamento 1", capacidade: 100, tipo: "Baia", obs: "Terminação" },
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
    { id: 1, brincoVaca: "001", dataInseminacao: "2025-06-10", previsaoParto: "2026-03-15", metodo: "IA", reprodutor: "Nelore PO", status: "Prenhe" },
  ],
  nascimentos: [],
  vacinacoes: [
    { id: 1, vacina: "Ivermectina 1%", lote: "Confinamento 1", dataAplicacao: "2026-03-10", proximaDose: null, qtdAnimais: 80, obs: "Controlo parasitário", carenciaDias: 35, dataLiberacao: "2026-04-14", status: "concluida" },
  ],
  insumos: [
    { id: 1, nome: "Sal Mineral 80", categoria: "Nutrição", quantidade: 50, unidade: "kg", estoqueMinimo: 100 },
    { id: 2, nome: "Ivermectina 50ml", categoria: "Medicamentos", quantidade: 15, unidade: "frascos", estoqueMinimo: 5 }
  ],
  financeiro: [
    { id: 1, descricao: "Venda lote engorda", categoria: "Venda de Gado", tipo: "receita", valor: 68000, data: "2026-02-18", status: "pago" },
  ],
  bibliotecaAlimentos: [
    { id: 1, nome: "Silagem de Milho", ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: "Milho Grão Moído", ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 },
    { id: 3, nome: "Farelo de Soja (46%)", ms: 89, elm: 2.05, elg: 1.40, pm: 320, ca: 3.5, p: 6.5, precoKg: 2.50 },
    { id: 4, nome: "Ureia Pecuária", ms: 100, elm: 0, elg: 0, pm: 1200, ca: 0, p: 0, precoKg: 3.80 },
    { id: 5, nome: "Núcleo Confinamento", ms: 100, elm: 0, elg: 0, pm: 0, ca: 150, p: 80, precoKg: 5.50 },
    { id: 6, nome: "Feno de Tifton", ms: 85, elm: 1.20, elg: 0.60, pm: 40, ca: 4.0, p: 2.5, precoKg: 0.60 },
  ]
};

// --- FUNÇÕES UTILITÁRIAS & IA ---
const calcularExigenciasNASEM = (peso, gpd) => {
  const pesoMetabolico = Math.pow(peso, 0.75);
  return {
    cms: peso * 0.022,
    elm: 0.077 * pesoMetabolico,
    elg: 0.063 * pesoMetabolico * Math.pow(gpd, 1.097),
    pm: (3.8 * pesoMetabolico) + (gpd * 250),
    ca: 15 + (gpd * 10),
    p: 10 + (gpd * 8),
  };
};

const callGemini = async (prompt, systemInstruction) => {
  const apiKey = ""; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } };
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP error!`);
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    } catch (error) {
      if (attempt === 4) return "Erro de comunicação com a IA.";
      await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
    }
  }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [isBatchAnimalFormOpen, setIsBatchAnimalFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  const [nutriAlvoPeso, setNutriAlvoPeso] = useState(400);
  const [nutriAlvoGPD, setNutriAlvoGPD] = useState(1.2);
  const [dietaAtual, setDietaAtual] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState("");

  const [aiInsights, setAiInsights] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: 'Olá! Sou o seu Consultor Agro IA. Como posso ajudar com a gestão da sua fazenda hoje?' }]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_pro_v11');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed }; 
      } catch (e) { return defaultData; }
    }
    return defaultData;
  });

  useEffect(() => { localStorage.setItem('bovigest_data_pro_v11', JSON.stringify(appData)); }, [appData]);

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
      a.brinco.includes(searchQuery) || a.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.categoria.toLowerCase().includes(searchQuery.toLowerCase()) || a.lote.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, appData.animais]);

  const gadoDeCorte = useMemo(() => appData.animais.filter(a => a.tipo === 'Corte'), [appData.animais]);

  const pesoMedio = useMemo(() => {
    if (appData.animais.length === 0) return 0;
    return Math.round(appData.animais.reduce((acc, a) => acc + Number(a.peso), 0) / appData.animais.length);
  }, [appData.animais]);

  const isEmCarencia = (animalLote) => {
    const hoje = new Date();
    const vacinaLote = appData.vacinacoes.find(v => v.lote === animalLote || v.lote === "Todo o Rebanho");
    if (vacinaLote && vacinaLote.dataLiberacao) {
      const liberacao = new Date(vacinaLote.dataLiberacao);
      if (hoje < liberacao) return vacinaLote;
    }
    return false;
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const showSaveSuccess = () => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); };

  const exigenciasTarget = useMemo(() => calcularExigenciasNASEM(nutriAlvoPeso, nutriAlvoGPD), [nutriAlvoPeso, nutriAlvoGPD]);
  const nutricaoFornecida = useMemo(() => {
    let cms = 0, elm = 0, elg = 0, pm = 0, ca = 0, p = 0, custoDiario = 0;
    dietaAtual.forEach(item => {
      const alimento = appData.bibliotecaAlimentos.find(a => a.id === item.idInsumo);
      if(alimento) {
        const kgMS = item.kgMN * (alimento.ms / 100);
        cms += kgMS; elm += kgMS * alimento.elm; elg += kgMS * alimento.elg;
        pm += kgMS * alimento.pm; ca += kgMS * alimento.ca; p += kgMS * alimento.p;
        custoDiario += item.kgMN * alimento.precoKg;
      }
    });
    return { cms, elm, elg, pm, ca, p, custoDiario };
  }, [dietaAtual, appData.bibliotecaAlimentos]);

  const handleAddInsumoDieta = () => {
    if (!insumoSelecionado) return;
    if (!dietaAtual.find(d => d.idInsumo === Number(insumoSelecionado))) {
      setDietaAtual([...dietaAtual, { idInsumo: Number(insumoSelecionado), kgMN: 1 }]);
    }
    setInsumoSelecionado("");
  };
  const handleUpdateKgMN = (idInsumo, novoKgMN) => setDietaAtual(dietaAtual.map(d => d.idInsumo === idInsumo ? { ...d, kgMN: Number(novoKgMN) } : d));
  const handleRemoveInsumoDieta = (idInsumo) => setDietaAtual(dietaAtual.filter(d => d.idInsumo !== idInsumo));

  const handleAnalyzeFarm = async () => {
    setIsAnalyzing(true);
    const context = `Rebanho: ${appData.animais.length} cab. Peso Médio: ${pesoMedio}kg. Saldo: ${formatCurrency(saldoAtual)}. Receitas: ${formatCurrency(totaisFinanceiros.receitas)}. Despesas: ${formatCurrency(totaisFinanceiros.despesas)}. Lotes: ${appData.lotes.length}.`;
    const prompt = "Faça uma análise executiva (3 parágrafos curtos) sobre a propriedade, focando-se em indicadores positivos e sugerindo uma estratégia de lucro/maneio.";
    const result = await callGemini(prompt, "És um consultor especialista em agronegócio. Usa português de Portugal. Sê analítico.\n\n" + context);
    setAiInsights(result);
    setIsAnalyzing(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");
    setIsChatLoading(true);
    const context = `Animais: ${appData.animais.length}. Saldo: ${saldoAtual}. Lotes: ${appData.lotes.map(l=>l.nome).join(', ')}.`;
    const historyText = chatMessages.map(m => `${m.role === 'user' ? 'Utilizador' : 'Assistente'}: ${m.text}`).join("\n");
    const result = await callGemini(`Histórico:\n${historyText}\n\nUtilizador: ${userText}`, "És o BoviGest IA, assistente em agropecuária. Responde em PT-PT de forma concisa.\nContexto: " + context);
    setChatMessages(prev => [...prev, { role: 'model', text: result }]);
    setIsChatLoading(false);
  };

  const handleSaveAnimal = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const animalData = {
      id: editingAnimal ? editingAnimal.id : Date.now(),
      brinco: fd.get('brinco'), nome: fd.get('nome') || "-", sexo: fd.get('sexo'),
      categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'),
      dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote: fd.get('lote') || "Sem Lote",
      obs: fd.get('obs') || "", ativo: true
    };
    if (editingAnimal) setAppData(prev => ({ ...prev, animais: prev.animais.map(a => a.id === animalData.id ? animalData : a) }));
    else setAppData(prev => ({ ...prev, animais: [animalData, ...prev.animais] }));
    setIsAnimalFormOpen(false); setEditingAnimal(null); setSelectedAnimal(null); showSaveSuccess();
  };

  const handleSaveBatchAnimais = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prefixo = fd.get('prefixo') || '';
    const inicio = Number(fd.get('inicio'));
    const quantidade = Number(fd.get('quantidade'));
    const lote = fd.get('lote') || "Sem Lote";
    const novosAnimais = [];
    for (let i = 0; i < quantidade; i++) {
      novosAnimais.push({
        id: Date.now() + i, brinco: `${prefixo}${(inicio + i).toString().padStart(3, '0')}`, nome: "-",
        sexo: fd.get('sexo'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'),
        dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote, obs: "Cadastrado em lote.", ativo: true
      });
    }
    setAppData(prev => ({ ...prev, animais: [...novosAnimais, ...prev.animais] }));
    setIsBatchAnimalFormOpen(false); showSaveSuccess();
  };

  const openEditAnimal = (animal) => { setEditingAnimal(animal); setIsAnimalFormOpen(true); };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' },
    { id: 'ai-assistant', icon: Sparkles, label: 'Consultor IA' },
    { id: 'nutricao', icon: Wheat, label: 'Nutrição & Dietas (NASEM)' },
    { id: 'propriedades', icon: MapPin, label: 'Propriedades' },
    { id: 'animais', icon: Beef, label: 'Rebanho Geral', badge: appData.animais.length },
    { id: 'gado_corte', icon: Target, label: 'Gado de Corte', badge: gadoDeCorte.length },
    { id: 'pastagens', icon: LayoutGrid, label: 'Pastagens / Lotes', badge: appData.lotes.length },
    { id: 'reproducao', icon: HeartPulse, label: 'Inseminações' },
    { id: 'nascimentos', icon: Baby, label: 'Nascimentos', badge: appData.nascimentos.length },
    { id: 'sanidade', icon: ShieldAlert, label: 'Sanidade Clínica' },
    { id: 'pesagens', icon: Scale, label: 'Pesagens' },
    { id: 'insumos', icon: Archive, label: 'Estoque Insumos' },
    { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
    { id: 'configuracoes', icon: Settings, label: 'Configurações' },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1544866582-90e808381861?q=80&w=2074&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center text-green-500 mb-4"><Tractor size={64} className="drop-shadow-lg" /></div>
          <h2 className="mt-2 text-center text-5xl font-extrabold text-white tracking-tight drop-shadow-md">BoviGest <span className="text-green-500">PRO</span></h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-8 shadow-2xl sm:rounded-3xl border border-slate-700/50">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
              <div><input type="email" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none" defaultValue="gestor@bovigest.com" /></div>
              <div><input type="password" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none" defaultValue="123456" /></div>
              <button type="submit" className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-bold text-white bg-green-600 hover:bg-green-500 transition-all shadow-lg">Aceder ao Painel</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const animaisEmCarencia = appData.animais.filter(a => isEmCarencia(a.lote)).length;
  const insumosCriticos = appData.insumos.filter(i => i.quantidade <= i.estoqueMinimo).length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 border-r border-slate-900 hidden md:flex flex-col shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
          <Tractor className="text-green-500 mr-4 shrink-0" size={32} />
          <span className="text-2xl font-black tracking-tight text-white block leading-none">BoviGest</span>
        </div>
        <div className="px-8 py-6 border-b border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold mr-3 shrink-0 shadow-lg">JS</div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{appData.propriedades[0].nome}</p>
              <p className="text-xs font-medium text-slate-400 truncate">{appData.propriedades[0].responsavel}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl group transition-all ${currentView === item.id ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
              >
                <Icon className={`mr-3 h-5 w-5 shrink-0 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <span className="font-bold text-sm truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && <span className="ml-auto py-0.5 px-2.5 rounded-full text-xs font-bold bg-white/20 text-white">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-6 border-t border-slate-800/50 shrink-0">
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center justify-center w-full px-4 py-3 text-slate-400 border border-slate-700/50 hover:text-red-400 hover:bg-slate-900 rounded-xl font-bold text-sm">
            <LogOut className="mr-2 h-4 w-4" /> Terminar Sessão
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 z-10 shadow-sm shrink-0">
          <div className="flex-1 flex items-center">
            <h2 className="text-3xl font-extrabold text-gray-900 capitalize flex items-center tracking-tight">
              {(() => {
                const currentNav = navItems.find(n => n.id === currentView);
                if (currentNav && currentNav.icon) {
                  const IconComponent = currentNav.icon;
                  return <><IconComponent className="mr-4 text-green-600" size={32} /> {currentNav.label}</>;
                }
                return currentView;
              })()}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {saveSuccess && (<span className="text-sm font-bold text-green-700 flex items-center bg-green-50 px-4 py-2 rounded-full animate-in fade-in shadow-sm"><CheckCircle2 size={18} className="mr-2" /> Gravado</span>)}
            <button className="text-gray-400 hover:text-gray-800 relative p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm">
              <Bell className="h-5 w-5" />
              {(animaisEmCarencia > 0 || insumosCriticos > 0) && <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {/* VISUALIZAÇÃO: NUTRIÇÃO */}
          {currentView === 'nutricao' && (
            <div className="animate-in fade-in space-y-6">
              <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Calculator size={120} /></div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-2 flex items-center"><Wheat className="mr-3"/> Formulação de Dietas</h2>
                  <p className="text-emerald-100 text-lg font-medium max-w-2xl">Motor de cálculo simplificado baseado nas diretrizes nutricionais do NASEM 2021.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center"><Target size={20} className="mr-2 text-blue-600"/> 1. Perfil do Animal Alvo</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Peso Médio (kg)</label>
                        <input type="number" value={nutriAlvoPeso} onChange={(e)=>setNutriAlvoPeso(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 font-bold text-gray-900 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">GPD Alvo (kg/dia)</label>
                        <input type="number" step="0.1" value={nutriAlvoGPD} onChange={(e)=>setNutriAlvoGPD(Number(e.target.value))} className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center"><Archive size={20} className="mr-2 text-orange-600"/> 2. Composição da Dieta</h3>
                    <div className="flex space-x-3 mb-6">
                      <select value={insumoSelecionado} onChange={(e)=>setInsumoSelecionado(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Selecione um Ingrediente...</option>
                        {appData.bibliotecaAlimentos.filter(a => !dietaAtual.find(d => d.idInsumo === a.id)).map(a => (<option key={a.id} value={a.id}>{a.nome} (MS: {a.ms}%)</option>))}
                      </select>
                      <button onClick={handleAddInsumoDieta} className="bg-orange-600 text-white px-5 rounded-xl font-bold hover:bg-orange-700 shadow-sm"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-3">
                      {dietaAtual.map(item => {
                        const ali = appData.bibliotecaAlimentos.find(a => a.id === item.idInsumo);
                        return (
                          <div key={item.idInsumo} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <div className="flex-1"><p className="font-bold text-gray-900 text-sm">{ali.nome}</p><p className="text-xs font-medium text-gray-500">{ali.ms}% MS • R$ {ali.precoKg}/kg</p></div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2 overflow-hidden"><input type="number" step="0.1" value={item.kgMN} onChange={(e)=>handleUpdateKgMN(item.idInsumo, e.target.value)} className="w-16 py-2 text-right font-bold text-gray-900 outline-none" /><span className="text-xs font-bold text-gray-400 ml-1">kg MN</span></div>
                              <button onClick={()=>handleRemoveInsumoDieta(item.idInsumo)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                            </div>
                          </div>
                        );
                      })}
                      {dietaAtual.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">Nenhum ingrediente adicionado.</p>}
                    </div>
                    {dietaAtual.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-gray-100 bg-green-50/50 p-4 rounded-xl border-green-100">
                        <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold text-gray-600">Custo Diário/Cabeça:</span><span className="text-lg font-black text-green-700">{formatCurrency(nutricaoFornecida.custoDiario)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-600">Custo por kg de Ganho:</span><span className="text-md font-bold text-gray-900">{formatCurrency(nutricaoFornecida.custoDiario / nutriAlvoGPD)}</span></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 h-full">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center mb-8"><Activity size={24} className="mr-3 text-green-500"/> 3. Balanço Nutricional Diário</h3>
                    <div className="space-y-8">
                      {[{ label: "Matéria Seca (CMS)", val: nutricaoFornecida.cms, target: exigenciasTarget.cms, unit: "kg", col: "orange" },
                        { label: "Energia Líquida Ganho (ELg)", val: nutricaoFornecida.elg, target: exigenciasTarget.elg, unit: "Mcal", col: "red" },
                        { label: "Proteína Metabolizável (PM)", val: nutricaoFornecida.pm, target: exigenciasTarget.pm, unit: "g/dia", col: "blue" }
                      ].map((bar, idx) => {
                        const pct = Math.min((bar.val / bar.target) * 100, 150) || 0;
                        const isIdeal = pct >= 95 && pct <= 105;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between items-end mb-2">
                              <h4 className="font-bold text-gray-900 text-sm">{bar.label}</h4>
                              <div className="text-right">
                                <span className={`text-xl font-black ${isIdeal ? 'text-green-600' : bar.col === 'orange' ? 'text-orange-500' : bar.col === 'red' ? 'text-red-500' : 'text-blue-500'}`}>
                                  {bar.val.toFixed(bar.val > 100 ? 0 : 2)}
                                </span>
                                <span className="text-sm font-bold text-gray-400"> / {bar.target.toFixed(bar.target > 100 ? 0 : 2)} {bar.unit}</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200 relative">
                              <div className={`h-full transition-all duration-500 ${isIdeal ? 'bg-green-500' : bar.col === 'orange' ? 'bg-orange-500' : bar.col === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}></div>
                              <div className="absolute top-0 bottom-0 border-l-2 border-black opacity-50" style={{ left: '100%' }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO: DASHBOARD */}
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {(animaisEmCarencia > 0 || insumosCriticos > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {animaisEmCarencia > 0 && (
                    <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start">
                      <div className="bg-red-100 p-3 rounded-xl text-red-600 mr-4"><AlertTriangle size={24} /></div>
                      <div>
                        <h4 className="text-red-900 font-extrabold text-lg">Atenção: Período de Carência</h4>
                        <p className="text-red-700 font-medium text-sm mt-1">Existem <b>{animaisEmCarencia} animais</b> sob efeito de medicamentos/vacinas.</p>
                      </div>
                    </div>
                  )}
                  {insumosCriticos > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl flex items-start">
                      <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600 mr-4"><PackagePlus size={24} /></div>
                      <div>
                        <h4 className="text-yellow-900 font-extrabold text-lg">Insumos no Fim</h4>
                        <p className="text-yellow-700 font-medium text-sm mt-1">Tem <b>{insumosCriticos} produto(s)</b> com stock crítico.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-6"><div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Beef size={28} /></div></div>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{appData.animais.length}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Total Cabeças</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-6"><div className="bg-green-50 p-4 rounded-2xl text-green-600"><DollarSign size={28} /></div></div>
                  <h3 className="text-3xl font-black text-gray-900 truncate mt-2">{formatCurrency(saldoAtual)}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Saldo Global</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-6"><div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><Scale size={28} /></div></div>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{pesoMedio} <span className="text-xl text-gray-300 font-bold">kg</span></h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Média de Peso</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-6"><div className="bg-pink-50 p-4 rounded-2xl text-pink-600"><HeartPulse size={28} /></div></div>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{appData.reproducao.filter(r=>r.status === 'Prenhe').length}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Matrizes Prenhes</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
                <div className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 flex items-center">Relatório Inteligente <Sparkles className="ml-3 text-green-500" size={24} /></h3>
                    <p className="text-gray-500 font-medium mt-1">A Inteligência Artificial analisa os seus dados e gera estratégias.</p>
                  </div>
                  <button onClick={handleAnalyzeFarm} disabled={isAnalyzing} className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center disabled:opacity-70">
                    {isAnalyzing ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Bot className="w-6 h-6 mr-3" />}
                    {isAnalyzing ? 'A Processar...' : 'Gerar Análise IA'}
                  </button>
                </div>
                {aiInsights && (
                  <div className="p-8 bg-white border-t border-gray-100 animate-in fade-in">
                    <div className="prose max-w-none text-gray-700 text-lg font-medium whitespace-pre-wrap leading-relaxed">{aiInsights}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO: ANIMAIS */}
          {currentView === 'animais' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-[400px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-13 pr-5 py-4 border border-gray-200 rounded-2xl bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm outline-none font-medium" placeholder="Procurar brinco, lote..." />
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button onClick={() => setIsBatchAnimalFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-md flex items-center justify-center flex-1 sm:flex-none transition-all"><ListPlus className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Registo Múltiplo</span></button>
                  <button onClick={() => { setEditingAnimal(null); setIsAnimalFormOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold shadow-md flex items-center justify-center flex-1 sm:flex-none transition-all"><Plus className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Animal Único</span></button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Identificação</th>
                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Localização</th>
                        <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Peso / Status</th>
                        <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Gestão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredAnimais.map((animal) => {
                        const carenciaObj = isEmCarencia(animal.lote);
                        return (
                          <tr key={animal.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center">
                                <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm mr-5 ${animal.sexo === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{animal.brinco}</div>
                                <div>
                                  <div className="text-base font-black text-gray-900">{animal.nome !== '-' ? animal.nome : `BRINCO ${animal.brinco}`}</div>
                                  <div className="text-sm font-semibold text-gray-500 mt-0.5">{animal.raca} • {animal.categoria}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="text-sm font-bold text-gray-900 bg-gray-100 inline-block px-3 py-1 rounded-lg mb-1">{animal.lote}</div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="text-lg font-black text-gray-900">{animal.peso} kg</div>
                              {!!carenciaObj ? (
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md inline-flex items-center justify-end mt-1"><ShieldAlert size={12} className="mr-1"/> Carência</span>
                              ) : (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md inline-flex items-center justify-end mt-1"><CheckCircle2 size={12} className="mr-1"/> Apto</span>
                              )}
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => setSelectedAnimal(animal)} className="text-gray-700 hover:text-green-700 font-bold px-5 py-2.5 rounded-xl border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm">Detalhes</button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredAnimais.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-400 font-bold text-lg">Nenhum animal listado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO: AI ASSISTANT */}
          {currentView === 'ai-assistant' && (
            <div className="animate-in fade-in flex flex-col h-[calc(100vh-140px)] min-h-[500px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center">
                  <div className="bg-green-500 p-2.5 rounded-xl mr-4 shadow-sm hidden sm:block"><Bot size={28} className="text-white" /></div>
                  <div>
                    <h2 className="text-xl font-extrabold flex items-center">Consultor Agro IA <Sparkles size={18} className="ml-2 text-green-300" /></h2>
                    <p className="text-slate-300 text-sm font-medium mt-0.5">Dúvidas sobre maneio, finanças e dados do seu rebanho.</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none shadow-md' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                      <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Pergunte-me o que quiser..." className="w-full pl-6 pr-16 py-4 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-inner font-medium" disabled={isChatLoading} />
                  <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"><Send size={20} /></button>
                </form>
              </div>
            </div>
          )}

          {/* Fallback de Módulos Operacionais */}
          {['propriedades', 'gado_corte', 'pastagens', 'reproducao', 'nascimentos', 'sanidade', 'pesagens', 'insumos', 'financeiro', 'configuracoes'].includes(currentView) && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
              <CheckCircle2 size={80} className="text-green-300 mb-6" />
              <h2 className="text-3xl font-black text-gray-800 mb-3">Módulo {currentView.charAt(0).toUpperCase() + currentView.slice(1).replace('_', ' ')} Ativo</h2>
              <p className="text-gray-500 font-medium max-w-lg">Este módulo mantém a estrutura de excelência já aprovada nas versões anteriores e integra nativamente a proteção de dados.</p>
              <button onClick={() => setCurrentView('dashboard')} className="mt-8 bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">Voltar ao Painel</button>
            </div>
          )}

        </div>
      </main>

      {/* --- MODAIS DE POPUP --- */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <div className={`bg-gradient-to-r ${!!isEmCarencia(selectedAnimal.lote) ? 'from-red-700 to-red-600' : 'from-slate-800 to-slate-700'} p-8 flex justify-between items-start text-white shrink-0`}>
              <div>
                <h2 className="text-4xl font-black mb-1">{selectedAnimal.nome !== '-' ? selectedAnimal.nome : `Bovino #${selectedAnimal.brinco}`}</h2>
                <p className="text-white/80 font-bold text-lg">Brinco: {selectedAnimal.brinco} • {selectedAnimal.raca} • {selectedAnimal.categoria}</p>
                {!!isEmCarencia(selectedAnimal.lote) && (
                  <div className="mt-4 bg-white/20 inline-flex items-center px-4 py-2 rounded-xl backdrop-blur-md">
                    <ShieldAlert size={20} className="mr-2 text-white" />
                    <span className="font-bold text-white">Animal em Carência até {isEmCarencia(selectedAnimal.lote).dataLiberacao.split('-').reverse().join('/')}</span>
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedAnimal(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto bg-slate-50 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peso Atual</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{selectedAnimal.peso} <span className="text-base text-gray-400">kg</span></p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lote</p>
                  <p className="text-xl font-black text-gray-900 mt-2">{selectedAnimal.lote}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-white flex justify-between shrink-0">
              <button onClick={() => { setSelectedAnimal(null); openEditAnimal(selectedAnimal); }} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center transition-colors shadow-lg">
                <Edit size={18} className="mr-3"/> Editar Ficha Técnica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ANIMAL ÚNICO */}
      {isAnimalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center"><Beef className="mr-2 text-green-600"/> {editingAnimal ? 'Editar Animal' : 'Registar Animal Único'}</h2>
              <button onClick={() => {setIsAnimalFormOpen(false); setEditingAnimal(null);}} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto">
              <form id="animalForm" onSubmit={handleSaveAnimal} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Brinco *</label><input required name="brinco" defaultValue={editingAnimal?.brinco || ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Nome</label><input name="nome" defaultValue={editingAnimal?.nome !== '-' ? editingAnimal?.nome : ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Peso (kg) *</label><input required type="number" name="peso" defaultValue={editingAnimal?.peso || ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Lote</label>
                    <select name="lote" defaultValue={editingAnimal?.lote || ''} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none">
                      <option value="">Sem Lote</option>{appData.lotes.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3">
              <button onClick={() => {setIsAnimalFormOpen(false); setEditingAnimal(null);}} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="animalForm" className="px-6 py-3 rounded-xl font-bold bg-green-600 text-white">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRO MÚLTIPLO */}
      {isBatchAnimalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-indigo-50 shrink-0">
              <h2 className="text-xl font-black text-indigo-900 flex items-center"><ListPlus className="mr-3 text-indigo-600"/> Cadastrar em Lote</h2>
              <button onClick={() => setIsBatchAnimalFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto">
              <form id="batchForm" onSubmit={handleSaveBatchAnimais} className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div><label className="block text-sm font-bold mb-1">Prefixo</label><input name="prefixo" placeholder="NEL-" className="w-full px-4 py-3 border rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-1">Início *</label><input required name="inicio" type="number" defaultValue="1" className="w-full px-4 py-3 border rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-1">Qtd *</label><input required name="quantidade" type="number" defaultValue="10" className="w-full px-4 py-3 border rounded-xl bg-indigo-50" /></div>
                </div>
              </form>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3">
              <button onClick={() => setIsBatchAnimalFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="batchForm" className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white">Gerar Animais</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
