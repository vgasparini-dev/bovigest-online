// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Beef, Activity, LogOut, Bell, Search, Plus, MapPin, DollarSign, HeartPulse, 
  LayoutGrid, X, Trash2, Edit, Baby, LayoutDashboard, Scale, Settings, Sparkles, Bot, Send, 
  Loader2, CheckCircle2, Download, Archive, Target, PackagePlus, AlertTriangle, ListPlus, 
  ShieldAlert, Wheat, Calculator, Users, CalendarDays, KeyRound, FileSpreadsheet, Mail, 
  MessageSquare, Save, NotebookPen, Cloud, CloudOff, MinusCircle, Menu, Droplets, Moon, Sun
} from 'lucide-react';

// --- IMPORTAÇÕES DA NUVEM (FIREBASE) ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCn_eHREYCqtCxOtM4ShWmW_O--AX-6O5I",
  authDomain: "fluent-radar-319304.firebaseapp.com",
  projectId: "fluent-radar-319304",
  storageBucket: "fluent-radar-319304.firebasestorage.app",
  messagingSenderId: "458118385254",
  appId: "1:458118385254:web:966259a4d29b6553fea7a7",
  measurementId: "G-CEXNXKX7ZF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- BASE DE DADOS INICIAL ---
const defaultData = {
  propriedades: [{ id: 1, nome: "Minha Fazenda", responsavel: "Gestor", cidade: "-", estado: "BR", area_ha: 0, ie: "" }],
  usuarios: [{ id: 1, nome: "Administrador", email: "admin@bovigest.com", senha: "admin", role: "Admin", status: "Ativo" }],
  calendarioSanitario: [
    { id: 1, propriedadeId: 1, doenca: "Brucelose", mes: "1º Semestre", publico: "Fêmeas 3-8 meses", obrigatorio: true },
    { id: 2, propriedadeId: 1, doenca: "Raiva", mes: "Maio", publico: "Todo o rebanho", obrigatorio: true }
  ],
  lotes: [], animais: [], pesagens: [], reproducao: [], nascimentos: [], vacinacoes: [], insumos: [], financeiro: [], anotacoes: [], producaoLeite: [],
  bibliotecaAlimentos: [
    { id: 1, nome: "Silagem de Milho", ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: "Milho Grão Moído", ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 }
  ]
};

// --- CLASSES CSS OTIMIZADAS E TEMATIZADAS ---
const modalOverlay = "fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all";
const modalBase = "bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors";
const modalLarge = "bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors";
const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm sm:text-base dark:text-white transition-colors";
const btnCancel = "flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm text-sm sm:text-base transition-colors";
const btnSave = "flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white shadow-md text-sm sm:text-base transition-colors flex items-center justify-center";
const thCls = "px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-black uppercase whitespace-nowrap sticky top-0 z-10 backdrop-blur-md bg-opacity-90";
const tdCls = "px-4 sm:px-6 py-4 whitespace-nowrap border-t border-gray-100 dark:border-slate-800/50";
const tableRowCls = "hover:bg-gray-50/80 dark:hover:bg-slate-800/50 even:bg-slate-50/50 dark:even:bg-slate-800/20 transition-colors";

// --- FUNÇÕES UTILITÁRIAS ---
const calcularExigenciasNASEM = (peso, gpd) => {
  const pM = Math.pow(peso, 0.75);
  return { cms: peso * 0.022, elm: 0.077 * pM, elg: 0.063 * pM * Math.pow(gpd, 1.097), pm: (3.8 * pM) + (gpd * 250), ca: 15 + (gpd * 10), p: 10 + (gpd * 8) };
};

const callGemini = async (prompt, sys, userApiKey, url, model) => {
  if (!userApiKey) return "⚠️ API Key do Gemini não configurada.";
  const endp = url || "https://generativelanguage.googleapis.com/v1beta/models";
  const mod = model || "gemini-2.5-flash-preview-09-2025";
  try {
    const res = await fetch(`${endp.replace(/\/$/, '')}/${mod}:generateContent?key=${userApiKey.trim()}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: sys + "\n\nUser: " + prompt }] }] })
    });
    if (!res.ok) return "❌ Erro na API Gemini.";
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
  } catch (e) { return "❌ Falha de comunicação."; }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sanidadeTab, setSanidadeTab] = useState('registos');
  const [activePropriedadeId, setActivePropriedadeId] = useState(1);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('bovigest_gemini_api_key') || '');
  const [aiEndpoint, setAiEndpoint] = useState(() => localStorage.getItem('bovigest_ai_endpoint') || 'https://generativelanguage.googleapis.com/v1beta/models');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('bovigest_ai_model') || 'gemini-2.5-flash-preview-09-2025');

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [isBatchAnimalFormOpen, setIsBatchAnimalFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [isFinanceFormOpen, setIsFinanceFormOpen] = useState(false);
  const [editingFinance, setEditingFinance] = useState(null);
  const [isVaccineFormOpen, setIsVaccineFormOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [isLoteFormOpen, setIsLoteFormOpen] = useState(false);
  const [editingLote, setEditingLote] = useState(null);
  const [isReproducaoFormOpen, setIsReproducaoFormOpen] = useState(false);
  const [editingReproducao, setEditingReproducao] = useState(null);
  const [isPesagemFormOpen, setIsPesagemFormOpen] = useState(false);
  const [editingPesagem, setEditingPesagem] = useState(null);
  const [isNascimentoFormOpen, setIsNascimentoFormOpen] = useState(false);
  const [editingNascimento, setEditingNascimento] = useState(null);
  const [isNascimentoEditFormOpen, setIsNascimentoEditFormOpen] = useState(false);
  const [isInsumoFormOpen, setIsInsumoFormOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [isConsumoFormOpen, setIsConsumoFormOpen] = useState(false);
  const [consumoInsumoSelecionado, setConsumoInsumoSelecionado] = useState(null);
  const [isPropriedadeFormOpen, setIsPropriedadeFormOpen] = useState(false);
  const [editingPropriedade, setEditingPropriedade] = useState(null);
  const [isUsuarioFormOpen, setIsUsuarioFormOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [isCalendarioFormOpen, setIsCalendarioFormOpen] = useState(false);
  const [editingCalendario, setEditingCalendario] = useState(null);
  const [isAnotacaoFormOpen, setIsAnotacaoFormOpen] = useState(false);
  const [isLeiteFormOpen, setIsLeiteFormOpen] = useState(false);
  const [editingLeite, setEditingLeite] = useState(null);
  const [filtroAnotacao, setFiltroAnotacao] = useState('');
  const [emailModalData, setEmailModalData] = useState(null);

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

  // --- NUVEM & PERSISTÊNCIA FIREBASE ---
  const [appData, setAppData] = useState(defaultData);
  const [isCloudReady, setIsCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('connecting');
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } 
      catch (err) { console.error(err); setCloudStatus('error'); }
    };
    initAuth();
    return onAuthStateChanged(auth, setFirebaseUser);
  }, []);

  useEffect(() => {
    if (!firebaseUser || !isLoggedIn || !currentUser) return;
    const docRef = doc(db, 'bovigest_users', currentUser.email);
    
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setAppData(prev => ({ ...defaultData, ...docSnap.data() }));
      setIsCloudReady(true);
      setCloudStatus('online');
    }, (err) => { console.error(err); setCloudStatus('error'); });
    return () => unsub();
  }, [firebaseUser, isLoggedIn, currentUser]);

  const updateAppData = (updater) => {
    setAppData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      if (isCloudReady && currentUser) setDoc(doc(db, 'bovigest_users', currentUser.email), newData).catch(console.error);
      return newData;
    });
  };

  useEffect(() => { localStorage.setItem('bovigest_gemini_api_key', geminiApiKey); }, [geminiApiKey]);
  useEffect(() => { localStorage.setItem('bovigest_ai_endpoint', aiEndpoint); }, [aiEndpoint]);
  useEffect(() => { localStorage.setItem('bovigest_ai_model', aiModel); }, [aiModel]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim().toLowerCase();
    const senha = e.target.senha.value;
    setIsLoginLoading(true); setLoginError("");

    try {
      const docRef = doc(db, 'bovigest_users', email);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const user = (data.usuarios || []).find(u => u.email === email);
        if (user && user.senha === senha) {
          setAppData({ ...defaultData, ...data }); setCurrentUser(user); setIsLoggedIn(true);
        } else setLoginError("Senha incorreta para este email.");
      } else {
        const savedLocal = localStorage.getItem('bovigest_data_pro_master');
        let dataToSave = { ...defaultData };
        if (savedLocal) dataToSave = { ...defaultData, ...JSON.parse(savedLocal) };
        dataToSave.usuarios = [{ id: Date.now(), nome: email.split('@')[0], email: email, senha: senha, role: "Admin", status: "Ativo" }];
        await setDoc(docRef, dataToSave); setAppData(dataToSave); setCurrentUser(dataToSave.usuarios[0]); setIsLoggedIn(true);
      }
    } catch (err) { setLoginError("Erro ao conectar à nuvem."); }
    setIsLoginLoading(false);
  };

  // --- ACESSO SEGURO AOS DADOS ---
  const pAtiva = useMemo(() => (appData?.propriedades || []).find(p => p.id === activePropriedadeId) || (appData?.propriedades || [])[0] || { nome: 'Fazenda BoviGest', responsavel: 'Gestor' }, [activePropriedadeId, appData?.propriedades]);
  const cAnimais = useMemo(() => (appData?.animais || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.animais, activePropriedadeId]);
  const cLotes = useMemo(() => (appData?.lotes || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.lotes, activePropriedadeId]);
  const cFinanceiro = useMemo(() => (appData?.financeiro || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.financeiro, activePropriedadeId]);
  const cPesagens = useMemo(() => (appData?.pesagens || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.pesagens, activePropriedadeId]);
  const cReproducao = useMemo(() => (appData?.reproducao || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.reproducao, activePropriedadeId]);
  const cNascimentos = useMemo(() => (appData?.nascimentos || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.nascimentos, activePropriedadeId]);
  const cVacinacoes = useMemo(() => (appData?.vacinacoes || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.vacinacoes, activePropriedadeId]);
  const cInsumos = useMemo(() => (appData?.insumos || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.insumos, activePropriedadeId]);
  const cCalendario = useMemo(() => (appData?.calendarioSanitario || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.calendarioSanitario, activePropriedadeId]);
  const cAnotacoes = useMemo(() => (appData?.anotacoes || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.anotacoes, activePropriedadeId]);
  const cLeite = useMemo(() => (appData?.producaoLeite || []).filter(a => a.propriedadeId === activePropriedadeId), [appData?.producaoLeite, activePropriedadeId]);

  const totaisFin = useMemo(() => cFinanceiro.reduce((acc, item) => {
    if (item?.status === 'pago') { item.tipo === 'receita' ? acc.rec += Number(item.valor || 0) : acc.desp += Number(item.valor || 0); }
    return acc;
  }, { rec: 0, desp: 0 }), [cFinanceiro]);
  
  const saldoAtual = totaisFin.rec - totaisFin.desp;
  const pesoMedio = cAnimais.length === 0 ? 0 : Math.round(cAnimais.reduce((acc, a) => acc + (Number(a.peso) || 0), 0) / cAnimais.length);
  const custoPorArroba = useMemo(() => {
    if (cAnimais.length === 0 || totaisFin.desp === 0) return 0;
    const pt = cAnimais.reduce((acc, a) => acc + (Number(a.peso) || 0), 0);
    return pt === 0 ? 0 : totaisFin.desp / (pt / 30);
  }, [cAnimais, totaisFin.desp]);

  const distribuicaoCategorias = useMemo(() => { const counts = {}; cAnimais.forEach(a => { const c = a.categoria || 'Sem Categoria'; counts[c] = (counts[c] || 0) + 1; }); return counts; }, [cAnimais]);
  const filteredAnimais = useMemo(() => cAnimais.filter(a => (a.brinco || '').includes(searchQuery) || (a.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.categoria || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.lote || '').toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, cAnimais]);
  const gadoDeCorte = useMemo(() => cAnimais.filter(a => a.tipo === 'Corte'), [cAnimais]);
  const gadoDeLeite = useMemo(() => cAnimais.filter(a => a.tipo === 'Leite' && a.sexo === 'F'), [cAnimais]);
  const totalLeiteMes = useMemo(() => cLeite.filter(l => new Date(l.data).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + (Number(curr.litros) || 0), 0), [cLeite]);
  const mediaLitrosVaca = useMemo(() => cLeite.length === 0 || gadoDeLeite.length === 0 ? 0 : (cLeite.reduce((acc, curr) => acc + (Number(curr.litros) || 0), 0) / cLeite.length).toFixed(1), [cLeite, gadoDeLeite]);

  const isEmCarencia = (lote) => { const v = cVacinacoes.find(v => (v.lote === lote || v.lote === "Todo o Rebanho")); return (v && v.dataLiberacao && new Date() < new Date(v.dataLiberacao)) ? v : false; };
  const getGPD = (brinco) => {
    const p = cPesagens.filter(p => p.brinco === brinco).sort((a,b) => new Date(b.data) - new Date(a.data));
    if (p.length >= 2) { const dDias = (new Date(p[0]?.data) - new Date(p[1]?.data)) / 86400000; return dDias > 0 ? ((p[0]?.pesoAtual || 0) - (p[1]?.pesoAtual || 0)) / dDias : null; }
    return null;
  };

  const formatCurrency = (val) => Number.isFinite(Number(val)) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val)) : "R$ 0,00";
  const showSaveSuccess = () => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); };

  // --- FUNÇÕES EM FALTA ---
  const handleAnalyzeFarm = async () => {
    setIsAnalyzing(true);
    const context = `Rebanho: ${cAnimais.length} cab. Peso Médio: ${pesoMedio}kg. Custo/@: ${formatCurrency(custoPorArroba)}. Saldo: ${formatCurrency(saldoAtual)}. Receitas: ${formatCurrency(totaisFin.rec)}. Despesas: ${formatCurrency(totaisFin.desp)}. Lotes: ${cLotes.length}. Propriedade: ${pAtiva?.nome || 'Fazenda'}.`;
    const prompt = "Faça uma análise executiva e aponte os indicadores positivos e uma estratégia de lucro baseada nestes dados: " + context;
    const result = await callGemini(prompt, "És um consultor especialista em agronegócio.", geminiApiKey, aiEndpoint, aiModel);
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
    const context = `Animais: ${cAnimais.length}. Custo/@: ${formatCurrency(custoPorArroba)}. Lotes: ${cLotes.map(l=>l.nome).join(', ')}. Propriedade: ${pAtiva?.nome || 'Fazenda'}`;
    const historyText = chatMessages.map(m => `${m.role === 'user' ? 'Utilizador' : 'Assistente'}: ${m.text}`).join("\n");
    const result = await callGemini(`Contexto Atual da Fazenda: ${context}\n\nHistórico:\n${historyText}\n\nUtilizador: ${userText}`, "És o BoviGest IA, assistente agropecuário.", geminiApiKey, aiEndpoint, aiModel);
    setChatMessages(prev => [...prev, { role: 'model', text: result }]);
    setIsChatLoading(false);
  };

  const exportCSV = (name, hdrs, rows) => { 
    const blob = new Blob([[hdrs.join(','), ...rows.map(r=>r.map(i=>`"${i}"`).join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' }); 
    const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = name; l.click(); 
  };
  const exportRebanho = () => exportCSV(`Rebanho_${pAtiva.nome?.replace(/\s+/g, '_') || 'Fazenda'}.csv`, ['Brinco', 'Nome', 'Raça', 'Categoria', 'Sexo', 'Peso Atual', 'Lote', 'Status'], cAnimais.map(a => [a.brinco, a.nome, a.raca, a.categoria, a.sexo, a.peso, a.lote, a.ativo ? 'Ativo' : 'Inativo']));
  const exportFinanceiro = () => exportCSV(`Financeiro_${pAtiva.nome?.replace(/\s+/g, '_') || 'Fazenda'}.csv`, ['Data', 'Descricao', 'Tipo', 'Categoria', 'Valor'], cFinanceiro.map(f => [f.data, f.descricao, f.tipo, f.categoria, f.valor]));
  const exportReproducao = () => exportCSV(`Reproducao_${pAtiva.nome?.replace(/\s+/g, '_') || 'Fazenda'}.csv`, ['Matriz', 'Metodo', 'Semen/Touro', 'Data', 'Prev. Parto', 'Status'], cReproducao.map(r => [r.brincoVaca, r.metodo, r.reprodutor, r.dataInseminacao, r.previsaoParto, r.status]));

  // --- NUTRIÇÃO ---
  const exigenciasTarget = useMemo(() => calcularExigenciasNASEM(nutriAlvoPeso, nutriAlvoGPD), [nutriAlvoPeso, nutriAlvoGPD]);
  const nutricaoFornecida = useMemo(() => {
    let cms = 0, elm = 0, elg = 0, pm = 0, ca = 0, p = 0, custoDiario = 0;
    dietaAtual.forEach(i => {
      const ali = (appData?.bibliotecaAlimentos || []).find(a => a.id === i.idInsumo);
      if(ali) { const kgMS = i.kgMN * (ali.ms / 100); cms += kgMS; elm += kgMS * ali.elm; elg += kgMS * ali.elg; pm += kgMS * ali.pm; ca += kgMS * ali.ca; p += kgMS * ali.p; custoDiario += i.kgMN * ali.precoKg; }
    });
    return { cms, elm, elg, pm, ca, p, custoDiario };
  }, [dietaAtual, appData?.bibliotecaAlimentos]);

  const handleAddInsumoDieta = () => { if (insumoSelecionado && !dietaAtual.find(d => d.idInsumo === Number(insumoSelecionado))) setDietaAtual([...dietaAtual, { idInsumo: Number(insumoSelecionado), kgMN: 1 }]); setInsumoSelecionado(""); };
  const handleUpdateKgMN = (id, kg) => setDietaAtual(dietaAtual.map(d => d.idInsumo === id ? { ...d, kgMN: Number(kg) } : d));
  const handleRemoveInsumoDieta = (id) => setDietaAtual(dietaAtual.filter(d => d.idInsumo !== id));

  // --- HANDLERS FORMS ---
  const saveDoc = (coll, obj, isEdit) => { updateAppData(p => ({ ...p, [coll]: isEdit ? (p[coll] || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p[coll] || [])] })); showSaveSuccess(); };
  
  const handleSaveAnimal = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('animais', { id: editingAnimal?.id || Date.now(), propriedadeId: activePropriedadeId, brinco: fd.get('brinco'), nome: fd.get('nome') || "-", sexo: fd.get('sexo'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'), dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote: fd.get('lote') || "Sem Lote", obs: fd.get('obs') || "", ativo: true }, !!editingAnimal); setIsAnimalFormOpen(false); setEditingAnimal(null); setSelectedAnimal(null); };
  const handleSaveBatchAnimais = (e) => { e.preventDefault(); const fd = new FormData(e.target); const pref = fd.get('prefixo')||''; const ini = Number(fd.get('inicio')); const qtd = Number(fd.get('quantidade')); const l = fd.get('lote')||"Sem Lote"; const n = []; for(let i=0;i<qtd;i++){ n.push({id: Date.now()+i, propriedadeId: activePropriedadeId, brinco: `${pref}${(ini+i).toString().padStart(3,'0')}`, nome: "-", sexo: fd.get('sexo'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'), dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote: l, obs: "Lote.", ativo: true}); } updateAppData(p => ({ ...p, animais: [...n, ...(p.animais || [])] })); setIsBatchAnimalFormOpen(false); showSaveSuccess(); };
  const handleSavePesagem = (e) => { e.preventDefault(); const fd = new FormData(e.target); const b = fd.get('brinco'); const pAt = Number(fd.get('pesoAtual')); const an = cAnimais.find(a => a.brinco === b); if (!an && !editingPesagem) return alert("Não encontrado!"); const obj = { id: editingPesagem?.id || Date.now(), propriedadeId: activePropriedadeId, brinco: b, data: fd.get('data'), pesoAnterior: editingPesagem ? editingPesagem.pesoAnterior : an.peso, pesoAtual: pAt, obs: "" }; updateAppData(p => ({ ...p, pesagens: editingPesagem ? (p.pesagens || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.pesagens || [])], animais: (p.animais || []).map(a => a.brinco === b && a.propriedadeId === activePropriedadeId ? { ...a, peso: pAt } : a) })); setIsPesagemFormOpen(false); setEditingPesagem(null); showSaveSuccess(); };
  const handleSaveNascimentoEdit = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('nascimentos', { ...editingNascimento, data: fd.get('data'), brincoMatriz: fd.get('brincoMatriz'), brincoBezerro: fd.get('brincoBezerro'), sexo: fd.get('sexo'), pesoNascimento: Number(fd.get('pesoNascimento')), obs: fd.get('obs') || '' }, true); setIsNascimentoEditFormOpen(false); setEditingNascimento(null); };
  const handleAddNascimento = (e) => { e.preventDefault(); const fd = new FormData(e.target); const bM = fd.get('brincoMatriz'); const bB = fd.get('brincoBezerro'); const pN = Number(fd.get('pesoNascimento')); const n = { id: Date.now(), propriedadeId: activePropriedadeId, data: fd.get('data'), brincoMatriz: bM, brincoBezerro: bB, sexo: fd.get('sexo'), pesoNascimento: pN, obs: fd.get('obs') || "" }; const nA = { id: Date.now()+1, propriedadeId: activePropriedadeId, brinco: bB, nome: "-", sexo: fd.get('sexo'), categoria: "Bezerro(a)", tipo: "Cria", raca: fd.get('raca'), dataNasc: fd.get('data'), peso: pN, lote: "Maternidade", obs: `Cria de ${bM}`, ativo: true }; updateAppData(p => ({ ...p, nascimentos: [n, ...(p.nascimentos || [])], animais: [nA, ...(p.animais || [])], reproducao: (p.reproducao || []).map(r => r.brincoVaca === bM && r.status === 'Prenhe' && r.propriedadeId === activePropriedadeId ? { ...r, status: 'Parida' } : r) })); setIsNascimentoFormOpen(false); showSaveSuccess(); };
  const handleSaveLeite = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('producaoLeite', { id: editingLeite?.id || Date.now(), propriedadeId: activePropriedadeId, brincoMatriz: fd.get('brincoMatriz'), data: fd.get('data'), litros: Number(fd.get('litros')), turno: fd.get('turno'), obs: fd.get('obs') || "" }, !!editingLeite); setIsLeiteFormOpen(false); setEditingLeite(null); };
  const handleSaveVaccine = (e) => { e.preventDefault(); const fd = new FormData(e.target); const cd = Number(fd.get('carenciaDias')); let dl = null; if (cd > 0) { const d = new Date(fd.get('dataAplicacao')); d.setDate(d.getDate() + cd); dl = d.toISOString().split('T')[0]; } saveDoc('vacinacoes', { id: editingVaccine?.id || Date.now(), propriedadeId: activePropriedadeId, vacina: fd.get('vacina'), lote: fd.get('lote'), dataAplicacao: fd.get('dataAplicacao'), proximaDose: null, qtdAnimais: Number(fd.get('qtdAnimais')), obs: "", carenciaDias: cd, dataLiberacao: dl, status: "concluida" }, !!editingVaccine); setIsVaccineFormOpen(false); setEditingVaccine(null); };
  const handleSaveFinance = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('financeiro', { id: editingFinance?.id || Date.now(), propriedadeId: activePropriedadeId, descricao: fd.get('descricao'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), valor: Number(fd.get('valor')), data: fd.get('data'), status: fd.get('status') || 'pago' }, !!editingFinance); setIsFinanceFormOpen(false); setEditingFinance(null); };
  const handleSaveLote = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('lotes', { id: editingLote?.id || Date.now(), propriedadeId: activePropriedadeId, nome: fd.get('nome'), capacidade: Number(fd.get('capacidade')), tipo: fd.get('tipo'), obs: fd.get('obs') || "" }, !!editingLote); setIsLoteFormOpen(false); setEditingLote(null); };
  const handleSaveInsumo = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('insumos', { id: editingInsumo?.id || Date.now(), propriedadeId: activePropriedadeId, nome: fd.get('nome'), categoria: fd.get('categoria'), quantidade: Number(fd.get('quantidade')), unidade: fd.get('unidade'), estoqueMinimo: Number(fd.get('estoqueMinimo')) }, !!editingInsumo); setIsInsumoFormOpen(false); setEditingInsumo(null); };
  const handleLancarConsumo = (e) => { e.preventDefault(); const qtd = Number(new FormData(e.target).get('quantidadeConsumo')); updateAppData(p => ({ ...p, insumos: (p.insumos || []).map(i => i.id === consumoInsumoSelecionado.id ? { ...i, quantidade: Math.max(0, i.quantidade - qtd) } : i) })); setIsConsumoFormOpen(false); setConsumoInsumoSelecionado(null); showSaveSuccess(); };
  const handleSaveReproducao = (e) => { e.preventDefault(); const fd = new FormData(e.target); const dI = fd.get('dataInseminacao'); const pP = new Date(new Date(dI).setDate(new Date(dI).getDate() + 290)).toISOString().split('T')[0]; saveDoc('reproducao', { id: editingReproducao?.id || Date.now(), propriedadeId: activePropriedadeId, brincoVaca: fd.get('brincoVaca'), dataInseminacao: dI, previsaoParto: pP, metodo: fd.get('metodo'), reprodutor: fd.get('reprodutor'), status: fd.get('status') || "Prenhe" }, !!editingReproducao); setIsReproducaoFormOpen(false); setEditingReproducao(null); };
  const handleSavePropriedade = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('propriedades', { id: editingPropriedade?.id || Date.now(), nome: fd.get('nome'), responsavel: fd.get('responsavel'), cidade: fd.get('cidade'), estado: fd.get('estado'), area_ha: Number(fd.get('area_ha')), ie: fd.get('ie') }, !!editingPropriedade); setIsPropriedadeFormOpen(false); setEditingPropriedade(null); };
  const handleSaveCalendario = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('calendarioSanitario', { id: editingCalendario?.id || Date.now(), propriedadeId: activePropriedadeId, doenca: fd.get('doenca'), mes: fd.get('mes'), publico: fd.get('publico'), obrigatorio: fd.get('obrigatorio') === 'true' }, !!editingCalendario); setIsCalendarioFormOpen(false); setEditingCalendario(null); };
  const handleSaveUsuario = (e) => { e.preventDefault(); const fd = new FormData(e.target); const obj = { id: editingUsuario?.id || Date.now(), nome: fd.get('nome'), email: fd.get('email').trim().toLowerCase(), senha: fd.get('senha'), role: fd.get('role'), status: editingUsuario ? editingUsuario.status : 'Pendente' }; saveDoc('usuarios', obj, !!editingUsuario); if (!editingUsuario) setEmailModalData({ nome: obj.nome, email: obj.email, senha: obj.senha, role: obj.role }); setIsUsuarioFormOpen(false); setEditingUsuario(null); };
  const handleSaveAnotacao = (e) => { e.preventDefault(); const fd = new FormData(e.target); saveDoc('anotacoes', { id: Date.now(), propriedadeId: activePropriedadeId, titulo: fd.get('titulo'), texto: fd.get('texto'), tag: fd.get('tag') || '', data: new Date().toLocaleDateString('pt-BR'), status: 'aberto' }, false); setIsAnotacaoFormOpen(false); }; 
  const handleToggleAnotacao = (id) => { updateAppData(p => ({ ...p, anotacoes: (p.anotacoes || []).map(a => a.id === id ? { ...a, status: a.status === 'resolvido' ? 'aberto' : 'resolvido' } : a) })); };
  
  const del = (coll, id, msg) => { if(confirm(msg)){ updateAppData(p => ({ ...p, [coll]: (p[coll]||[]).filter(x => x.id !== id) })); showSaveSuccess(); } };

  // --- UI MENU AGRUPADO (NOVO) ---
  const navGroups = [
    {
      title: "Visão Geral",
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' },
        { id: 'ai-assistant', icon: Sparkles, label: 'Consultor IA' },
      ]
    },
    {
      title: "Rebanho & Produção",
      items: [
        { id: 'animais', icon: Beef, label: 'Rebanho Geral', badge: cAnimais.length },
        { id: 'gado_corte', icon: Target, label: 'Gado de Corte', badge: gadoDeCorte.length },
        { id: 'leite', icon: Droplets, label: 'Produção Leiteira', badge: cLeite.length },
        { id: 'nascimentos', icon: Baby, label: 'Nascimentos', badge: cNascimentos.length },
      ]
    },
    {
      title: "Maneio Diário",
      items: [
        { id: 'sanidade', icon: ShieldAlert, label: 'Sanidade Clínica' },
        { id: 'nutricao', icon: Wheat, label: 'Nutrição (NASEM)' },
        { id: 'reproducao', icon: HeartPulse, label: 'Reprodução' },
        { id: 'pesagens', icon: Scale, label: 'Pesagens' },
      ]
    },
    {
      title: "Administração",
      items: [
        { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
        { id: 'insumos', icon: Archive, label: 'Estoque Insumos' },
        { id: 'pastagens', icon: LayoutGrid, label: 'Lotes e Pastagens', badge: cLotes.length },
      ]
    },
    {
      title: "Sistema",
      items: [
        { id: 'propriedades', icon: MapPin, label: 'Propriedades' },
        { id: 'anotacoes', icon: NotebookPen, label: 'Anotações' },
        { id: 'configuracoes', icon: Settings, label: 'Configurações' },
      ]
    }
  ];

  const flatNavItems = navGroups.flatMap(g => g.items);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center transition-colors" style={{backgroundImage: "url('https://images.unsplash.com/photo-1544866582-90e808381861?q=80&w=2074&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-green-900/50 mb-6 border border-green-500/30">
            <Beef size={48} className="text-white" />
          </div>
          <h2 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">BoviGest <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">PRO</span></h2>
          <p className="text-slate-300 mt-3 font-medium text-lg">Gestão Pecuária Inteligente</p>
          <div className="mt-8 bg-slate-900/90 backdrop-blur-xl py-8 px-8 shadow-2xl rounded-3xl border border-slate-700/50 text-left">
            {loginError && <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl font-bold text-sm text-center">{loginError}</div>}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div><label className="block text-sm font-bold text-slate-300 mb-2">Email de Acesso</label><input type="email" name="email" required className="w-full px-5 py-4 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="ex: gestor@fazenda.com" /></div>
              <div><label className="block text-sm font-bold text-slate-300 mb-2">Senha Secreta</label><input type="password" name="senha" required className="w-full px-5 py-4 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="••••••••" /></div>
              <button type="submit" disabled={isLoginLoading} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-900/50 disabled:opacity-50 flex justify-center items-center transition-all">
                {isLoginLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null} Aceder ao Cofre
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-gray-900'}`}>
      
      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />}
      
      {/* SIDEBAR RESPONSIVA AGRUPADA */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-900 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-green-900/50">
              <Beef size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">BoviGest</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg"><X size={20} /></button>
        </div>

        {/* Perfil Mobile / Topo Sidebar */}
        <div className="px-6 py-5 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-green-400 font-bold mr-3 shrink-0">
              {(currentUser?.nome || 'U')[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{currentUser?.nome || 'Utilizador'}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-widest">{currentUser?.role || 'Operador'}</p>
            </div>
          </div>
          <select value={activePropriedadeId} onChange={(e) => setActivePropriedadeId(Number(e.target.value))} className="w-full bg-slate-800 text-white text-sm font-bold px-3 py-2.5 rounded-lg border border-slate-700 outline-none focus:ring-2 focus:ring-green-500 shadow-inner appearance-none truncate">
            {(appData?.propriedades || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar pb-24">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <h4 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{group.title}</h4>
              <div className="space-y-1">
                {group.items.map((item) => { 
                  const Icon = item.icon; 
                  const isActive = currentView === item.id;
                  return (
                    <button key={item.id} onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-green-600 text-white shadow-md shadow-green-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                      <Icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="font-bold text-sm truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && <span className={`ml-auto py-0.5 px-2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>{item.badge}</span>}
                    </button>
                  ); 
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-6 shrink-0 border-t border-slate-800/50 bg-slate-950">
          <button onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }} className="w-full py-3.5 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-red-400 rounded-xl font-bold flex justify-center items-center transition-colors text-sm"><LogOut className="mr-2 h-4 w-4" /> Terminar Sessão</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <header className="h-20 sm:h-24 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-10 shrink-0 z-10 shadow-sm transition-colors">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-4 text-gray-700 dark:text-slate-300 hover:text-green-600 bg-gray-100 dark:bg-slate-800 p-2.5 rounded-xl transition-colors"><Menu size={22} /></button>
            <h2 className="text-xl sm:text-2xl font-extrabold capitalize flex items-center text-gray-900 dark:text-white truncate">
              {(() => { const C = flatNavItems.find(n => n.id === currentView)?.icon || LayoutDashboard; return <C className="mr-2 sm:mr-3 text-green-600 shrink-0" size={26} /> })()}
              <span className="truncate">{flatNavItems.find(n => n.id === currentView)?.label}</span>
            </h2>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {cloudStatus === 'online' && <span className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/50"><Cloud size={14} className="mr-1.5 hidden sm:block" /> Nuvem</span>}
            {saveSuccess && <span className="text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-400 flex items-center bg-green-50 dark:bg-green-900/30 px-2 sm:px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800/50"><CheckCircle2 size={14} className="mr-1 sm:mr-1.5" /> <span className="hidden sm:block">Salvo</span></span>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 w-full relative custom-scrollbar">
          
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col"><div className="bg-blue-50 dark:bg-blue-900/30 p-3 sm:p-4 rounded-2xl text-blue-600 dark:text-blue-400 w-12 sm:w-16 mb-4 shadow-inner"><Beef size={24} className="sm:w-7 sm:h-7" /></div><h3 className="text-4xl sm:text-5xl font-black dark:text-white">{cAnimais.length}</h3><p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-slate-400 uppercase mt-2">Total Cabeças</p></div>
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col"><div className="bg-green-50 dark:bg-green-900/30 p-3 sm:p-4 rounded-2xl text-green-600 dark:text-green-400 w-12 sm:w-16 mb-4 shadow-inner"><DollarSign size={24} className="sm:w-7 sm:h-7" /></div><h3 className="text-2xl sm:text-3xl font-black mt-2 dark:text-white">{formatCurrency(saldoAtual)}</h3><p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-slate-400 uppercase mt-2">Saldo Global</p></div>
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col"><div className="bg-cyan-50 dark:bg-cyan-900/30 p-3 sm:p-4 rounded-2xl text-cyan-600 dark:text-cyan-400 w-12 sm:w-16 mb-4 shadow-inner"><Droplets size={24} className="sm:w-7 sm:h-7" /></div><h3 className="text-4xl sm:text-5xl font-black dark:text-white">{totalLeiteMes} <span className="text-lg sm:text-xl text-gray-300 dark:text-slate-500 font-bold">L</span></h3><p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-slate-400 uppercase mt-2">Leite no Mês</p></div>
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col"><div className="bg-pink-50 dark:bg-pink-900/30 p-3 sm:p-4 rounded-2xl text-pink-600 dark:text-pink-400 w-12 sm:w-16 mb-4 shadow-inner"><HeartPulse size={24} className="sm:w-7 sm:h-7" /></div><h3 className="text-4xl sm:text-5xl font-black dark:text-white">{cReproducao.filter(r=>r.status==='Prenhe').length}</h3><p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-slate-400 uppercase mt-2">Prenhes</p></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700"><h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-6">Distribuição</h3>
                  <div className="space-y-4">{Object.keys(distribuicaoCategorias).length === 0 ? (<p className="text-gray-400 dark:text-slate-500 text-sm">Sem animais.</p>) : (Object.entries(distribuicaoCategorias).map(([cat, qtd]) => { const pct = Math.round((qtd / cAnimais.length) * 100) || 0; return (<div key={cat}><div className="flex justify-between mb-1"><span className="font-bold text-gray-700 dark:text-slate-300 text-sm">{cat}</span><span className="font-black text-gray-900 dark:text-white text-sm">{pct}% ({qtd})</span></div><div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3"><div className="bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }}></div></div></div>); }))}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden relative flex flex-col justify-center"><div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-green-600"></div><div className="p-6 sm:p-8"><h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center mb-2">IA Relatório <Sparkles className="ml-2 text-green-500" size={24} /></h3><p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base mb-6">Analise dados e gere estratégias.</p><button onClick={handleAnalyzeFarm} disabled={isAnalyzing} className="w-full bg-gray-900 dark:bg-slate-950 text-white px-6 py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center disabled:opacity-70 transition-colors hover:bg-black">{isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Bot className="mr-2" />} {isAnalyzing ? 'A Processar...' : 'Gerar Análise'}</button>{aiInsights && <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-2xl"><div className="prose text-green-900 dark:text-green-100 text-xs sm:text-sm">{aiInsights}</div></div>}</div></div>
              </div>
            </div>
          )}

          {currentView === 'animais' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4"><div className="relative w-full sm:max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 sm:py-4 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-sm sm:text-base transition-colors" placeholder="Buscar brinco, lote, raça..." /></div><div className="flex space-x-2 w-full sm:w-auto"><button onClick={() => setIsBatchAnimalFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold flex-1 shadow-sm transition-colors text-sm sm:text-base"><ListPlus className="inline mr-1 sm:mr-2" /> Lote</button><button onClick={() => { setEditingAnimal(null); setIsAnimalFormOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold flex-1 shadow-sm transition-colors text-sm sm:text-base"><Plus className="inline mr-1 sm:mr-2" /> Único</button></div></div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[65vh] custom-scrollbar"><table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 relative"><thead className="bg-gray-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-gray-400 dark:text-slate-400`}>Identificação</th><th className={`${thCls} text-gray-400 dark:text-slate-400`}>Lote</th><th className={`${thCls} text-right text-gray-400 dark:text-slate-400`}>Peso</th><th className={`${thCls} text-right text-gray-400 dark:text-slate-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {filteredAnimais.map((animal) => (<tr key={animal.id} className={tableRowCls}><td className={tdCls}><div className="flex items-center"><div className={`h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center font-black mr-3 sm:mr-4 shadow-inner ${animal.sexo === 'M' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'}`}>{animal.brinco}</div><div><div className="font-black text-sm sm:text-base">{animal.nome !== '-' ? animal.nome : `BRINCO ${animal.brinco}`}</div><div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">{animal.raca} • {animal.categoria}</div></div></div></td><td className={tdCls}><span className="text-xs sm:text-sm font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm">{animal.lote}</span></td><td className={`${tdCls} text-right font-black text-base sm:text-lg`}>{animal.peso} <span className="text-gray-400 text-xs sm:text-sm font-bold">kg</span></td><td className={`${tdCls} text-right`}><button onClick={() => setSelectedAnimal(animal)} className="text-gray-700 dark:text-slate-300 font-bold px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm shadow-sm">Detalhes</button></td></tr>))}
                {filteredAnimais.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-400 dark:text-slate-500 font-bold text-sm sm:text-base">Nenhum animal encontrado.</td></tr>}
              </tbody></table></div></div>
            </div>
          )}

          {currentView === 'gado_corte' && (
            <div className="animate-in fade-in space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm"><div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center"><h3 className="font-black text-lg sm:text-xl flex items-center"><Target className="mr-2 sm:mr-3 text-red-500" /> Gado de Corte</h3><span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold px-3 py-1.5 rounded-lg text-sm">{gadoDeCorte.length} cabeças</span></div><div className="overflow-x-auto max-h-[65vh] custom-scrollbar"><table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 relative"><thead className="bg-gray-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-gray-400`}>Brinco</th><th className={`${thCls} text-gray-400`}>Lote</th><th className={`${thCls} text-right text-gray-400`}>Peso</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{gadoDeCorte.map((a) => (<tr key={a.id} className={tableRowCls}><td className={tdCls}><span className="font-black text-sm sm:text-base">{a.brinco}</span> <span className="text-xs text-gray-500 dark:text-slate-400">{a.raca}</span></td><td className={tdCls}><span className="font-bold text-sm sm:text-base">{a.lote}</span></td><td className={`${tdCls} text-right font-black text-sm sm:text-base`}>{a.peso} kg</td></tr>))}</tbody></table></div></div>
            </div>
          )}

          {currentView === 'leite' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><Droplets className="mr-3 text-cyan-500 inline" /> Controlo Leiteiro</h3><button onClick={() => { setEditingLeite(null); setIsLeiteFormOpen(true); }} className="bg-cyan-600 hover:bg-cyan-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Nova Ordenha</button></div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6"><div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-slate-700 text-center shadow-sm"><h3 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white">{totalLeiteMes} <span className="text-base sm:text-xl text-gray-400">L</span></h3><p className="text-xs sm:text-sm font-bold text-gray-400 uppercase mt-2">Mês Atual</p></div><div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-slate-700 text-center shadow-sm"><h3 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white">{mediaLitrosVaca} <span className="text-base sm:text-xl text-gray-400">L/dia</span></h3><p className="text-xs sm:text-sm font-bold text-gray-400 uppercase mt-2">Média/Matriz</p></div></div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[55vh] custom-scrollbar"><table className="min-w-full divide-y divide-cyan-100 dark:divide-slate-700 relative"><thead className="bg-cyan-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-cyan-800 dark:text-cyan-400`}>Data/Turno</th><th className={`${thCls} text-cyan-800 dark:text-cyan-400`}>Matriz</th><th className={`${thCls} text-right text-cyan-800 dark:text-cyan-400`}>Volume</th><th className={`${thCls} text-right text-cyan-800 dark:text-cyan-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {cLeite.map((l) => (<tr key={l.id} className="hover:bg-cyan-50/50 dark:hover:bg-slate-800 transition-colors"><td className={tdCls}><span className="block font-black text-sm sm:text-base">{l.data}</span><span className="text-xs font-bold text-gray-500">{l.turno}</span></td><td className={tdCls}><span className="font-bold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-sm sm:text-base shadow-sm border border-gray-200 dark:border-slate-600">Vaca {l.brincoMatriz}</span></td><td className={`${tdCls} text-right font-black text-cyan-600 dark:text-cyan-400 text-lg sm:text-xl`}>{l.litros} L</td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingLeite(l); setIsLeiteFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('producaoLeite', l.id, 'Apagar?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>))}
              </tbody></table></div></div>
            </div>
          )}

          {currentView === 'pastagens' && (
            <div className="animate-in fade-in space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><LayoutGrid className="mr-3 text-green-600 inline" /> Lotes e Pastagens</h3><button onClick={() => { setEditingLote(null); setIsLoteFormOpen(true); }} className="bg-green-600 hover:bg-green-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Novo Lote</button></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{cLotes.map(l => { const an = cAnimais.filter(a => a.lote === l.nome).length; const oc = Math.round((an / l.capacidade) * 100) || 0; return (<div key={l.id} className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"><div className="flex justify-between mb-4"><h4 className="font-black text-lg sm:text-xl truncate pr-2">{l.nome}</h4><div className="shrink-0"><button onClick={() => { setEditingLote(l); setIsLoteFormOpen(true); }} className="text-blue-500 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={16}/></button><button onClick={() => del('lotes', l.id, 'Excluir?')} className="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16}/></button></div></div><p className="text-sm text-gray-500 dark:text-slate-400 mb-6 min-h-[40px] line-clamp-2">{l.obs || "Sem observações."}</p><div className="flex justify-between items-end mb-2"><span className="text-3xl font-black">{an}</span><span className="text-sm font-bold text-gray-400 dark:text-slate-500">/ {l.capacidade} cap.</span></div><div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden"><div className={`h-full transition-all ${oc>90?'bg-red-500':'bg-green-500'}`} style={{width:`${Math.min(oc,100)}%`}}></div></div></div>); })}</div></div>
          )}

          {currentView === 'reproducao' && (
            <div className="animate-in fade-in space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><HeartPulse className="mr-3 text-pink-600 inline" /> Controlo Reprodutivo</h3><button onClick={() => { setEditingReproducao(null); setIsReproducaoFormOpen(true); }} className="bg-pink-600 hover:bg-pink-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Inseminação</button></div><div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[65vh] custom-scrollbar"><table className="min-w-full divide-y divide-pink-100 dark:divide-slate-700 relative"><thead className="bg-pink-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-pink-800 dark:text-pink-400`}>Matriz</th><th className={`${thCls} text-pink-800 dark:text-pink-400`}>Método / Data</th><th className={`${thCls} text-pink-800 dark:text-pink-400`}>Previsão Parto</th><th className={`${thCls} text-right text-pink-800 dark:text-pink-400`}>Status</th><th className={`${thCls} text-right text-pink-800 dark:text-pink-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{cReproducao.map((r) => (<tr key={r.id} className={tableRowCls}><td className={tdCls}><span className="font-black text-sm sm:text-base">{r.brincoVaca}</span></td><td className={tdCls}><span className="font-bold block text-sm sm:text-base">{r.dataInseminacao}</span><span className="text-xs text-gray-500 dark:text-slate-400">{r.metodo} - {r.reprodutor}</span></td><td className={tdCls}><span className="font-bold text-sm sm:text-base">{r.previsaoParto}</span></td><td className={`${tdCls} text-right`}><span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border ${r.status === 'Prenhe' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400' : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400'}`}>{r.status}</span></td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingReproducao(r); setIsReproducaoFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('reproducao', r.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div></div>
          )}

          {currentView === 'pesagens' && (
            <div className="animate-in fade-in space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><Scale className="mr-3 text-orange-500 inline" /> Histórico de Pesagens</h3><button onClick={() => { setEditingPesagem(null); setIsPesagemFormOpen(true); }} className="bg-orange-600 hover:bg-orange-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Nova Pesagem</button></div><div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[65vh] custom-scrollbar"><table className="min-w-full divide-y divide-orange-100 dark:divide-slate-700 relative"><thead className="bg-orange-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-orange-800 dark:text-orange-400`}>Brinco / Data</th><th className={`${thCls} text-right text-orange-800 dark:text-orange-400`}>Anterior</th><th className={`${thCls} text-right text-orange-800 dark:text-orange-400`}>Atual</th><th className={`${thCls} text-right text-orange-800 dark:text-orange-400`}>Evolução</th><th className={`${thCls} text-right text-orange-800 dark:text-orange-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{cPesagens.map((p) => { const diff = (p.pesoAtual||0)-(p.pesoAnterior||0); return (<tr key={p.id} className={tableRowCls}><td className={tdCls}><span className="font-black text-sm sm:text-base block">BRINCO {p.brinco}</span> <span className="text-xs text-gray-500 dark:text-slate-400">{p.data}</span></td><td className={`${tdCls} text-right font-bold text-gray-500 dark:text-slate-400 text-sm sm:text-base`}>{p.pesoAnterior} kg</td><td className={`${tdCls} text-right font-black text-base sm:text-lg`}>{p.pesoAtual} kg</td><td className={`${tdCls} text-right font-black text-sm sm:text-base ${diff>=0?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400'}`}>{diff>0?'+':''}{diff} kg</td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingPesagem(p); setIsPesagemFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('pesagens', p.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>);})}</tbody></table></div></div></div>
          )}

          {currentView === 'nascimentos' && (
            <div className="animate-in fade-in space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><Baby className="mr-3 text-blue-500 inline" /> Nascimentos</h3><button onClick={() => { setEditingNascimento(null); setIsNascimentoFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Registo Parto</button></div><div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[65vh] custom-scrollbar"><table className="min-w-full divide-y divide-blue-100 dark:divide-slate-700 relative"><thead className="bg-blue-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-blue-800 dark:text-blue-400`}>Data</th><th className={`${thCls} text-blue-800 dark:text-blue-400`}>Matriz &rarr; Cria</th><th className={`${thCls} text-right text-blue-800 dark:text-blue-400`}>Peso (kg)</th><th className={`${thCls} text-right text-blue-800 dark:text-blue-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{cNascimentos.map((n) => (<tr key={n.id} className={tableRowCls}><td className={tdCls}><span className="font-bold text-gray-700 dark:text-slate-300 text-sm sm:text-base">{n.data}</span></td><td className={tdCls}><span className="font-black block text-sm sm:text-base">M: {n.brincoMatriz}</span><span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">B: {n.brincoBezerro} ({n.sexo})</span></td><td className={`${tdCls} text-right font-black text-sm sm:text-base`}>{n.pesoNascimento}</td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingNascimento(n); setIsNascimentoEditFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('nascimentos', n.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div></div>
          )}

          {currentView === 'financeiro' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><DollarSign className="mr-3 text-green-600 inline" /> Gestão Financeira</h3><button onClick={() => { setEditingFinance(null); setIsFinanceFormOpen(true); }} className="bg-green-600 hover:bg-green-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Lançamento</button></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"><div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"><p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Receitas</p><p className="text-xl sm:text-3xl font-black text-green-600 dark:text-green-400 mt-1">{formatCurrency(totaisFin.rec)}</p></div><div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"><p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Despesas</p><p className="text-xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-1">{formatCurrency(totaisFin.desp)}</p></div></div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[60vh] custom-scrollbar"><table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 relative"><thead className="bg-gray-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-gray-500 dark:text-slate-400`}>Descrição / Data</th><th className={`${thCls} text-gray-500 dark:text-slate-400`}>Categoria</th><th className={`${thCls} text-right text-gray-500 dark:text-slate-400`}>Valor</th><th className={`${thCls} text-right text-gray-500 dark:text-slate-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{cFinanceiro.map((f) => (<tr key={f.id} className={tableRowCls}><td className={tdCls}><span className="font-black block text-sm sm:text-base">{f.descricao}</span><span className="text-xs font-bold text-gray-500 dark:text-slate-400">{f.data}</span></td><td className={tdCls}><span className="font-bold text-sm sm:text-base">{f.categoria}</span></td><td className={`${tdCls} text-right font-black text-base sm:text-lg ${f.tipo==='receita'?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400'}`}>{f.tipo==='receita'?'+':'-'}{formatCurrency(f.valor)}</td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingFinance(f); setIsFinanceFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('financeiro', f.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div>
            </div>
          )}

          {currentView === 'sanidade' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4"><div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-1 flex shadow-sm"><button onClick={()=>setSanidadeTab('registos')} className={`flex-1 sm:flex-none px-5 py-2.5 sm:py-2 text-sm font-bold rounded-lg transition-colors ${sanidadeTab==='registos'?'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm':'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>Histórico</button><button onClick={()=>setSanidadeTab('calendario')} className={`flex-1 sm:flex-none px-5 py-2.5 sm:py-2 text-sm font-bold rounded-lg transition-colors ${sanidadeTab==='calendario'?'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm':'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>Calendário</button></div><button onClick={() => { sanidadeTab==='registos' ? (setEditingVaccine(null), setIsVaccineFormOpen(true)) : (setEditingCalendario(null), setIsCalendarioFormOpen(true)) }} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Adicionar</button></div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[65vh] custom-scrollbar"><table className="min-w-full divide-y divide-red-100 dark:divide-slate-700 relative"><thead className="bg-red-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-red-800 dark:text-red-400`}>{sanidadeTab==='registos'?'Vacina/Lote':'Campanha'}</th><th className={`${thCls} text-right text-red-800 dark:text-red-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{sanidadeTab==='registos' ? cVacinacoes.map((v) => (<tr key={v.id} className={tableRowCls}><td className={tdCls}><span className="font-black block text-sm sm:text-base">{v.vacina}</span><span className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-1 block">Lote: {v.lote} • Carência: {v.dataLiberacao||'-'}</span></td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingVaccine(v); setIsVaccineFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('vacinacoes', v.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>)) : cCalendario.map((c) => (<tr key={c.id} className={tableRowCls}><td className={tdCls}><span className="font-black block text-sm sm:text-base">{c.doenca}</span><span className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-1 block">{c.mes} • {c.publico}</span></td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingCalendario(c); setIsCalendarioFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('calendarioSanitario', c.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div>
            </div>
          )}

          {currentView === 'insumos' && (
            <div className="animate-in fade-in space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><Archive className="mr-3 text-purple-600 inline" /> Insumos</h3><button onClick={() => { setEditingInsumo(null); setIsInsumoFormOpen(true); }} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Insumo</button></div><div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm relative"><div className="overflow-x-auto w-full max-h-[65vh] custom-scrollbar"><table className="min-w-full divide-y divide-purple-100 dark:divide-slate-700 relative"><thead className="bg-purple-50 dark:bg-slate-900/80 backdrop-blur-md"><tr><th className={`${thCls} text-purple-800 dark:text-purple-400`}>Produto</th><th className={`${thCls} text-right text-purple-800 dark:text-purple-400`}>Qtd</th><th className={`${thCls} text-right text-purple-800 dark:text-purple-400`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{cInsumos.map((i) => (<tr key={i.id} className={tableRowCls}><td className={tdCls}><span className="font-black block text-sm sm:text-base">{i.nome}</span></td><td className={`${tdCls} text-right font-black text-sm sm:text-base`}>{i.quantidade} {i.unidade} {i.quantidade<=(i.estoqueMinimo||0) && <span className="text-[10px] sm:text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded ml-2">Crítico</span>}</td><td className={`${tdCls} text-right`}><button onClick={() => { setConsumoInsumoSelecionado(i); setIsConsumoFormOpen(true); }} className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 p-2 rounded-lg mr-1"><MinusCircle size={18}/></button><button onClick={() => { setEditingInsumo(i); setIsInsumoFormOpen(true); }} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('insumos', i.id, 'Excluir?')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div></div>
          )}

          {currentView === 'anotacoes' && (
            <div className="animate-in fade-in space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><NotebookPen className="mr-3 text-amber-600 inline" /> Anotações</h3><button onClick={() => setIsAnotacaoFormOpen(true)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Nova</button></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">{cAnotacoes.map(n => (<div key={n.id} className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col"><div className="flex justify-between items-start mb-2"><h4 className={`font-black text-sm sm:text-base flex-1 pr-2 ${n.status==='resolvido'?'line-through text-gray-400 dark:text-slate-500':''}`}>{n.titulo}</h4><button onClick={()=>del('anotacoes',n.id,'Remover?')} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={16}/></button></div><p className="text-xs sm:text-sm mt-2 mb-4 text-gray-600 dark:text-slate-400 flex-1 whitespace-pre-wrap">{n.texto}</p><button onClick={()=>handleToggleAnotacao(n.id)} className={`w-full py-2.5 font-bold rounded-xl text-xs sm:text-sm transition-colors flex justify-center items-center ${n.status==='resolvido'?'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300':'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50'}`}><CheckCircle2 size={16} className="mr-2" /> {n.status==='resolvido'?'Reabrir':'Marcar Resolvido'}</button></div>))}</div></div>
          )}

          {currentView === 'propriedades' && (
             <div className="animate-in fade-in space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h3 className="text-xl sm:text-2xl font-black"><MapPin className="mr-3 text-blue-500 inline" /> Fazendas</h3><button onClick={() => { setEditingPropriedade(null); setIsPropriedadeFormOpen(true); }} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold shadow-sm"><Plus className="mr-2 inline" /> Nova Fazenda</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">{(appData.propriedades || []).map((p) => (<div key={p.id} className={`bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border shadow-sm ${activePropriedadeId === p.id ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200 dark:border-slate-700'}`}><div className="flex justify-between items-start mb-4"><h4 className="font-black text-xl sm:text-2xl flex-1 pr-4">{p.nome} {activePropriedadeId === p.id && <span className="block mt-1 text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md w-max">Ativa</span>}</h4><div className="shrink-0"><button onClick={() => { setEditingPropriedade(p); setIsPropriedadeFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('propriedades', p.id, 'Excluir?', () => { if(activePropriedadeId === p.id) setActivePropriedadeId((appData.propriedades || []).find(x=>x.id!==p.id)?.id || 1); })} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></div></div><div className="space-y-1.5 text-sm font-medium text-gray-500 dark:text-slate-400 mt-2"><p><strong className="text-gray-900 dark:text-slate-200">Responsável:</strong> {p.responsavel}</p><p><strong className="text-gray-900 dark:text-slate-200">Localização:</strong> {p.cidade} - {p.estado}</p><p><strong className="text-gray-900 dark:text-slate-200">Área:</strong> {p.area_ha} ha</p></div><button onClick={() => setActivePropriedadeId(p.id)} disabled={activePropriedadeId === p.id} className={`w-full py-3 sm:py-3.5 mt-6 rounded-xl font-bold transition-all text-sm sm:text-base ${activePropriedadeId === p.id ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed' : 'bg-gray-900 dark:bg-slate-950 text-white hover:bg-black shadow-md'}`}>{activePropriedadeId === p.id ? 'Em Uso' : 'Mudar para esta Fazenda'}</button></div>))}</div></div>
          )}

          {currentView === 'configuracoes' && (
            <div className="animate-in fade-in space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm"><h3 className="font-black mb-6 text-lg sm:text-xl"><Users className="inline mr-2 text-indigo-600"/> Utilizadores / Acessos</h3><button onClick={() => { setEditingUsuario(null); setIsUsuarioFormOpen(true); }} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-5 py-3 rounded-xl font-bold mb-6 flex justify-center items-center"><Plus className="mr-2"/> Adicionar Utilizador</button><div className="overflow-x-auto w-full"><table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700"><thead className="bg-gray-50 dark:bg-slate-900/50"><tr><th className={thCls}>Nome</th><th className={thCls}>Email</th><th className={`${thCls} text-right`}>Ações</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">{(appData.usuarios || []).map((u) => (<tr key={u.id} className={tableRowCls}><td className={tdCls}><span className="font-black text-sm sm:text-base block">{u.nome}</span><span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">{u.role}</span></td><td className={tdCls}><span className="text-sm font-medium text-gray-600 dark:text-slate-400">{u.email}</span></td><td className={`${tdCls} text-right`}><button onClick={() => { setEditingUsuario(u); setIsUsuarioFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg mr-1"><Edit size={18}/></button><button onClick={() => del('usuarios', u.id, 'Remover?')} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-700 relative overflow-hidden"><Bot size={120} className="absolute -right-5 -bottom-5 text-white/5" /><h3 className="font-black mb-4 text-white text-lg sm:text-xl relative z-10"><Sparkles className="inline text-green-400 mr-2"/> Integração API Gemini (IA)</h3><p className="text-slate-400 text-xs sm:text-sm mb-6 relative z-10 max-w-lg">Cole a chave do Google AI Studio para ativar o assistente e os relatórios automatizados.</p><input type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} placeholder="Sua API Key..." className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-white font-mono text-sm sm:text-base relative z-10 shadow-inner" /></div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 text-center shadow-sm"><FileSpreadsheet size={48} className="mx-auto text-green-600 mb-4" /><h3 className="font-black mb-2 text-xl sm:text-2xl">Exportar Planilhas</h3><p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mb-6">Descarregue os dados em formato CSV compatível com Excel.</p><div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"><button onClick={exportRebanho} className="bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-800 dark:text-green-400 font-bold px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"><Download size={18} className="mr-2"/> Exportar Rebanho</button><button onClick={exportFinanceiro} className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-400 font-bold px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"><Download size={18} className="mr-2"/> Exportar Finanças</button><button onClick={exportReproducao} className="bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-800 dark:text-pink-400 font-bold px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"><Download size={18} className="mr-2"/> Exportar Reprodução</button></div></div>
            </div>
          )}

        </div>
      </main>

      {/* --- MODAIS DE FORMULÁRIO (Comprimidos visualmente, mas integrais no design premium) --- */}
      {isAnimalFormOpen && (
        <div className={modalOverlay}><div className={modalLarge}><div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl"><Beef className="inline mr-2 text-green-600"/>{editingAnimal ? 'Editar' : 'Novo'} Animal</h2><button onClick={()=>{setIsAnimalFormOpen(false);setEditingAnimal(null);}} className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><div className="overflow-y-auto"><form id="af" onSubmit={handleSaveAnimal} className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Brinco*</label><input required name="brinco" defaultValue={editingAnimal?.brinco||''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Nome (Opcional)</label><input name="nome" defaultValue={editingAnimal?.nome!=='-'?editingAnimal?.nome:''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-green-700 dark:text-green-400">Peso (kg)*</label><input required type="number" name="peso" defaultValue={editingAnimal?.peso||''} className={`${inputCls} font-black`} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Lote</label><select name="lote" defaultValue={editingAnimal?.lote||''} className={inputCls}><option value="">Nenhum</option>{cLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}</select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Tipo</label><select name="tipo" defaultValue={editingAnimal?.tipo||'Corte'} className={inputCls}><option value="Corte">Corte</option><option value="Leite">Leite</option></select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Sexo</label><select name="sexo" defaultValue={editingAnimal?.sexo||'F'} className={inputCls}><option value="F">Fêmea</option><option value="M">Macho</option></select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Categoria</label><select name="categoria" defaultValue={editingAnimal?.categoria||'Bezerro'} className={inputCls}><option value="Bezerro">Bezerro(a)</option><option value="Novilha">Novilha</option><option value="Garrote">Garrote</option><option value="Vaca">Vaca</option><option value="Boi Gordo">Boi Gordo</option><option value="Touro">Touro</option></select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Raça</label><input required name="raca" defaultValue={editingAnimal?.raca||'Nelore'} className={inputCls} /></div><div className="sm:col-span-2"><label className="font-bold text-xs sm:text-sm mb-1.5 block">Data Nasc.</label><input type="date" required name="dataNasc" defaultValue={editingAnimal?.dataNasc || new Date().toISOString().split('T')[0]} className={inputCls} /></div></form></div><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsAnimalFormOpen(false);setEditingAnimal(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="af" className={`${btnSave} bg-green-600 hover:bg-green-700`}><Save size={18} className="mr-2"/> Salvar</button></div></div></div>
      )}

      {isBatchAnimalFormOpen && (
        <div className={modalOverlay}><div className={modalLarge}><div className="p-5 sm:p-6 border-b border-indigo-100 dark:border-slate-700 bg-indigo-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-indigo-900 dark:text-indigo-400"><ListPlus className="inline mr-2"/>Lote de Animais</h2><button onClick={()=>setIsBatchAnimalFormOpen(false)} className="text-indigo-400 hover:text-indigo-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><div className="overflow-y-auto"><form id="baf" onSubmit={handleSaveBatchAnimais} className="p-6 sm:p-8"><div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Prefixo</label><input name="prefixo" placeholder="Ex: NEL-" className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Início*</label><input required type="number" name="inicio" defaultValue="1" className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-indigo-700 dark:text-indigo-400">Quantidade*</label><input required type="number" name="quantidade" defaultValue="10" className={`${inputCls} font-black border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100`} /></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Raça</label><input required name="raca" defaultValue="Nelore" className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Peso Médio*</label><input required type="number" name="peso" defaultValue="200" className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Destino</label><select name="lote" className={inputCls}><option value="">Sem Lote</option>{cLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}</select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Categoria</label><select name="categoria" className={inputCls}><option value="Bezerro">Bezerros(as)</option><option value="Novilha">Novilhas</option><option value="Garrote">Garrotes</option></select></div><input type="hidden" name="sexo" value="F"/><input type="hidden" name="tipo" value="Corte"/><input type="hidden" name="dataNasc" value={new Date().toISOString().split('T')[0]}/></div></form></div><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>setIsBatchAnimalFormOpen(false)} className={btnCancel}>Cancelar</button><button type="submit" form="baf" className={`${btnSave} bg-indigo-600 hover:bg-indigo-700`}>Gerar Lote</button></div></div></div>
      )}

      {isPesagemFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-orange-100 dark:border-slate-700 bg-orange-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-orange-900 dark:text-orange-400"><Scale className="inline mr-2"/>{editingPesagem ? 'Editar Pesagem' : 'Nova Pesagem'}</h2><button onClick={()=>{setIsPesagemFormOpen(false);setEditingPesagem(null);}} className="text-orange-400 hover:text-orange-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="pf" onSubmit={handleSavePesagem} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Brinco*</label><input required name="brinco" defaultValue={editingPesagem?.brinco||''} className={inputCls} placeholder="Ex: 105"/></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-orange-700 dark:text-orange-400">Peso Atual (kg)*</label><input required type="number" name="pesoAtual" defaultValue={editingPesagem?.pesoAtual||''} className={`${inputCls} font-black text-xl sm:text-2xl text-center border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100`} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Data*</label><input required type="date" name="data" defaultValue={editingPesagem?.data || new Date().toISOString().split('T')[0]} className={inputCls} /></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsPesagemFormOpen(false);setEditingPesagem(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="pf" className={`${btnSave} bg-orange-600 hover:bg-orange-700`}>Salvar</button></div></div></div>
      )}

      {isLeiteFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-cyan-100 dark:border-slate-700 bg-cyan-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-cyan-900 dark:text-cyan-400"><Droplets className="inline mr-2"/>Ordenha</h2><button onClick={()=>{setIsLeiteFormOpen(false);setEditingLeite(null);}} className="text-cyan-400 hover:text-cyan-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="lf_m" onSubmit={handleSaveLeite} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Matriz*</label><select required name="brincoMatriz" defaultValue={editingLeite?.brincoMatriz||''} className={inputCls}><option value="">Selecione...</option>{gadoDeLeite.map(v=><option key={v.id} value={v.brinco}>{v.brinco}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-cyan-700 dark:text-cyan-400">Litros*</label><input required type="number" step="0.1" name="litros" defaultValue={editingLeite?.litros||''} className={`${inputCls} font-black text-xl text-center border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-900 dark:text-cyan-100`} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Turno</label><select name="turno" defaultValue={editingLeite?.turno||'Manhã'} className={inputCls}><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option></select></div></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Data*</label><input required type="date" name="data" defaultValue={editingLeite?.data || new Date().toISOString().split('T')[0]} className={inputCls} /></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsLeiteFormOpen(false);setEditingLeite(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="lf_m" disabled={gadoDeLeite.length===0} className={`${btnSave} bg-cyan-600 hover:bg-cyan-700`}>Salvar</button></div></div></div>
      )}

      {isLoteFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-green-100 dark:border-slate-700 bg-green-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-green-900 dark:text-green-400"><LayoutGrid className="inline mr-2"/>Lote / Pasto</h2><button onClick={()=>{setIsLoteFormOpen(false);setEditingLote(null);}} className="text-green-400 hover:text-green-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="loteF" onSubmit={handleSaveLote} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Nome Referência*</label><input required name="nome" defaultValue={editingLote?.nome||''} className={inputCls} placeholder="Ex: Pasto Maternidade" /></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Capacidade*</label><input required type="number" name="capacidade" defaultValue={editingLote?.capacidade||''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Tipo</label><select name="tipo" defaultValue={editingLote?.tipo||'Pasto'} className={inputCls}><option value="Pasto">Pasto Aberto</option><option value="Baia">Confinamento</option></select></div></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Observações</label><textarea name="obs" rows={2} defaultValue={editingLote?.obs||''} className={`${inputCls} resize-none`}></textarea></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsLoteFormOpen(false);setEditingLote(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="loteF" className={`${btnSave} bg-green-600 hover:bg-green-700`}>Salvar</button></div></div></div>
      )}

      {isFinanceFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-green-100 dark:border-slate-700 bg-green-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-green-900 dark:text-green-400"><DollarSign className="inline mr-2"/>Lançamento</h2><button onClick={()=>{setIsFinanceFormOpen(false);setEditingFinance(null);}} className="text-green-400 hover:text-green-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="finF" onSubmit={handleSaveFinance} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Descrição*</label><input required name="descricao" defaultValue={editingFinance?.descricao||''} className={inputCls} placeholder="Ex: Venda Bezerras" /></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Fluxo</label><select name="tipo" defaultValue={editingFinance?.tipo||'receita'} className={`${inputCls} font-black`}><option value="receita" className="text-green-600">Receita (+)</option><option value="despesa" className="text-red-600">Despesa (-)</option></select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Valor (R$)*</label><input required type="number" step="0.01" name="valor" defaultValue={editingFinance?.valor||''} className={`${inputCls} font-black text-right`} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Data*</label><input required type="date" name="data" defaultValue={editingFinance?.data || new Date().toISOString().split('T')[0]} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Categoria</label><input required name="categoria" defaultValue={editingFinance?.categoria||'Geral'} className={inputCls} /></div></div><input type="hidden" name="status" value={editingFinance?.status || 'pago'}/></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsFinanceFormOpen(false);setEditingFinance(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="finF" className={`${btnSave} bg-green-600 hover:bg-green-700`}>Efetivar</button></div></div></div>
      )}

      {isReproducaoFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-pink-100 dark:border-slate-700 bg-pink-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-pink-900 dark:text-pink-400"><HeartPulse className="inline mr-2"/>Inseminação/Monta</h2><button onClick={()=>{setIsReproducaoFormOpen(false);setEditingReproducao(null);}} className="text-pink-400 hover:text-pink-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="repF" onSubmit={handleSaveReproducao} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Matriz*</label><input required name="brincoVaca" defaultValue={editingReproducao?.brincoVaca||''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Sêmen/Touro*</label><input required name="reprodutor" defaultValue={editingReproducao?.reprodutor||''} className={inputCls} placeholder="Ex: Nelore PO 5543" /></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Método</label><select name="metodo" defaultValue={editingReproducao?.metodo||'IA'} className={inputCls}><option value="IA">IA</option><option value="IATF">IATF</option><option value="TE">TE</option><option value="Monta Natural">Monta Natural</option></select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Data*</label><input required type="date" name="dataInseminacao" defaultValue={editingReproducao?.dataInseminacao || new Date().toISOString().split('T')[0]} className={inputCls} /></div></div><input type="hidden" name="status" value={editingReproducao?.status || 'Prenhe'} /></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsReproducaoFormOpen(false);setEditingReproducao(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="repF" className={`${btnSave} bg-pink-600 hover:bg-pink-700`}>Salvar</button></div></div></div>
      )}

      {isNascimentoFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-blue-100 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-blue-900 dark:text-blue-400"><Baby className="inline mr-2"/>Registo Nascimento</h2><button onClick={()=>{setIsNascimentoFormOpen(false);setEditingNascimento(null);}} className="text-blue-400 hover:text-blue-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="nasF" onSubmit={handleAddNascimento} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Matriz*</label><input required name="brincoMatriz" className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-blue-700 dark:text-blue-400">Cria*</label><input required name="brincoBezerro" className={`${inputCls} font-black border-blue-200 dark:border-blue-800`} /></div></div><div className="grid grid-cols-3 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Sexo</label><select name="sexo" className={inputCls}><option value="M">M</option><option value="F">F</option></select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Peso*</label><input required type="number" name="pesoNascimento" defaultValue="35" className={`${inputCls} text-center`} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Data*</label><input required type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} className={inputCls} /></div></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Raça</label><input required name="raca" defaultValue="Nelore" className={inputCls} /></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsNascimentoFormOpen(false);setEditingNascimento(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="nasF" className={`${btnSave} bg-blue-600 hover:bg-blue-700`}>Registar</button></div></div></div>
      )}

      {isVaccineFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-red-100 dark:border-slate-700 bg-red-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-red-900 dark:text-red-400"><ShieldAlert className="inline mr-2"/>Tratamento Lote</h2><button onClick={()=>{setIsVaccineFormOpen(false);setEditingVaccine(null);}} className="text-red-400 hover:text-red-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="vacF" onSubmit={handleSaveVaccine} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Med./Vacina*</label><input required name="vacina" defaultValue={editingVaccine?.vacina||''} className={inputCls} /></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Lote Alvo</label><select name="lote" defaultValue={editingVaccine?.lote||'Todo o Rebanho'} className={inputCls}><option value="Todo o Rebanho">Todo Rebanho</option>{cLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}</select></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Cabeças</label><input required type="number" name="qtdAnimais" defaultValue={editingVaccine?.qtdAnimais||1} className={inputCls} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Data Aplic.*</label><input required type="date" name="dataAplicacao" defaultValue={editingVaccine?.dataAplicacao || new Date().toISOString().split('T')[0]} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-red-700 dark:text-red-400">Carência(dias)</label><input required type="number" name="carenciaDias" defaultValue={editingVaccine?.carenciaDias||0} className={`${inputCls} font-black bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100`} /></div></div><input type="hidden" name="status" value="concluida"/></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsVaccineFormOpen(false);setEditingVaccine(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="vacF" className={`${btnSave} bg-red-600 hover:bg-red-700`}>Efetivar</button></div></div></div>
      )}

      {isInsumoFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-purple-100 dark:border-slate-700 bg-purple-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-purple-900 dark:text-purple-400"><Archive className="inline mr-2"/>Entrada Insumo</h2><button onClick={()=>{setIsInsumoFormOpen(false);setEditingInsumo(null);}} className="text-purple-400 hover:text-purple-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="insF" onSubmit={handleSaveInsumo} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Produto*</label><input required name="nome" defaultValue={editingInsumo?.nome||''} className={inputCls} /></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Categoria</label><input required name="categoria" defaultValue={editingInsumo?.categoria||'Nutrição'} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Unidade</label><input required name="unidade" defaultValue={editingInsumo?.unidade||''} placeholder="kg, L..." className={inputCls} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Qtd Entrada*</label><input required type="number" step="0.01" name="quantidade" defaultValue={editingInsumo?.quantidade||''} className={`${inputCls} font-black`} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-purple-700 dark:text-purple-400">Estoque Mín.</label><input required type="number" step="0.01" name="estoqueMinimo" defaultValue={editingInsumo?.estoqueMinimo||10} className={`${inputCls} bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100 font-bold`} /></div></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsInsumoFormOpen(false);setEditingInsumo(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="insF" className={`${btnSave} bg-purple-600 hover:bg-purple-700`}>Salvar</button></div></div></div>
      )}

      {isConsumoFormOpen && consumoInsumoSelecionado && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-orange-100 dark:border-slate-700 bg-orange-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-orange-900 dark:text-orange-400"><MinusCircle className="inline mr-2"/>Lançar Consumo</h2><button onClick={()=>{setIsConsumoFormOpen(false);setConsumoInsumoSelecionado(null);}} className="text-orange-400 hover:text-orange-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="consF" onSubmit={handleLancarConsumo} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div className="bg-orange-100/50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50"><p className="text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">Stock Disponível</p><p className="text-2xl font-black text-orange-900 dark:text-orange-100">{consumoInsumoSelecionado.quantidade} <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{consumoInsumoSelecionado.unidade}</span></p><p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mt-2 truncate">{consumoInsumoSelecionado.nome}</p></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block text-orange-700 dark:text-orange-400">Subtrair ao Estoque*</label><input required type="number" step="0.01" name="quantidadeConsumo" max={consumoInsumoSelecionado.quantidade} className={`${inputCls} font-black text-2xl text-center bg-white dark:bg-slate-950 border-2 border-orange-300 dark:border-orange-600 text-orange-900 dark:text-orange-100 shadow-inner py-4`} autoFocus /></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsConsumoFormOpen(false);setConsumoInsumoSelecionado(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="consF" className={`${btnSave} bg-orange-600 hover:bg-orange-700`}>Consumir</button></div></div></div>
      )}

      {isPropriedadeFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-blue-100 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-blue-900 dark:text-blue-400"><MapPin className="inline mr-2"/>{editingPropriedade ? 'Editar' : 'Nova'} Fazenda</h2><button onClick={()=>{setIsPropriedadeFormOpen(false);setEditingPropriedade(null);}} className="text-blue-400 hover:text-blue-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="propF" onSubmit={handleSavePropriedade} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Nome*</label><input required name="nome" defaultValue={editingPropriedade?.nome||''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Responsável*</label><input required name="responsavel" defaultValue={editingPropriedade?.responsavel||''} className={inputCls} /></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Município</label><input required name="cidade" defaultValue={editingPropriedade?.cidade||'Rondonópolis'} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">UF</label><input required name="estado" maxLength={2} defaultValue={editingPropriedade?.estado||'MT'} className={`${inputCls} uppercase text-center font-bold`} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Área (ha)</label><input required type="number" name="area_ha" defaultValue={editingPropriedade?.area_ha||''} className={`${inputCls} font-black`} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">IE</label><input name="ie" defaultValue={editingPropriedade?.ie||''} className={inputCls} placeholder="Opcional" /></div></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsPropriedadeFormOpen(false);setEditingPropriedade(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="propF" className={`${btnSave} bg-blue-600 hover:bg-blue-700`}>Salvar</button></div></div></div>
      )}

      {isUsuarioFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-indigo-100 dark:border-slate-700 bg-indigo-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-indigo-900 dark:text-indigo-400"><Users className="inline mr-2"/>{editingUsuario ? 'Editar' : 'Novo'} Acesso</h2><button onClick={()=>{setIsUsuarioFormOpen(false);setEditingUsuario(null);}} className="text-indigo-400 hover:text-indigo-600 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="usrF" onSubmit={handleSaveUsuario} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Nome*</label><input required name="nome" defaultValue={editingUsuario?.nome||''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Email*</label><input required type="email" name="email" defaultValue={editingUsuario?.email||''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Senha*</label><input required name="senha" defaultValue={editingUsuario?.senha||''} className={inputCls} /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Nível de Acesso</label><select name="role" defaultValue={editingUsuario?.role||'Operador'} className={`${inputCls} font-bold`}><option value="Operador">Operador (Edita Dados)</option><option value="Admin">Admin (Total)</option></select></div></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsUsuarioFormOpen(false);setEditingUsuario(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="usrF" className={`${btnSave} bg-indigo-600 hover:bg-indigo-700`}>Salvar</button></div></div></div>
      )}

      {isCalendarioFormOpen && (
        <div className={modalOverlay}><div className={modalBase}><div className="p-5 sm:p-6 border-b border-yellow-100 dark:border-slate-700 bg-yellow-50 dark:bg-slate-800 flex justify-between items-center"><h2 className="font-black text-lg sm:text-xl text-yellow-900 dark:text-yellow-400"><CalendarDays className="inline mr-2"/>Novo Evento</h2><button onClick={()=>{setIsCalendarioFormOpen(false);setEditingCalendario(null);}} className="text-yellow-500 hover:text-yellow-700 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm"><X size={18}/></button></div><form id="calF" onSubmit={handleSaveCalendario} className="p-6 sm:p-8 space-y-4 sm:space-y-6"><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Campanha/Doença*</label><input required name="doenca" defaultValue={editingCalendario?.doenca||''} className={inputCls} placeholder="Ex: Aftosa" /></div><div><label className="font-bold text-xs sm:text-sm mb-1.5 block">Mês*</label><input required name="mes" defaultValue={editingCalendario?.mes||''} className={inputCls} placeholder="Ex: Novembro" /></div><input type="hidden" name="publico" value="Geral"/><input type="hidden" name="obrigatorio" value="true"/></form><div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={()=>{setIsCalendarioFormOpen(false);setEditingCalendario(null);}} className={btnCancel}>Cancelar</button><button type="submit" form="calF" className={`${btnSave} bg-yellow-600 hover:bg-yellow-700`}>Salvar</button></div></div></div>
      )}

      {emailModalData && (
        <div className={modalOverlay}><div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in duration-300 border dark:border-slate-700"><div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 sm:mb-6"><CheckCircle2 size={24} className="sm:w-8 sm:h-8" /></div><h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">Conta Criada!</h2><p className="text-gray-500 dark:text-slate-400 font-medium mb-4 sm:mb-6 text-xs sm:text-sm">Envie o acesso para o operador.</p><div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 text-left mb-4 sm:mb-6 space-y-2 sm:space-y-3"><p className="text-xs sm:text-sm"><span className="font-bold text-gray-400 uppercase">Login:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{emailModalData.email}</span></p><p className="text-xs sm:text-sm"><span className="font-bold text-gray-400 uppercase">Senha:</span> <code className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-600 px-2 py-1 rounded-lg font-mono text-gray-900 dark:text-white block mt-1">{emailModalData.senha}</code></p></div><div className="flex gap-2 sm:gap-3"><button onClick={() => setEmailModalData(null)} className={btnCancel}>Fechar</button><button onClick={handleSendEmail} className={`${btnSave} bg-indigo-600 hover:bg-indigo-700`}><Mail size={16} className="mr-1 sm:mr-2" /> Enviar</button></div></div></div>
      )}
      
    </div>
  );
}
