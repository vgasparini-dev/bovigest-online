// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search, Plus, MapPin, DollarSign, HeartPulse, 
  LayoutGrid, X, Trash2, Edit, Baby, LayoutDashboard, Scale, Settings, Sparkles, Bot, Send, 
  Loader2, CheckCircle2, Download, Archive, Target, PackagePlus, AlertTriangle, ListPlus, 
  ShieldAlert, Wheat, Calculator, Users, CalendarDays, KeyRound, FileSpreadsheet, Mail, 
  MessageSquare, Save, NotebookPen, Cloud, CloudOff, MinusCircle
} from 'lucide-react';

// --- IMPORTAÇÕES DA NUVEM (FIREBASE) ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE (Chaves da sua Imagem) ---
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
const db = getFirestore(app);

// --- BASE DE DADOS INICIAL ---
const defaultData = {
  propriedades: [{ id: 1, nome: "Fazenda São João", responsavel: "Victor Luiz Gasparini", cidade: "Jaru", estado: "RO", area_ha: 350, ie: "123.456.789-00" }],
  usuarios: [
    { id: 1, nome: "Victor Luiz Gasparini", email: "victorluizgasparini@gmail.com", senha: "Lu1z1502#", role: "Admin", status: "Ativo" },     
    { id: 2, nome: "Lucas Winter", email: "lucasff99@hotmail.com", senha: "123456", role: "Operador", status: "Ativo" }
  ],
  calendarioSanitario: [
    { id: 1, propriedadeId: 1, doenca: "Brucelose", mes: "1º Semestre", publico: "Fêmeas de 3 a 8 meses", obrigatorio: true },
    { id: 2, propriedadeId: 1, doenca: "Raiva", mes: "Maio", publico: "Todo o rebanho", obrigatorio: true }
  ],
  lotes: [], animais: [], pesagens: [], reproducao: [], nascimentos: [], vacinacoes: [], insumos: [], financeiro: [], anotacoes: [],
  bibliotecaAlimentos: [
    { id: 1, nome: "Silagem de Milho", ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: "Milho Grão Moído", ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 }
  ]
};

// --- FUNÇÕES UTILITÁRIAS & IA ---
const calcularExigenciasNASEM = (peso, gpd) => {
  const pM = Math.pow(peso, 0.75);
  return { cms: peso * 0.022, elm: 0.077 * pM, elg: 0.063 * pM * Math.pow(gpd, 1.097), pm: (3.8 * pM) + (gpd * 250), ca: 15 + (gpd * 10), p: 10 + (gpd * 8) };
};

const callGemini = async (prompt, sys, userApiKey, url, model) => {
  if (!userApiKey) return "⚠️ API Key do Gemini não configurada na aba Configurações.";
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
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sanidadeTab, setSanidadeTab] = useState('registos');
  const [activePropriedadeId, setActivePropriedadeId] = useState(1);

  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('bovigest_gemini_api_key') || '');
  const [aiEndpoint, setAiEndpoint] = useState(() => localStorage.getItem('bovigest_ai_endpoint') || 'https://generativelanguage.googleapis.com/v1beta/models');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('bovigest_ai_model') || 'gemini-2.5-flash-preview-09-2025');

  // Modais State
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
  const [emailModalData, setEmailModalData] = useState(null);

  const [nutriAlvoPeso, setNutriAlvoPeso] = useState(400);
  const [nutriAlvoGPD, setNutriAlvoGPD] = useState(1.2);
  const [dietaAtual, setDietaAtual] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState("");

  const [aiInsights, setAiInsights] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: 'Olá! Sou o seu Consultor IA. Como posso ajudar hoje?' }]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- NUVEM & PERSISTÊNCIA ---
  const [appData, setAppData] = useState(defaultData);
  const [isCloudReady, setIsCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('connecting');

  useEffect(() => {
    const docRef = doc(db, 'bovigest', 'dados_principais');
    const initCloud = async () => {
      try {
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          const savedLocal = localStorage.getItem('bovigest_data_pro_master');
          const dataToSave = savedLocal ? { ...defaultData, ...JSON.parse(savedLocal) } : defaultData;
          await setDoc(docRef, dataToSave);
          setAppData(dataToSave);
        }
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
             // FUNDAMENTAL: Garantir que se a nuvem vier incompleta, faz fallback para defaultData
             setAppData(prev => ({ ...defaultData, ...docSnap.data() }));
          }
          setIsCloudReady(true);
          setCloudStatus('online');
        });
      } catch (error) {
        console.error("Erro Firebase:", error);
        const saved = localStorage.getItem('bovigest_data_pro_master');
        if (saved) setAppData({ ...defaultData, ...JSON.parse(saved) });
        setCloudStatus('error');
      }
    };
    initCloud();
  }, []);

  const updateAppData = (updater) => {
    setAppData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      if (isCloudReady) setDoc(doc(db, 'bovigest', 'dados_principais'), newData).catch(console.error);
      localStorage.setItem('bovigest_data_pro_master', JSON.stringify(newData));
      return newData;
    });
  };

  useEffect(() => { localStorage.setItem('bovigest_gemini_api_key', geminiApiKey); }, [geminiApiKey]);
  useEffect(() => { localStorage.setItem('bovigest_ai_endpoint', aiEndpoint); }, [aiEndpoint]);
  useEffect(() => { localStorage.setItem('bovigest_ai_model', aiModel); }, [aiModel]);

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value, senha = e.target.senha.value;
    const validUser = (appData.usuarios || []).find(u => u.email === email && u.senha === senha && (u.status === 'Ativo' || u.status === 'Pendente'));
    
    if (validUser) { 
      if (validUser.status === 'Pendente') {
        alert(`Bem-vindo(a), ${validUser.nome}! Conta ativada.`);
        updateAppData(p => ({ ...p, usuarios: (p.usuarios || []).map(u => u.id === validUser.id ? { ...u, status: 'Ativo' } : u) }));
      }
      setCurrentUser({ ...validUser, status: 'Ativo' }); setIsLoggedIn(true); setLoginError(""); 
    } else { setLoginError("Credenciais inválidas."); }
  };

  // --- ACESSO SEGURO AOS DADOS COM FALLBACK (Prevenção de Tela Branca) ---
  const propriedadeAtiva = useMemo(() => (appData.propriedades || []).find(p => p.id === activePropriedadeId) || (appData.propriedades || [])[0] || {}, [activePropriedadeId, appData.propriedades]);
  const cAnimais = useMemo(() => (appData.animais || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.animais, activePropriedadeId]);
  const cLotes = useMemo(() => (appData.lotes || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.lotes, activePropriedadeId]);
  const cFinanceiro = useMemo(() => (appData.financeiro || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.financeiro, activePropriedadeId]);
  const cPesagens = useMemo(() => (appData.pesagens || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.pesagens, activePropriedadeId]);
  const cReproducao = useMemo(() => (appData.reproducao || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.reproducao, activePropriedadeId]);
  const cNascimentos = useMemo(() => (appData.nascimentos || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.nascimentos, activePropriedadeId]);
  const cVacinacoes = useMemo(() => (appData.vacinacoes || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.vacinacoes, activePropriedadeId]);
  const cInsumos = useMemo(() => (appData.insumos || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.insumos, activePropriedadeId]);
  const cCalendario = useMemo(() => (appData.calendarioSanitario || []).filter(a => a.propriedadeId === activePropriedadeId), [appData.calendarioSanitario, activePropriedadeId]);

  const totaisFin = useMemo(() => cFinanceiro.reduce((acc, item) => {
    if (item.status === 'pago') item.tipo === 'receita' ? acc.rec += Number(item.valor) : acc.desp += Number(item.valor);
    return acc;
  }, { rec: 0, desp: 0 }), [cFinanceiro]);
  
  const saldoAtual = totaisFin.rec - totaisFin.desp;
  const pesoMedio = cAnimais.length === 0 ? 0 : Math.round(cAnimais.reduce((acc, a) => acc + Number(a.peso), 0) / cAnimais.length);
  const custoPorArroba = cAnimais.length === 0 ? 0 : totaisFin.desp / (cAnimais.reduce((acc, a) => acc + Number(a.peso), 0) / 30);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const showSaveSuccess = () => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); };
  
  const isEmCarencia = (lote) => {
    const hoje = new Date();
    const v = (appData.vacinacoes || []).find(v => (v.lote === lote || v.lote === "Todo o Rebanho") && v.dataLiberacao && hoje < new Date(v.dataLiberacao));
    return v || false;
  };

  // --- HANDLERS FORMS (GRAVAÇÃO NA NUVEM) ---
  const handleSaveAnimal = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { id: editingAnimal ? editingAnimal.id : Date.now(), propriedadeId: activePropriedadeId, brinco: fd.get('brinco'), nome: fd.get('nome') || "-", sexo: fd.get('sexo'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'), dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote: fd.get('lote') || "Sem Lote", obs: fd.get('obs') || "", ativo: true };
    updateAppData(p => ({ ...p, animais: editingAnimal ? (p.animais || []).map(a => a.id === obj.id ? obj : a) : [obj, ...(p.animais || [])] }));
    setIsAnimalFormOpen(false); setEditingAnimal(null); showSaveSuccess();
  };

  const handleSavePesagem = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const brinco = fd.get('brinco'); const pesoAtual = Number(fd.get('pesoAtual'));
    const obj = { id: editingPesagem ? editingPesagem.id : Date.now(), propriedadeId: activePropriedadeId, brinco, data: fd.get('data'), pesoAnterior: editingPesagem ? editingPesagem.pesoAnterior : (cAnimais.find(a=>a.brinco===brinco)?.peso || 0), pesoAtual, obs: "" };
    updateAppData(p => ({ 
      ...p, pesagens: editingPesagem ? (p.pesagens || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.pesagens || [])],
      animais: (p.animais || []).map(a => a.brinco === brinco && a.propriedadeId === activePropriedadeId ? { ...a, peso: pesoAtual } : a)
    }));
    setIsPesagemFormOpen(false); setEditingPesagem(null); showSaveSuccess();
  };

  const handleSaveNascimento = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { id: editingNascimento ? editingNascimento.id : Date.now(), propriedadeId: activePropriedadeId, data: fd.get('data'), brincoMatriz: fd.get('brincoMatriz'), brincoBezerro: fd.get('brincoBezerro'), sexo: fd.get('sexo'), pesoNascimento: Number(fd.get('pesoNascimento')), obs: fd.get('obs') || "" };
    updateAppData(p => ({ 
      ...p, nascimentos: editingNascimento ? (p.nascimentos || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.nascimentos || [])],
      animais: editingNascimento ? p.animais : [{ id: Date.now()+1, propriedadeId: activePropriedadeId, brinco: obj.brincoBezerro, nome: "-", sexo: obj.sexo, categoria: "Bezerro(a)", tipo: "Cria", raca: "Nelore", dataNasc: obj.data, peso: obj.pesoNascimento, lote: "Maternidade", obs: "Nascimento", ativo: true }, ...(p.animais || [])]
    }));
    setIsNascimentoFormOpen(false); setEditingNascimento(null); showSaveSuccess();
  };

  const handleSaveVaccine = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const cd = Number(fd.get('carenciaDias'));
    let dl = null; if (cd > 0) { const d = new Date(fd.get('dataAplicacao')); d.setDate(d.getDate() + cd); dl = d.toISOString().split('T')[0]; }
    const obj = { id: editingVaccine ? editingVaccine.id : Date.now(), propriedadeId: activePropriedadeId, vacina: fd.get('vacina'), lote: fd.get('lote'), dataAplicacao: fd.get('dataAplicacao'), qtdAnimais: Number(fd.get('qtdAnimais')), carenciaDias: cd, dataLiberacao: dl, status: "concluida" };
    updateAppData(p => ({ ...p, vacinacoes: editingVaccine ? (p.vacinacoes || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.vacinacoes || [])] }));
    setIsVaccineFormOpen(false); setEditingVaccine(null); showSaveSuccess();
  };

  const handleSaveFinance = (e) => { 
    e.preventDefault(); const fd = new FormData(e.target); 
    const obj = { id: editingFinance ? editingFinance.id : Date.now(), propriedadeId: activePropriedadeId, descricao: fd.get('descricao'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), valor: Number(fd.get('valor')), data: fd.get('data'), status: 'pago' };
    updateAppData(p => ({ ...p, financeiro: editingFinance ? (p.financeiro || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.financeiro || [])] }));
    setIsFinanceFormOpen(false); setEditingFinance(null); showSaveSuccess(); 
  };
  
  const handleSaveInsumo = (e) => { 
    e.preventDefault(); const fd = new FormData(e.target); 
    const obj = { id: editingInsumo ? editingInsumo.id : Date.now(), propriedadeId: activePropriedadeId, nome: fd.get('nome'), categoria: fd.get('categoria'), quantidade: Number(fd.get('quantidade')), unidade: fd.get('unidade'), estoqueMinimo: Number(fd.get('estoqueMinimo')) };
    updateAppData(p => ({ ...p, insumos: editingInsumo ? (p.insumos || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.insumos || [])] }));
    setIsInsumoFormOpen(false); setEditingInsumo(null); showSaveSuccess(); 
  };

  const handleLancarConsumo = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const qtd = Number(fd.get('quantidadeConsumo'));
    updateAppData(p => ({ ...p, insumos: (p.insumos || []).map(i => i.id === consumoInsumoSelecionado.id ? { ...i, quantidade: Math.max(0, i.quantidade - qtd) } : i) }));
    setIsConsumoFormOpen(false); setConsumoInsumoSelecionado(null); showSaveSuccess();
  };
  
  const handleSaveReproducao = (e) => { 
    e.preventDefault(); const fd = new FormData(e.target); 
    const dI = fd.get('dataInseminacao'); const pP = new Date(new Date(dI).setDate(new Date(dI).getDate() + 290)).toISOString().split('T')[0]; 
    const obj = { id: editingReproducao ? editingReproducao.id : Date.now(), propriedadeId: activePropriedadeId, brincoVaca: fd.get('brincoVaca'), dataInseminacao: dI, previsaoParto: pP, metodo: fd.get('metodo'), reprodutor: fd.get('reprodutor'), status: fd.get('status') || "Prenhe" };
    updateAppData(p => ({ ...p, reproducao: editingReproducao ? (p.reproducao || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.reproducao || [])] }));
    setIsReproducaoFormOpen(false); setEditingReproducao(null); showSaveSuccess(); 
  };

  const handleSaveLote = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { id: editingLote ? editingLote.id : Date.now(), propriedadeId: activePropriedadeId, nome: fd.get('nome'), capacidade: Number(fd.get('capacidade')), tipo: fd.get('tipo'), obs: fd.get('obs') || "" };
    updateAppData(p => ({ ...p, lotes: editingLote ? (p.lotes || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.lotes || [])] }));
    setIsLoteFormOpen(false); setEditingLote(null); showSaveSuccess();
  };

  const handleSavePropriedade = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { id: editingPropriedade ? editingPropriedade.id : Date.now(), nome: fd.get('nome'), responsavel: fd.get('responsavel'), cidade: fd.get('cidade'), estado: fd.get('estado'), area_ha: Number(fd.get('area_ha')), ie: fd.get('ie') };
    updateAppData(p => ({ ...p, propriedades: editingPropriedade ? (p.propriedades || []).map(x => x.id === obj.id ? obj : x) : [...(p.propriedades || []), obj] }));
    setIsPropriedadeFormOpen(false); setEditingPropriedade(null); showSaveSuccess();
  };

  // --- EXPORTAÇÕES ---
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [headers.join(','), ...rows.map(e => e.map(item => `"${item}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click();
  };

  const exportRebanho = () => {
    const headers = ['Nº Brinco', 'Nome/Apelido', 'Espécie/Raça', 'Data Nasc.', 'Idade (meses)', 'Categoria', 'Sexo', 'Pelagem/Cor', 'Peso Atual (kg)', 'Peso Anterior (kg)', 'GMD (kg/dia)', 'Status', 'Origem', 'Pasto/Lote', 'Pai (Touro)', 'Mãe (Matriz)', 'Observações'];
    const rows = cAnimais.map(a => {
      const ageMonths = Math.floor((new Date() - new Date(a.dataNasc)) / (1000 * 60 * 60 * 24 * 30));
      const pAnimal = cPesagens.filter(p => p.brinco === a.brinco).sort((x, y) => new Date(y.data) - new Date(x.data));
      const pesoAnt = pAnimal.length > 0 ? pAnimal[0].pesoAnterior : '';
      return [a.brinco, a.nome, a.raca, a.dataNasc, ageMonths, a.categoria, a.sexo, '-', a.peso, pesoAnt, getGPD(a.brinco) || '', a.ativo ? 'Ativo' : 'Inativo', '-', a.lote, '-', '-', a.obs || ''];
    });
    downloadCSV(`Rebanho_${propriedadeAtiva?.nome?.replace(/\s+/g, '_') || 'Fazenda'}.csv`, headers, rows);
  };

  // --- HANDLERS DE EXCLUSÃO ---
  const del = (coll, id, confirmMsg, closeFn) => { if(confirm(confirmMsg)){ updateAppData(p => ({ ...p, [coll]: (p[coll] || []).filter(x => x.id !== id) })); if(closeFn) closeFn(null); showSaveSuccess(); } };

  // --- NAVEGAÇÃO & UI ---
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' },
    { id: 'ai-assistant', icon: Sparkles, label: 'Consultor IA' },
    { id: 'propriedades', icon: MapPin, label: 'Propriedades' },
    { id: 'animais', icon: Beef, label: 'Rebanho', badge: cAnimais.length },
    { id: 'pastagens', icon: LayoutGrid, label: 'Lotes', badge: cLotes.length },
    { id: 'reproducao', icon: HeartPulse, label: 'Inseminações' },
    { id: 'nascimentos', icon: Baby, label: 'Nascimentos', badge: cNascimentos.length },
    { id: 'sanidade', icon: ShieldAlert, label: 'Sanidade Clínica' },
    { id: 'pesagens', icon: Scale, label: 'Pesagens' },
    { id: 'insumos', icon: Archive, label: 'Insumos' },
    { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
    { id: 'configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const animaisEmCarencia = (appData.animais || []).filter(a => isEmCarencia(a.lote)).length;
  const insumosCriticos = (appData.insumos || []).filter(i => i.quantidade <= (i.estoqueMinimo || 0)).length;
  const filteredAnimais = cAnimais.filter(a => a.brinco.includes(searchQuery) || a.nome.toLowerCase().includes(searchQuery.toLowerCase()) || a.categoria.toLowerCase().includes(searchQuery.toLowerCase()) || a.lote.toLowerCase().includes(searchQuery.toLowerCase()));
  const gadoDeCorte = cAnimais.filter(a => a.tipo === 'Corte');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1544866582-90e808381861?q=80&w=2074&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <Tractor size={64} className="text-green-500 mx-auto mb-4 drop-shadow-lg" />
          <h2 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">BoviGest <span className="text-green-500">PRO</span></h2>
          <div className="mt-8 bg-slate-900/90 backdrop-blur-xl py-8 px-8 shadow-2xl rounded-3xl border border-slate-700/50">
            {loginError && <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl font-bold">{loginError}</div>}
            <form className="space-y-6" onSubmit={handleLogin}>
              <input type="email" name="email" required className="w-full px-5 py-4 bg-slate-800 text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none placeholder-slate-500" placeholder="Email de Acesso" />
              <input type="password" name="senha" required className="w-full px-5 py-4 bg-slate-800 text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none placeholder-slate-500" placeholder="Senha" />
              <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 shadow-lg">Aceder ao Portal Nuvem</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const InsumosTable = () => (
    <table className="min-w-full divide-y divide-gray-200"><thead className="bg-purple-50"><tr><th className="px-6 py-4 text-left text-xs font-black text-purple-800 uppercase">Produto</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Qtd Atual</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Ações</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">
      {cInsumos.map((ins) => (
        <tr key={ins.id} className="hover:bg-gray-50"><td className="px-6 py-4"><span className="block font-black text-gray-900">{ins.nome}</span><span className="text-sm font-bold text-gray-500">{ins.categoria}</span></td><td className="px-6 py-4 text-right font-black text-gray-900">{ins.quantidade} {ins.unidade}</td><td className="px-6 py-4 text-right"><button onClick={() => { setConsumoInsumoSelecionado(ins); setIsConsumoFormOpen(true); }} className="text-orange-500 hover:text-orange-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-50 mr-2 inline-flex items-center"><MinusCircle size={14} className="mr-1"/> Consumo</button><button onClick={() => { setEditingInsumo(ins); setIsInsumoFormOpen(true); }} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button><button onClick={() => del('insumos', ins.id, 'Excluir Insumo?')} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button></td></tr>
      ))}
      {cInsumos.length === 0 && <tr><td colSpan={3} className="text-center py-8 font-bold text-gray-400">Nenhum insumo.</td></tr>}
    </tbody></table>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      <aside className="w-72 bg-slate-950 border-r border-slate-900 hidden md:flex flex-col shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50"><Tractor className="text-green-500 mr-4" size={32} /><span className="text-2xl font-black text-white">BoviGest</span></div>
        <div className="px-6 py-4 bg-slate-900/50"><label className="text-xs font-bold text-slate-500 uppercase block mb-2">Propriedade Ativa</label><select value={activePropriedadeId} onChange={(e) => setActivePropriedadeId(Number(e.target.value))} className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500">{(appData.propriedades || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">{navItems.map((item) => { const Icon = item.icon; return (<button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><Icon className="mr-3 h-5 w-5" /><span className="font-bold text-sm">{item.label}</span>{item.badge > 0 && <span className="ml-auto py-0.5 px-2.5 rounded-full text-xs font-bold bg-white/20 text-white">{item.badge}</span>}</button>); })}</nav>
        <div className="p-6"><button onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }} className="w-full py-3 text-slate-400 border border-slate-700/50 hover:text-red-400 rounded-xl font-bold flex justify-center items-center"><LogOut className="mr-2 h-4 w-4" /> Sair</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-screen">
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 shrink-0">
          <h2 className="text-3xl font-extrabold capitalize flex items-center text-gray-900"><LayoutDashboard className="mr-4 text-green-600" size={32} /> {navItems.find(n => n.id === currentView)?.label}</h2>
          <div className="flex items-center space-x-4">
            {cloudStatus === 'online' && <span className="text-xs font-bold text-blue-600 flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"><Cloud size={14} className="mr-1.5" /> Nuvem Ativa</span>}
            {cloudStatus === 'error' && <span className="text-xs font-bold text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-full border border-red-100"><CloudOff size={14} className="mr-1.5" /> Erro Nuvem</span>}
            {saveSuccess && <span className="text-sm font-bold text-green-700 flex items-center bg-green-50 px-4 py-2 rounded-full"><CheckCircle2 size={18} className="mr-2" /> Gravado</span>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {currentView === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100"><div className="bg-blue-50 p-4 rounded-2xl text-blue-600 w-16 mb-4"><Beef size={28} /></div><h3 className="text-5xl font-black">{cAnimais.length}</h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Total Cabeças</p></div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100"><div className="bg-green-50 p-4 rounded-2xl text-green-600 w-16 mb-4"><DollarSign size={28} /></div><h3 className="text-3xl font-black mt-2">{formatCurrency(saldoAtual)}</h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Saldo Global</p></div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100"><div className="bg-orange-50 p-4 rounded-2xl text-orange-600 w-16 mb-4"><Scale size={28} /></div><h3 className="text-5xl font-black">{pesoMedio} <span className="text-xl">kg</span></h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Média de Peso</p></div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100"><div className="bg-pink-50 p-4 rounded-2xl text-pink-600 w-16 mb-4"><HeartPulse size={28} /></div><h3 className="text-5xl font-black">{cReproducao.filter(r=>r.status==='Prenhe').length}</h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Prenhes</p></div>
              </div>
            </div>
          )}

          {currentView === 'animais' && (
            <div className="space-y-6">
              <div className="flex justify-between"><div className="relative w-96"><Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-13 pr-5 py-4 border rounded-2xl outline-none" placeholder="Procurar brinco..." /></div>
              <div className="flex space-x-3"><button onClick={() => setIsBatchAnimalFormOpen(true)} className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center"><ListPlus className="mr-2" /> Lote</button><button onClick={() => { setEditingAnimal(null); setIsAnimalFormOpen(true); }} className="bg-green-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center"><Plus className="mr-2" /> Único</button></div></div>
              <div className="bg-white rounded-3xl border overflow-hidden"><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase">Identificação</th><th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase">Lote</th><th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase">Peso / Status</th><th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase">Ações</th></tr></thead>
              <tbody className="divide-y bg-white">
                {filteredAnimais.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50"><td className="px-8 py-5 font-black">{a.brinco} - {a.nome !== '-' ? a.nome : a.raca}</td><td className="px-8 py-5 font-bold text-gray-700">{a.lote}</td><td className="px-8 py-5 text-right font-black">{a.peso} kg</td><td className="px-8 py-5 text-right"><button onClick={() => { setEditingAnimal(a); setIsAnimalFormOpen(true); }} className="text-blue-500 mr-4"><Edit size={18}/></button><button onClick={() => del('animais', a.id, 'Excluir animal?')} className="text-red-500"><Trash2 size={18}/></button></td></tr>
                ))}
              </tbody></table></div>
            </div>
          )}

          {currentView === 'pastagens' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><LayoutGrid className="mr-3 text-green-600" /> Mapa de Lotes</h3><button onClick={() => { setEditingLote(null); setIsLoteFormOpen(true); }} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Lote</button></div>
              <div className="grid grid-cols-3 gap-6">{cLotes.map(l => (
                <div key={l.id} className="bg-white p-6 rounded-3xl border"><div className="flex justify-between mb-4"><h4 className="font-black">{l.nome}</h4><div><button onClick={() => { setEditingLote(l); setIsLoteFormOpen(true); }} className="text-blue-500 p-1"><Edit size={18}/></button><button onClick={() => del('lotes', l.id, 'Excluir Lote?')} className="text-red-500 p-1"><Trash2 size={18}/></button></div></div><p className="text-sm mb-4">{l.obs}</p><div className="text-3xl font-black">{cAnimais.filter(a=>a.lote===l.nome).length} <span className="text-sm text-gray-400">/ {l.capacidade} cap.</span></div></div>
              ))}</div>
            </div>
          )}

          {currentView === 'reproducao' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><HeartPulse className="mr-3 text-pink-600" /> Reprodução</h3><button onClick={() => { setEditingReproducao(null); setIsReproducaoFormOpen(true); }} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Inseminação</button></div>
              <div className="bg-white rounded-3xl border overflow-hidden"><table className="min-w-full divide-y"><thead className="bg-pink-50"><tr><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Matriz</th><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Data</th><th className="px-6 py-4 text-right text-xs font-black text-pink-800 uppercase">Ações</th></tr></thead><tbody className="divide-y bg-white">
                {cReproducao.map((rep) => (<tr key={rep.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-black">{rep.brincoVaca}</td><td className="px-6 py-4 font-bold">{rep.dataInseminacao}</td><td className="px-6 py-4 text-right"><button onClick={() => { setEditingReproducao(rep); setIsReproducaoFormOpen(true); }} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={() => del('reproducao', rep.id, 'Excluir?')} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}
              </tbody></table></div>
            </div>
          )}

          {currentView === 'pesagens' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><Scale className="mr-3 text-orange-500" /> Pesagens</h3><button onClick={() => { setEditingPesagem(null); setIsPesagemFormOpen(true); }} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Pesagem</button></div>
              <div className="bg-white rounded-3xl border overflow-hidden"><table className="min-w-full divide-y"><thead className="bg-orange-50"><tr><th className="px-6 py-4 text-left text-xs font-black text-orange-800 uppercase">Data / Brinco</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Ações</th></tr></thead><tbody className="divide-y bg-white">
                {cPesagens.map((pes) => (<tr key={pes.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-black">{pes.data} - Brinco: {pes.brinco}</td><td className="px-6 py-4 text-right"><button onClick={() => { setEditingPesagem(pes); setIsPesagemFormOpen(true); }} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={() => del('pesagens', pes.id, 'Excluir?')} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}
              </tbody></table></div>
            </div>
          )}

          {currentView === 'nascimentos' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><Baby className="mr-3 text-blue-500" /> Nascimentos</h3><button onClick={() => { setEditingNascimento(null); setIsNascimentoFormOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Nascimento</button></div>
              <div className="bg-white rounded-3xl border overflow-hidden"><table className="min-w-full divide-y"><thead className="bg-blue-50"><tr><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Matriz &rarr; Bezerro</th><th className="px-6 py-4 text-right text-xs font-black text-blue-800 uppercase">Ações</th></tr></thead><tbody className="divide-y bg-white">
                {cNascimentos.map((n) => (<tr key={n.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-black">{n.brincoMatriz} &rarr; {n.brincoBezerro} ({n.pesoNascimento}kg)</td><td className="px-6 py-4 text-right"><button onClick={() => { setEditingNascimento(n); setIsNascimentoEditFormOpen(true); }} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={() => del('nascimentos', n.id, 'Excluir?')} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}
              </tbody></table></div>
            </div>
          )}

          {currentView === 'financeiro' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><DollarSign className="mr-3 text-green-600" /> Financeiro</h3><button onClick={() => { setEditingFinance(null); setIsFinanceFormOpen(true); }} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Lançamento</button></div>
              <div className="bg-white rounded-3xl border overflow-hidden"><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Descrição</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Valor</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Ações</th></tr></thead><tbody className="divide-y bg-white">
                {cFinanceiro.map((f) => (<tr key={f.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-black">{f.descricao}</td><td className={`px-6 py-4 text-right font-black ${f.tipo==='receita'?'text-green-600':'text-red-600'}`}>{f.tipo==='receita'?'+':'-'}{formatCurrency(f.valor)}</td><td className="px-6 py-4 text-right"><button onClick={() => { setEditingFinance(f); setIsFinanceFormOpen(true); }} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={() => del('financeiro', f.id, 'Excluir?')} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}
              </tbody></table></div>
            </div>
          )}

          {currentView === 'sanidade' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><ShieldAlert className="mr-3 text-red-500" /> Sanidade</h3><button onClick={() => { setEditingVaccine(null); setIsVaccineFormOpen(true); }} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Tratamento</button></div>
              <div className="bg-white rounded-3xl border overflow-hidden"><table className="min-w-full divide-y"><thead className="bg-red-50"><tr><th className="px-6 py-4 text-left text-xs font-black text-red-800 uppercase">Vacina/Med.</th><th className="px-6 py-4 text-right text-xs font-black text-red-800 uppercase">Ações</th></tr></thead><tbody className="divide-y bg-white">
                {cVacinacoes.map((v) => (<tr key={v.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-black">{v.vacina} (Lote: {v.lote})</td><td className="px-6 py-4 text-right"><button onClick={() => { setEditingVaccine(v); setIsVaccineFormOpen(true); }} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={() => del('vacinacoes', v.id, 'Excluir?')} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}
              </tbody></table></div>
            </div>
          )}

          {currentView === 'insumos' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><Archive className="mr-3 text-purple-600" /> Insumos</h3><button onClick={() => { setEditingInsumo(null); setIsInsumoFormOpen(true); }} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Insumo</button></div>
              <div className="bg-white rounded-3xl border overflow-hidden"><InsumosTable /></div>
            </div>
          )}

          {currentView === 'propriedades' && (
             <div className="space-y-6">
             <div className="flex justify-between"><h3 className="text-xl font-black flex items-center"><MapPin className="mr-3 text-blue-500" /> Propriedades</h3><button onClick={() => { setEditingPropriedade(null); setIsPropriedadeFormOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><Plus className="mr-2" /> Propriedade</button></div>
             <div className="grid grid-cols-2 gap-6">{(appData.propriedades || []).map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border"><div className="flex justify-between mb-4"><h4 className="font-black text-2xl">{p.nome}</h4><div><button onClick={() => { setEditingPropriedade(p); setIsPropriedadeFormOpen(true); }} className="text-blue-500 p-1"><Edit size={18}/></button><button onClick={() => del('propriedades', p.id, 'Excluir Propriedade?', () => { if(activePropriedadeId === p.id) setActivePropriedadeId(appData.propriedades.find(x=>x.id!==p.id)?.id || 1); })} className="text-red-500 p-1"><Trash2 size={18}/></button></div></div><p className="text-sm font-bold text-gray-500">{p.cidade} - {p.estado}</p></div>
             ))}</div>
           </div>
          )}

          {currentView === 'configuracoes' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border p-8 text-center">
                <FileSpreadsheet size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">Exportação de Planilhas</h3>
                <div className="flex justify-center gap-4 mt-6">
                  <button onClick={exportRebanho} className="bg-green-50 text-green-800 font-bold px-6 py-3 rounded-xl shadow-sm border border-green-200">Rebanho</button>
                  <button onClick={exportFinanceiro} className="bg-blue-50 text-blue-800 font-bold px-6 py-3 rounded-xl shadow-sm border border-blue-200">Financeiro</button>
                  <button onClick={exportReproducao} className="bg-pink-50 text-pink-800 font-bold px-6 py-3 rounded-xl shadow-sm border border-pink-200">Reprodução</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- MODAIS DE FORMULÁRIO (Simplificados) --- */}
      {isAnimalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden"><div className="p-6 bg-gray-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><Beef className="mr-2 text-green-600"/> {editingAnimal ? 'Editar Animal' : 'Registar Animal Único'}</h2><button onClick={() => setIsAnimalFormOpen(false)}><X/></button></div><form id="af" onSubmit={handleSaveAnimal} className="p-6 grid grid-cols-2 gap-4"><div><label className="font-bold text-sm">Brinco*</label><input required name="brinco" defaultValue={editingAnimal?.brinco||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Peso(kg)*</label><input required type="number" name="peso" defaultValue={editingAnimal?.peso||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Lote</label><select name="lote" defaultValue={editingAnimal?.lote||''} className="w-full p-3 border rounded-xl">{cLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}</select></div><div><label className="font-bold text-sm">Raça</label><input required name="raca" defaultValue={editingAnimal?.raca||'Nelore'} className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="dataNasc" value={new Date().toISOString().split('T')[0]} /><input type="hidden" name="sexo" value="F" /><input type="hidden" name="categoria" value="Bezerro" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsAnimalFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="af" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isPesagemFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-orange-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><Scale className="mr-2 text-orange-600"/> {editingPesagem ? 'Editar Pesagem' : 'Registar Pesagem'}</h2><button onClick={() => setIsPesagemFormOpen(false)}><X/></button></div><form id="pf" onSubmit={handleSavePesagem} className="p-6 space-y-4"><div><label className="font-bold text-sm">Brinco*</label><input required name="brinco" defaultValue={editingPesagem?.brinco||''} className="w-full p-3 border rounded-xl" placeholder="Ex: 105" /></div><div><label className="font-bold text-sm">Peso Atual*</label><input required type="number" name="pesoAtual" defaultValue={editingPesagem?.pesoAtual||''} className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="data" value={new Date().toISOString().split('T')[0]} /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsPesagemFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="pf" className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isLoteFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-green-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><LayoutGrid className="mr-2 text-green-600"/> {editingLote ? 'Editar Lote' : 'Registar Lote'}</h2><button onClick={() => setIsLoteFormOpen(false)}><X/></button></div><form id="lf" onSubmit={handleSaveLote} className="p-6 space-y-4"><div><label className="font-bold text-sm">Nome*</label><input required name="nome" defaultValue={editingLote?.nome||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Capacidade*</label><input required type="number" name="capacidade" defaultValue={editingLote?.capacidade||''} className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="tipo" value="Pasto" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsLoteFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="lf" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isFinanceFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-green-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><DollarSign className="mr-2 text-green-600"/> {editingFinance ? 'Editar Lançamento' : 'Lançamento'}</h2><button onClick={() => setIsFinanceFormOpen(false)}><X/></button></div><form id="ff" onSubmit={handleSaveFinance} className="p-6 space-y-4"><div><label className="font-bold text-sm">Descrição*</label><input required name="descricao" defaultValue={editingFinance?.descricao||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Valor*</label><input required type="number" name="valor" defaultValue={editingFinance?.valor||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Tipo</label><select name="tipo" defaultValue={editingFinance?.tipo||'receita'} className="w-full p-3 border rounded-xl"><option value="receita">Receita</option><option value="despesa">Despesa</option></select></div><input type="hidden" name="data" value={new Date().toISOString().split('T')[0]} /><input type="hidden" name="categoria" value="Geral" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsFinanceFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="ff" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isReproducaoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-pink-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><HeartPulse className="mr-2 text-pink-600"/> {editingReproducao ? 'Editar Inseminação' : 'Registar Inseminação'}</h2><button onClick={() => setIsReproducaoFormOpen(false)}><X/></button></div><form id="rf" onSubmit={handleSaveReproducao} className="p-6 space-y-4"><div><label className="font-bold text-sm">Matriz*</label><input required name="brincoVaca" defaultValue={editingReproducao?.brincoVaca||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Sêmen/Touro*</label><input required name="reprodutor" defaultValue={editingReproducao?.reprodutor||''} className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="dataInseminacao" value={new Date().toISOString().split('T')[0]} /><input type="hidden" name="metodo" value="IA" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsReproducaoFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="rf" className="px-6 py-3 bg-pink-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isVaccineFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-red-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><ShieldAlert className="mr-2 text-red-600"/> {editingVaccine ? 'Editar Tratamento' : 'Novo Tratamento'}</h2><button onClick={() => setIsVaccineFormOpen(false)}><X/></button></div><form id="vf" onSubmit={handleSaveVaccine} className="p-6 space-y-4"><div><label className="font-bold text-sm">Medicamento/Vacina*</label><input required name="vacina" defaultValue={editingVaccine?.vacina||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Lote Alvo</label><select name="lote" defaultValue={editingVaccine?.lote||'Todo o Rebanho'} className="w-full p-3 border rounded-xl"><option value="Todo o Rebanho">Todo o Rebanho</option>{cLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}</select></div><input type="hidden" name="dataAplicacao" value={new Date().toISOString().split('T')[0]} /><input type="hidden" name="carenciaDias" value="0" /><input type="hidden" name="qtdAnimais" value="1" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsVaccineFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="vf" className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isInsumoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-purple-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><Archive className="mr-2 text-purple-600"/> {editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}</h2><button onClick={() => setIsInsumoFormOpen(false)}><X/></button></div><form id="inf" onSubmit={handleSaveInsumo} className="p-6 space-y-4"><div><label className="font-bold text-sm">Produto*</label><input required name="nome" defaultValue={editingInsumo?.nome||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Qtd Adquirida*</label><input required type="number" name="quantidade" defaultValue={editingInsumo?.quantidade||''} className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="categoria" value="Nutrição" /><input type="hidden" name="unidade" value="kg" /><input type="hidden" name="estoqueMinimo" value="10" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsInsumoFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="inf" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isConsumoFormOpen && consumoInsumoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-orange-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><MinusCircle className="mr-2 text-orange-600"/> Lançar Consumo</h2><button onClick={() => setIsConsumoFormOpen(false)}><X/></button></div><form id="cf" onSubmit={handleLancarConsumo} className="p-6 space-y-4"><div><label className="font-bold text-sm">Produto</label><input disabled value={consumoInsumoSelecionado.nome} className="w-full p-3 border rounded-xl bg-gray-50" /></div><div><label className="font-bold text-sm text-orange-600">Qtd a Consumir*</label><input required type="number" name="quantidadeConsumo" max={consumoInsumoSelecionado.quantidade} className="w-full p-3 border border-orange-300 rounded-xl" /></div></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsConsumoFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="cf" className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">Consumir</button></div></div></div>
      )}

      {isNascimentoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-blue-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><Baby className="mr-2 text-blue-600"/> Registar Nascimento</h2><button onClick={() => setIsNascimentoFormOpen(false)}><X/></button></div><form id="nf" onSubmit={handleAddNascimento} className="p-6 space-y-4"><div><label className="font-bold text-sm">Matriz*</label><input required name="brincoMatriz" className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Bezerro(a)*</label><input required name="brincoBezerro" className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Peso Nasc.*</label><input required type="number" name="pesoNascimento" defaultValue="35" className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="data" value={new Date().toISOString().split('T')[0]} /><input type="hidden" name="sexo" value="M" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsNascimentoFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="nf" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Registar</button></div></div></div>
      )}

      {isNascimentoEditFormOpen && editingNascimento && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-blue-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><Edit className="mr-2 text-blue-600"/> Editar Nascimento</h2><button onClick={() => setIsNascimentoEditFormOpen(false)}><X/></button></div><form id="nef" onSubmit={handleSaveNascimentoEdit} className="p-6 space-y-4"><div><label className="font-bold text-sm">Matriz*</label><input required name="brincoMatriz" defaultValue={editingNascimento.brincoMatriz} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Bezerro(a)*</label><input required name="brincoBezerro" defaultValue={editingNascimento.brincoBezerro} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Peso Nasc.*</label><input required type="number" name="pesoNascimento" defaultValue={editingNascimento.pesoNascimento} className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="data" value={editingNascimento.data} /><input type="hidden" name="sexo" value={editingNascimento.sexo} /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsNascimentoEditFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="nef" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

      {isPropriedadeFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"><div className="p-6 bg-blue-50 flex justify-between"><h2 className="text-xl font-extrabold flex items-center"><MapPin className="mr-2 text-blue-600"/> {editingPropriedade ? 'Editar' : 'Nova'} Propriedade</h2><button onClick={() => setIsPropriedadeFormOpen(false)}><X/></button></div><form id="propf" onSubmit={handleSavePropriedade} className="p-6 space-y-4"><div><label className="font-bold text-sm">Nome*</label><input required name="nome" defaultValue={editingPropriedade?.nome||''} className="w-full p-3 border rounded-xl" /></div><div><label className="font-bold text-sm">Responsável*</label><input required name="responsavel" defaultValue={editingPropriedade?.responsavel||''} className="w-full p-3 border rounded-xl" /></div><input type="hidden" name="cidade" value="N/A" /><input type="hidden" name="estado" value="BR" /><input type="hidden" name="area_ha" value="0" /><input type="hidden" name="ie" value="" /></form><div className="p-6 border-t flex justify-end"><button onClick={() => setIsPropriedadeFormOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold mr-3">Cancelar</button><button type="submit" form="propf" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Salvar</button></div></div></div>
      )}

    </div>
  );
}
