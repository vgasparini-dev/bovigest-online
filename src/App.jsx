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

// --- BASE DE DADOS INICIAL SEGURA ---
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
  const [filtroAnotacao, setFiltroAnotacao] = useState('');
  const [emailModalData, setEmailModalData] = useState(null);

  // Estados Nutrição
  const [nutriAlvoPeso, setNutriAlvoPeso] = useState(400);
  const [nutriAlvoGPD, setNutriAlvoGPD] = useState(1.2);
  const [dietaAtual, setDietaAtual] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState("");

  // Estados IA
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

  // 1. Inicializar Autenticação Invisível (Resolve o erro "Missing Permissions")
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Erro na autenticação:", err);
        setCloudStatus('error');
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  // 2. Conectar à Nuvem após Autenticação
  useEffect(() => {
    if (!firebaseUser) return;
    
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
             setAppData(prev => ({ ...defaultData, ...docSnap.data() }));
          }
          setIsCloudReady(true);
          setCloudStatus('online');
        }, (error) => {
          console.error("Erro no Snapshot Firestore:", error);
          setCloudStatus('error');
        });
      } catch (error) {
        console.error("Erro Firebase:", error);
        const saved = localStorage.getItem('bovigest_data_pro_master');
        if (saved) setAppData({ ...defaultData, ...JSON.parse(saved) });
        setCloudStatus('error');
      }
    };
    initCloud();
  }, [firebaseUser]);

  const updateAppData = (updater) => {
    setAppData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      if (isCloudReady && firebaseUser) {
        const docRef = doc(db, 'bovigest', 'dados_principais');
        setDoc(docRef, newData).catch(console.error);
      }
      localStorage.setItem('bovigest_data_pro_master', JSON.stringify(newData));
      return newData;
    });
  };

  useEffect(() => { localStorage.setItem('bovigest_gemini_api_key', geminiApiKey); }, [geminiApiKey]);
  useEffect(() => { localStorage.setItem('bovigest_ai_endpoint', aiEndpoint); }, [aiEndpoint]);
  useEffect(() => { localStorage.setItem('bovigest_ai_model', aiModel); }, [aiModel]);

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const senha = e.target.senha.value;
    const validUser = (appData?.usuarios || []).find(u => u.email === email && u.senha === senha && (u.status === 'Ativo' || u.status === 'Pendente'));
    
    if (validUser) { 
      if (validUser.status === 'Pendente') {
        alert(`Bem-vindo(a), ${(validUser.nome || 'Utilizador').split(' ')[0]}! A sua conta foi ativada com sucesso.`);
        updateAppData(p => ({ ...p, usuarios: (p.usuarios || []).map(u => u.id === validUser.id ? { ...u, status: 'Ativo' } : u) }));
      }
      setCurrentUser({ ...validUser, status: 'Ativo' }); setIsLoggedIn(true); setLoginError(""); 
    } else { 
      setLoginError("Credenciais inválidas. Verifique o email e a senha."); 
    }
  };

  // --- ACESSO SEGURO AOS DADOS (BLINDAGEM CONTRA TELA BRANCA) ---
  const propriedadeAtiva = useMemo(() => (appData?.propriedades || []).find(p => p.id === activePropriedadeId) || (appData?.propriedades || [])[0] || { nome: 'Fazenda BoviGest', responsavel: 'Gestor' }, [activePropriedadeId, appData?.propriedades]);
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

  const totaisFin = useMemo(() => cFinanceiro.reduce((acc, item) => {
    if (item?.status === 'pago') {
      if (item.tipo === 'receita') acc.rec += Number(item.valor || 0);
      if (item.tipo === 'despesa') acc.desp += Number(item.valor || 0);
    }
    return acc;
  }, { rec: 0, desp: 0 }), [cFinanceiro]);
  
  const saldoAtual = totaisFin.rec - totaisFin.desp;
  
  const pesoMedio = cAnimais.length === 0 ? 0 : Math.round(cAnimais.reduce((acc, a) => acc + (Number(a.peso) || 0), 0) / cAnimais.length);
  
  // Proteção contra divisão por Zero (Infinity)
  const custoPorArroba = useMemo(() => {
    if (cAnimais.length === 0 || totaisFin.desp === 0) return 0;
    const pesoTotal = cAnimais.reduce((acc, a) => acc + (Number(a.peso) || 0), 0);
    if (pesoTotal === 0) return 0;
    return totaisFin.desp / (pesoTotal / 30);
  }, [cAnimais, totaisFin.desp]);

  const distribuicaoCategorias = useMemo(() => {
    const counts = {};
    cAnimais.forEach(a => { 
      const cat = a.categoria || 'Sem Categoria';
      counts[cat] = (counts[cat] || 0) + 1; 
    });
    return counts;
  }, [cAnimais]);

  const filteredAnimais = useMemo(() => cAnimais.filter(a => 
    (a.brinco || '').includes(searchQuery) || 
    (a.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.categoria || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.lote || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, cAnimais]);

  const gadoDeCorte = useMemo(() => cAnimais.filter(a => a.tipo === 'Corte'), [cAnimais]);

  const isEmCarencia = (lote) => {
    const hoje = new Date();
    const vacinaLote = cVacinacoes.find(v => (v.lote === lote || v.lote === "Todo o Rebanho"));
    if (vacinaLote && vacinaLote.dataLiberacao) {
      const liberacao = new Date(vacinaLote.dataLiberacao);
      if (hoje < liberacao) return vacinaLote;
    }
    return false;
  };

  const getGPD = (brinco) => {
    const pesagensAnimal = cPesagens.filter(p => p.brinco === brinco).sort((a,b) => new Date(b.data) - new Date(a.data));
    if (pesagensAnimal.length >= 2) {
      const diffPeso = (pesagensAnimal[0]?.pesoAtual || 0) - (pesagensAnimal[1]?.pesoAtual || 0);
      const diffDias = (new Date(pesagensAnimal[0]?.data) - new Date(pesagensAnimal[1]?.data)) / (1000 * 60 * 60 * 24);
      if (diffDias > 0) return (diffPeso / diffDias).toFixed(2);
    }
    return null;
  };

  // Formatação segura
  const formatCurrency = (val) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };
  
  const showSaveSuccess = () => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); };

  // --- NUTRIÇÃO ---
  const exigenciasTarget = useMemo(() => calcularExigenciasNASEM(nutriAlvoPeso, nutriAlvoGPD), [nutriAlvoPeso, nutriAlvoGPD]);
  const nutricaoFornecida = useMemo(() => {
    let cms = 0, elm = 0, elg = 0, pm = 0, ca = 0, p = 0, custoDiario = 0;
    dietaAtual.forEach(item => {
      const alimento = (appData?.bibliotecaAlimentos || []).find(a => a.id === item.idInsumo);
      if(alimento) {
        const kgMS = item.kgMN * (alimento.ms / 100);
        cms += kgMS; elm += kgMS * alimento.elm; elg += kgMS * alimento.elg;
        pm += kgMS * alimento.pm; ca += kgMS * alimento.ca; p += kgMS * alimento.p;
        custoDiario += item.kgMN * alimento.precoKg;
      }
    });
    return { cms, elm, elg, pm, ca, p, custoDiario };
  }, [dietaAtual, appData?.bibliotecaAlimentos]);

  const handleAddInsumoDieta = () => {
    if (!insumoSelecionado) return;
    if (!dietaAtual.find(d => d.idInsumo === Number(insumoSelecionado))) setDietaAtual([...dietaAtual, { idInsumo: Number(insumoSelecionado), kgMN: 1 }]);
    setInsumoSelecionado("");
  };
  const handleUpdateKgMN = (idInsumo, novoKgMN) => setDietaAtual(dietaAtual.map(d => d.idInsumo === idInsumo ? { ...d, kgMN: Number(novoKgMN) } : d));
  const handleRemoveInsumoDieta = (idInsumo) => setDietaAtual(dietaAtual.filter(d => d.idInsumo !== idInsumo));

  // --- HANDLERS IA ---
  const handleAnalyzeFarm = async () => {
    setIsAnalyzing(true);
    const context = `Rebanho: ${cAnimais.length} cab. Peso Médio: ${pesoMedio}kg. Custo/@: ${formatCurrency(custoPorArroba)}. Saldo: ${formatCurrency(saldoAtual)}. Receitas: ${formatCurrency(totaisFin.rec)}. Despesas: ${formatCurrency(totaisFin.desp)}. Lotes: ${cLotes.length}. Propriedade: ${propriedadeAtiva?.nome || 'Fazenda'}.`;
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
    const context = `Animais: ${cAnimais.length}. Custo/@: ${formatCurrency(custoPorArroba)}. Lotes: ${cLotes.map(l=>l.nome).join(', ')}. Propriedade: ${propriedadeAtiva?.nome || 'Fazenda'}`;
    const historyText = chatMessages.map(m => `${m.role === 'user' ? 'Utilizador' : 'Assistente'}: ${m.text}`).join("\n");
    const result = await callGemini(`Contexto Atual da Fazenda: ${context}\n\nHistórico:\n${historyText}\n\nUtilizador: ${userText}`, "És o BoviGest IA, assistente agropecuário.", geminiApiKey, aiEndpoint, aiModel);
    setChatMessages(prev => [...prev, { role: 'model', text: result }]);
    setIsChatLoading(false);
  };

  // --- HANDLERS DE FORMULÁRIOS ---
  const handleSaveAnimal = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { 
      id: editingAnimal ? editingAnimal.id : Date.now(), propriedadeId: activePropriedadeId, 
      brinco: fd.get('brinco'), nome: fd.get('nome') || "-", sexo: fd.get('sexo'), 
      categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'), 
      dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote: fd.get('lote') || "Sem Lote", 
      obs: fd.get('obs') || "", ativo: true 
    };
    updateAppData(p => ({ ...p, animais: editingAnimal ? (p.animais || []).map(a => a.id === obj.id ? obj : a) : [obj, ...(p.animais || [])] }));
    setIsAnimalFormOpen(false); setEditingAnimal(null); setSelectedAnimal(null); showSaveSuccess();
  };

  const handleSaveBatchAnimais = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const prefixo = fd.get('prefixo') || ''; const inicio = Number(fd.get('inicio')); const quantidade = Number(fd.get('quantidade'));
    const lote = fd.get('lote') || "Sem Lote"; const novosAnimais = [];
    for (let i = 0; i < quantidade; i++) {
      novosAnimais.push({
        id: Date.now() + i, propriedadeId: activePropriedadeId, brinco: `${prefixo}${(inicio + i).toString().padStart(3, '0')}`, nome: "-",
        sexo: fd.get('sexo'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'),
        dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote, obs: "Cadastrado em lote.", ativo: true
      });
    }
    updateAppData(prev => ({ ...prev, animais: [...novosAnimais, ...(prev.animais || [])] }));
    setIsBatchAnimalFormOpen(false); showSaveSuccess();
  };

  const handleSavePesagem = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const brinco = fd.get('brinco'); const pesoAtual = Number(fd.get('pesoAtual'));
    const animal = cAnimais.find(a => a.brinco === brinco);
    if (!animal && !editingPesagem) return alert("Animal não encontrado na propriedade atual!");
    const obj = { id: editingPesagem ? editingPesagem.id : Date.now(), propriedadeId: activePropriedadeId, brinco, data: fd.get('data'), pesoAnterior: editingPesagem ? editingPesagem.pesoAnterior : animal.peso, pesoAtual, obs: fd.get('obs') || "" };
    updateAppData(p => ({ 
      ...p, pesagens: editingPesagem ? (p.pesagens || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.pesagens || [])],
      animais: (p.animais || []).map(a => a.brinco === brinco && a.propriedadeId === activePropriedadeId ? { ...a, peso: pesoAtual } : a)
    }));
    setIsPesagemFormOpen(false); setEditingPesagem(null); showSaveSuccess();
  };

  const handleSaveNascimentoEdit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const updated = {
      ...editingNascimento, data: fd.get('data'), brincoMatriz: fd.get('brincoMatriz'),
      brincoBezerro: fd.get('brincoBezerro'), sexo: fd.get('sexo'),
      pesoNascimento: Number(fd.get('pesoNascimento')), obs: fd.get('obs') || ''
    };
    updateAppData(prev => ({ ...prev, nascimentos: (prev.nascimentos || []).map(n => n.id === updated.id ? updated : n) }));
    setIsNascimentoEditFormOpen(false); setEditingNascimento(null); showSaveSuccess();
  };

  const handleAddNascimento = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const brincoMatriz = fd.get('brincoMatriz'); const brincoBezerro = fd.get('brincoBezerro'); const pesoNascer = Number(fd.get('pesoNascimento'));
    const novoNasc = { id: Date.now(), propriedadeId: activePropriedadeId, data: fd.get('data'), brincoMatriz, brincoBezerro, sexo: fd.get('sexo'), pesoNascimento: pesoNascer, obs: fd.get('obs') || "" };
    const novoAnimal = { id: Date.now() + 1, propriedadeId: activePropriedadeId, brinco: brincoBezerro, nome: "-", sexo: fd.get('sexo'), categoria: "Bezerro(a)", tipo: "Cria", raca: fd.get('raca'), dataNasc: fd.get('data'), peso: pesoNascer, lote: "Maternidade", obs: `Cria da matriz ${brincoMatriz}`, ativo: true };
    updateAppData(prev => ({ 
      ...prev, nascimentos: [novoNasc, ...(prev.nascimentos || [])], animais: [novoAnimal, ...(prev.animais || [])], 
      reproducao: (prev.reproducao || []).map(r => r.brincoVaca === brincoMatriz && r.status === 'Prenhe' && r.propriedadeId === activePropriedadeId ? { ...r, status: 'Parida' } : r) 
    }));
    setIsNascimentoFormOpen(false); showSaveSuccess();
  };

  const handleSaveVaccine = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const cd = Number(fd.get('carenciaDias'));
    let dl = null; if (cd > 0) { const d = new Date(fd.get('dataAplicacao')); d.setDate(d.getDate() + cd); dl = d.toISOString().split('T')[0]; }
    const obj = { id: editingVaccine ? editingVaccine.id : Date.now(), propriedadeId: activePropriedadeId, vacina: fd.get('vacina'), lote: fd.get('lote'), dataAplicacao: fd.get('dataAplicacao'), proximaDose: fd.get('proximaDose') || null, qtdAnimais: Number(fd.get('qtdAnimais')), obs: fd.get('obs') || "", carenciaDias: cd, dataLiberacao: dl, status: "concluida" };
    updateAppData(p => ({ ...p, vacinacoes: editingVaccine ? (p.vacinacoes || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.vacinacoes || [])] }));
    setIsVaccineFormOpen(false); setEditingVaccine(null); showSaveSuccess();
  };

  const handleSaveFinance = (e) => { 
    e.preventDefault(); const fd = new FormData(e.target); 
    const obj = { id: editingFinance ? editingFinance.id : Date.now(), propriedadeId: activePropriedadeId, descricao: fd.get('descricao'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), valor: Number(fd.get('valor')), data: fd.get('data'), status: fd.get('status') || 'pago' };
    updateAppData(p => ({ ...p, financeiro: editingFinance ? (p.financeiro || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.financeiro || [])] }));
    setIsFinanceFormOpen(false); setEditingFinance(null); showSaveSuccess(); 
  };
  
  const handleSaveLote = (e) => { 
    e.preventDefault(); const fd = new FormData(e.target); 
    const obj = { id: editingLote ? editingLote.id : Date.now(), propriedadeId: activePropriedadeId, nome: fd.get('nome'), capacidade: Number(fd.get('capacidade')), tipo: fd.get('tipo'), obs: fd.get('obs') || "" };
    updateAppData(p => ({ ...p, lotes: editingLote ? (p.lotes || []).map(x => x.id === obj.id ? obj : x) : [obj, ...(p.lotes || [])] }));
    setIsLoteFormOpen(false); setEditingLote(null); showSaveSuccess(); 
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

  const handleSavePropriedade = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { id: editingPropriedade ? editingPropriedade.id : Date.now(), nome: fd.get('nome'), responsavel: fd.get('responsavel'), cidade: fd.get('cidade'), estado: fd.get('estado'), area_ha: Number(fd.get('area_ha')), ie: fd.get('ie') };
    updateAppData(p => ({ ...p, propriedades: editingPropriedade ? (p.propriedades || []).map(x => x.id === obj.id ? obj : x) : [...(p.propriedades || []), obj] }));
    setIsPropriedadeFormOpen(false); setEditingPropriedade(null); showSaveSuccess();
  };

  const handleSaveCalendario = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { id: editingCalendario ? editingCalendario.id : Date.now(), propriedadeId: activePropriedadeId, doenca: fd.get('doenca'), mes: fd.get('mes'), publico: fd.get('publico'), obrigatorio: fd.get('obrigatorio') === 'true' };
    updateAppData(p => ({ ...p, calendarioSanitario: editingCalendario ? (p.calendarioSanitario || []).map(x => x.id === obj.id ? obj : x) : [...(p.calendarioSanitario || []), obj] }));
    setIsCalendarioFormOpen(false); setEditingCalendario(null); showSaveSuccess();
  };

  const handleSaveUsuario = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const obj = { id: editingUsuario ? editingUsuario.id : Date.now(), nome: fd.get('nome'), email: fd.get('email'), senha: fd.get('senha'), role: fd.get('role'), status: editingUsuario ? editingUsuario.status : 'Pendente' };
    updateAppData(p => ({ ...p, usuarios: editingUsuario ? (p.usuarios || []).map(u => u.id === obj.id ? obj : u) : [...(p.usuarios || []), obj] }));
    if (!editingUsuario) setEmailModalData({ nome: obj.nome, email: obj.email, senha: obj.senha, role: obj.role });
    setIsUsuarioFormOpen(false); setEditingUsuario(null); showSaveSuccess();
  };

  const handleSaveAnotacao = (e) => { 
    e.preventDefault(); const fd = new FormData(e.target); 
    const nova = { id: Date.now(), propriedadeId: activePropriedadeId, titulo: fd.get('titulo'), texto: fd.get('texto'), tag: fd.get('tag') || '', data: new Date().toLocaleDateString('pt-BR'), status: 'aberto' }; 
    updateAppData(p => ({ ...p, anotacoes: [nova, ...(p.anotacoes || [])] })); 
    setIsAnotacaoFormOpen(false); showSaveSuccess(); 
  }; 
  
  const handleToggleAnotacao = (id) => { updateAppData(p => ({ ...p, anotacoes: (p.anotacoes || []).map(a => a.id === id ? { ...a, status: a.status === 'resolvido' ? 'aberto' : 'resolvido' } : a) })); };
  
  const handleSaveObsAnimal = (animalId, novaObs) => { 
    updateAppData(p => ({ ...p, animais: (p.animais || []).map(a => a.id === animalId ? { ...a, obs: novaObs } : a) })); 
    setSelectedAnimal(prev => ({ ...prev, obs: novaObs })); 
    showSaveSuccess(); 
  };
  
  const handleSendEmail = () => {
    const subject = encodeURIComponent("Convite de Acesso - BoviGest PRO");
    const body = encodeURIComponent(`Olá ${emailModalData.nome},\nFoi convidado(a) a aceder ao sistema BoviGest PRO.\n\n🔑 DADOS DE ACESSO:\nEmail: ${emailModalData.email}\nSenha Provisória: ${emailModalData.senha}\nNível de Acesso: ${emailModalData.role}\n\n🌐 ACEDER AO SISTEMA:\nhttps://bovigest-online.vercel.app/\n\nAtenciosamente,\nEquipa BoviGest`);
    window.location.href = `mailto:${emailModalData.email}?subject=${subject}&body=${body}`;
    setEmailModalData(null);
  };

  // --- EXPORTAÇÕES ---
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [headers.join(','), ...rows.map(e => e.map(item => `"${item}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click();
  };

  const exportRebanho = () => {
    const headers = ['Nº Brinco', 'Nome/Apelido', 'Espécie/Raça', 'Data Nasc.', 'Idade (meses)', 'Categoria', 'Sexo', 'Peso Atual (kg)', 'Peso Anterior (kg)', 'GMD (kg/dia)', 'Status', 'Pasto/Lote', 'Observações'];
    const rows = cAnimais.map(a => {
      const ageMonths = Math.floor((new Date() - new Date(a.dataNasc)) / (1000 * 60 * 60 * 24 * 30));
      const pAnimal = cPesagens.filter(p => p.brinco === a.brinco).sort((x, y) => new Date(y.data) - new Date(x.data));
      const pesoAnt = pAnimal.length > 0 ? pAnimal[0].pesoAnterior : '';
      return [a.brinco, a.nome, a.raca, a.dataNasc, ageMonths, a.categoria, a.sexo, a.peso, pesoAnt, getGPD(a.brinco) || '', a.ativo ? 'Ativo' : 'Inativo', a.lote, a.obs || ''];
    });
    downloadCSV(`Rebanho_${propriedadeAtiva.nome?.replace(/\s+/g, '_') || 'Fazenda'}.csv`, headers, rows);
  };
  const exportFinanceiro = () => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor (R$)', 'Status', 'Observações'];
    const rows = cFinanceiro.map(f => [f.data, f.descricao, f.tipo, f.categoria, f.valor, f.status, f.obs || '']);
    downloadCSV(`Financeiro_${propriedadeAtiva.nome?.replace(/\s+/g, '_') || 'Fazenda'}.csv`, headers, rows);
  };
  const exportReproducao = () => {
    const headers = ['Nº Brinco', 'Data IA/Monta', 'Tipo', 'Touro/Sêmen', 'Data Prev. Parto', 'Status Final'];
    const rows = cReproducao.map(r => [r.brincoVaca, r.dataInseminacao, r.metodo, r.reprodutor, r.previsaoParto, r.status]);
    downloadCSV(`Reproducao_${propriedadeAtiva.nome?.replace(/\s+/g, '_') || 'Fazenda'}.csv`, headers, rows);
  };

  // --- HANDLERS DE EXCLUSÃO ---
  const del = (coll, id, confirmMsg, closeFn) => { if(confirm(confirmMsg)){ updateAppData(p => ({ ...p, [coll]: (p[coll] || []).filter(x => x.id !== id) })); if(closeFn) closeFn(null); showSaveSuccess(); } };

  // --- NAVEGAÇÃO & UI ---
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' },
    { id: 'ai-assistant', icon: Sparkles, label: 'Consultor IA' },
    { id: 'nutricao', icon: Wheat, label: 'Nutrição & Dietas' },
    { id: 'propriedades', icon: MapPin, label: 'Propriedades' },
    { id: 'animais', icon: Beef, label: 'Rebanho Geral', badge: cAnimais.length },
    { id: 'gado_corte', icon: Target, label: 'Gado de Corte', badge: gadoDeCorte.length },
    { id: 'pastagens', icon: LayoutGrid, label: 'Pastagens / Lotes', badge: cLotes.length },
    { id: 'reproducao', icon: HeartPulse, label: 'Inseminações' },
    { id: 'nascimentos', icon: Baby, label: 'Nascimentos', badge: cNascimentos.length },
    { id: 'sanidade', icon: ShieldAlert, label: 'Sanidade Clínica' },
    { id: 'pesagens', icon: Scale, label: 'Pesagens' },
    { id: 'insumos', icon: Archive, label: 'Estoque Insumos' },
    { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
    { id: 'anotacoes', icon: NotebookPen, label: 'Anotações Gerais' },
    { id: 'configuracoes', icon: Settings, label: 'Configurações' },
  ];

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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 border-r border-slate-900 hidden md:flex flex-col shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50 shrink-0">
          <Tractor className="text-green-500 mr-4" size={32} />
          <span className="text-2xl font-black text-white">BoviGest</span>
        </div>
        <div className="px-6 py-4 bg-slate-900/50 shrink-0">
          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Propriedade Ativa</label>
          <select value={activePropriedadeId} onChange={(e) => setActivePropriedadeId(Number(e.target.value))} className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500">
            {(appData?.propriedades || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => { 
            const Icon = item.icon; 
            return (
              <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                <Icon className="mr-3 h-5 w-5 shrink-0" />
                <span className="font-bold text-sm truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && <span className="ml-auto py-0.5 px-2.5 rounded-full text-xs font-bold bg-white/20 text-white">{item.badge}</span>}
              </button>
            ); 
          })}
        </nav>
        <div className="p-6 shrink-0 border-t border-slate-800/50">
          <button onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }} className="w-full py-3 text-slate-400 border border-slate-700/50 hover:text-red-400 rounded-xl font-bold flex justify-center items-center transition-colors">
            <LogOut className="mr-2 h-4 w-4" /> Sair ({currentUser ? currentUser.nome.split(' ')[0] : 'Utilizador'})
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen">
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 shrink-0 z-10 shadow-sm">
          <h2 className="text-3xl font-extrabold capitalize flex items-center text-gray-900">
            {(() => { const C = navItems.find(n => n.id === currentView)?.icon || LayoutDashboard; return <C className="mr-4 text-green-600" size={32} /> })()}
            {navItems.find(n => n.id === currentView)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            {cloudStatus === 'online' && <span className="text-xs font-bold text-blue-600 flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"><Cloud size={14} className="mr-1.5" /> Nuvem Ativa</span>}
            {cloudStatus === 'error' && <span className="text-xs font-bold text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-full border border-red-100"><CloudOff size={14} className="mr-1.5" /> Erro Nuvem</span>}
            {saveSuccess && <span className="text-sm font-bold text-green-700 flex items-center bg-green-50 px-4 py-2 rounded-full"><CheckCircle2 size={18} className="mr-2" /> Gravado</span>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col"><div className="bg-blue-50 p-4 rounded-2xl text-blue-600 w-16 mb-4"><Beef size={28} /></div><h3 className="text-5xl font-black">{cAnimais.length}</h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Total Cabeças</p></div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col"><div className="bg-green-50 p-4 rounded-2xl text-green-600 w-16 mb-4"><DollarSign size={28} /></div><h3 className="text-3xl font-black mt-2">{formatCurrency(saldoAtual)}</h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Saldo Global</p></div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col"><div className="bg-orange-50 p-4 rounded-2xl text-orange-600 w-16 mb-4"><Scale size={28} /></div><h3 className="text-5xl font-black">{pesoMedio} <span className="text-xl">kg</span></h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Média de Peso</p></div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col"><div className="bg-pink-50 p-4 rounded-2xl text-pink-600 w-16 mb-4"><HeartPulse size={28} /></div><h3 className="text-5xl font-black">{cReproducao.filter(r=>r.status==='Prenhe').length}</h3><p className="text-sm font-bold text-gray-400 uppercase mt-2">Prenhes</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Distribuição por Categoria</h3>
                  <div className="space-y-4">
                    {Object.keys(distribuicaoCategorias).length === 0 ? (
                      <p className="text-gray-400 italic">Sem animais registados para calcular distribuição.</p>
                    ) : (
                      Object.entries(distribuicaoCategorias).map(([cat, qtd]) => {
                        const pct = Math.round((qtd / cAnimais.length) * 100) || 0;
                        return (
                          <div key={cat}><div className="flex justify-between mb-1"><span className="font-bold text-gray-700">{cat}</span><span className="font-black text-gray-900">{pct}% ({qtd})</span></div><div className="w-full bg-gray-100 rounded-full h-3"><div className="bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }}></div></div></div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative flex flex-col justify-center">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center mb-2">Relatório Inteligente <Sparkles className="ml-3 text-green-500" size={24} /></h3>
                    <p className="text-gray-500 font-medium mb-6">A Inteligência Artificial analisa os seus dados e gera estratégias.</p>
                    <button onClick={handleAnalyzeFarm} disabled={isAnalyzing} className="w-full bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center disabled:opacity-70">
                      {isAnalyzing ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Bot className="w-6 h-6 mr-3" />}
                      {isAnalyzing ? 'A Processar...' : 'Gerar Análise IA'}
                    </button>
                    {aiInsights && <div className="mt-6 p-6 bg-green-50 border border-green-100 rounded-2xl animate-in fade-in"><div className="prose max-w-none text-green-900 text-sm font-medium whitespace-pre-wrap leading-relaxed">{aiInsights}</div></div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'animais' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-[400px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-13 pr-5 py-4 border border-gray-200 rounded-2xl bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm outline-none font-medium" placeholder="Procurar brinco, lote, categoria..." />
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
                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Localização / Dados</th>
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

          {currentView === 'gado_corte' && (
            <div className="animate-in fade-in space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 flex items-center"><Target className="mr-3 text-red-500" /> Plantel de Terminação / Engorda</h3>
                  <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-lg">{gadoDeCorte.length} cabeças</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr><th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase">Brinco / Raça</th><th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase">Lote</th><th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase">Peso</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {gadoDeCorte.map((animal) => (
                        <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4"><span className="font-black text-gray-900 block">{animal.brinco}</span><span className="text-sm text-gray-500">{animal.raca}</span></td>
                          <td className="px-8 py-4"><span className="font-bold text-gray-700">{animal.lote}</span></td>
                          <td className="px-8 py-4 text-right font-black text-gray-900">{animal.peso} kg</td>
                        </tr>
                      ))}
                      {gadoDeCorte.length === 0 && <tr><td colSpan={3} className="text-center py-10 font-bold text-gray-400">Nenhum gado de corte registado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

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
                        {(appData.bibliotecaAlimentos || []).filter(a => !dietaAtual.find(d => d.idInsumo === a.id)).map(a => (<option key={a.id} value={a.id}>{a.nome} (MS: {a.ms}%)</option>))}
                      </select>
                      <button onClick={handleAddInsumoDieta} className="bg-orange-600 text-white px-5 rounded-xl font-bold hover:bg-orange-700 shadow-sm"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-3">
                      {dietaAtual.map(item => {
                        const ali = (appData.bibliotecaAlimentos || []).find(a => a.id === item.idInsumo);
                        return (
                          <div key={item.idInsumo} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <div className="flex-1"><p className="font-bold text-gray-900 text-sm">{ali?.nome}</p><p className="text-xs font-medium text-gray-500">{ali?.ms}% MS • R$ {ali?.precoKg}/kg</p></div>
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
                              <div className="text-right"><span className={`text-xl font-black ${isIdeal ? 'text-green-600' : `text-${bar.col}-500`}`}>{bar.val.toFixed(bar.val > 100 ? 0 : 2)}</span><span className="text-sm font-bold text-gray-400"> / {bar.target.toFixed(bar.target > 100 ? 0 : 2)} {bar.unit}</span></div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200 relative">
                              <div className={`h-full transition-all duration-500 ${isIdeal ? 'bg-green-500' : `bg-${bar.col}-500`}`} style={{ width: `${pct}%` }}></div>
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

          {currentView === 'pastagens' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><LayoutGrid className="mr-3 text-green-600" /> Mapa de Lotes</h3>
                <button onClick={() => { setEditingLote(null); setIsLoteFormOpen(true); }} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-green-700 transition-colors"><Plus className="mr-2" /> Novo Lote</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cLotes.map(lote => {
                  const animaisNoLote = cAnimais.filter(a => a.lote === lote.nome).length;
                  const ocupacao = Math.round((animaisNoLote / lote.capacidade) * 100) || 0;
                  return (
                    <div key={lote.id} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-black text-gray-900">{lote.nome}</h4>
                        <div className="flex space-x-1">
                          <button onClick={() => { setEditingLote(lote); setIsLoteFormOpen(true); }} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded-lg"><Edit size={18} /></button>
                          <button onClick={() => del('lotes', lote.id, 'Excluir Lote?')} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px]">{lote.obs || "Sem observações."}</p>
                      <div className="mb-2 flex justify-between items-end">
                        <span className="text-3xl font-black text-gray-900">{animaisNoLote}</span>
                        <span className="text-sm font-bold text-gray-400">/ {lote.capacidade} cap.</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full transition-all ${ocupacao > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(ocupacao, 100)}%`}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentView === 'reproducao' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><HeartPulse className="mr-3 text-pink-600" /> Controlo Reprodutivo</h3>
                <button onClick={() => { setEditingReproducao(null); setIsReproducaoFormOpen(true); }} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-pink-700 transition-colors"><Plus className="mr-2" /> Inseminação</button>
              </div>
              <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                <table className="min-w-full divide-y">
                  <thead className="bg-pink-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Matriz</th><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Data / Método</th><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Prev. Parto</th><th className="px-6 py-4 text-right text-xs font-black text-pink-800 uppercase">Status</th><th className="px-6 py-4 text-right text-xs font-black text-pink-800 uppercase">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {cReproducao.map((rep) => (
                      <tr key={rep.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-black text-gray-900">{rep.brincoVaca}</td>
                        <td className="px-6 py-4"><span className="block font-bold text-gray-700">{rep.dataInseminacao}</span><span className="text-xs text-gray-500">{rep.metodo} - {rep.reprodutor}</span></td>
                        <td className="px-6 py-4 font-bold text-gray-700">{rep.previsaoParto}</td>
                        <td className="px-6 py-4 text-right"><span className={`px-3 py-1 rounded-full text-xs font-bold ${rep.status === 'Prenhe' ? 'bg-green-100 text-green-700' : rep.status === 'Parida' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{rep.status}</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setEditingReproducao(rep); setIsReproducaoFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                          <button onClick={() => del('reproducao', rep.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'pesagens' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><Scale className="mr-3 text-orange-500" /> Histórico de Pesagens</h3>
                <button onClick={() => { setEditingPesagem(null); setIsPesagemFormOpen(true); }} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-orange-700 transition-colors"><Plus className="mr-2" /> Nova Pesagem</button>
              </div>
              <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                <table className="min-w-full divide-y">
                  <thead className="bg-orange-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-orange-800 uppercase">Data / Brinco</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Peso Ant.</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Peso Atual</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Evolução</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {cPesagens.map((pes) => {
                      const diff = (pes.pesoAtual || 0) - (pes.pesoAnterior || 0);
                      return (
                        <tr key={pes.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><span className="block font-bold text-gray-500 text-sm">{pes.data}</span><span className="font-black text-gray-900">BRINCO {pes.brinco}</span></td>
                          <td className="px-6 py-4 text-right font-bold text-gray-600">{pes.pesoAnterior} kg</td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">{pes.pesoAtual} kg</td>
                          <td className="px-6 py-4 text-right font-black"><span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>{diff > 0 ? '+' : ''}{diff} kg</span></td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setEditingPesagem(pes); setIsPesagemFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                            <button onClick={() => del('pesagens', pes.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'nascimentos' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><Baby className="mr-3 text-blue-500" /> Nascimentos</h3>
                <button onClick={() => { setEditingNascimento(null); setIsNascimentoFormOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-blue-700 transition-colors"><Plus className="mr-2" /> Novo Nascimento</button>
              </div>
              <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                <table className="min-w-full divide-y">
                  <thead className="bg-blue-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Data</th><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Matriz &rarr; Bezerro</th><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Sexo</th><th className="px-6 py-4 text-right text-xs font-black text-blue-800 uppercase">Peso Nasc.</th><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Observações</th><th className="px-6 py-4 text-right text-xs font-black text-blue-800 uppercase">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {cNascimentos.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-700">{n.data}</td>
                        <td className="px-6 py-4"><span className="block font-black text-gray-900">M: {n.brincoMatriz}</span><span className="text-sm font-bold text-blue-600">B: {n.brincoBezerro}</span></td>
                        <td className="px-6 py-4 font-bold text-gray-700">{n.sexo}</td>
                        <td className="px-6 py-4 text-right font-black text-gray-900">{n.pesoNascimento} kg</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{n.obs}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setEditingNascimento(n); setIsNascimentoEditFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                          <button onClick={() => del('nascimentos', n.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'financeiro' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><DollarSign className="mr-3 text-green-600" /> Gestão Financeira</h3>
                <button onClick={() => { setEditingFinance(null); setIsFinanceFormOpen(true); }} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-green-700 transition-colors"><Plus className="mr-2" /> Lançamento</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-sm font-bold text-gray-400 uppercase">Receitas</p>
                  <p className="text-3xl font-black text-green-600">{formatCurrency(totaisFin.rec)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-sm font-bold text-gray-400 uppercase">Despesas</p>
                  <p className="text-3xl font-black text-red-600">{formatCurrency(totaisFin.desp)}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
                  <p className="text-sm font-bold text-slate-400 uppercase">Saldo Líquido</p>
                  <p className={`text-3xl font-black ${saldoAtual >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(saldoAtual)}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center">
                  <p className="text-sm font-bold text-blue-800 uppercase flex items-center"><Activity size={16} className="mr-2" /> Custo por Arroba (@)</p>
                  <p className="text-3xl font-black text-blue-900 mt-1">{formatCurrency(custoPorArroba)}</p>
                  <p className="text-xs text-blue-600 mt-1">Base: 30kg peso vivo/cab</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Data / Descrição</th><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Categoria</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Valor</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {cFinanceiro.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><span className="block font-bold text-gray-500 text-sm">{f.data}</span><span className="font-black text-gray-900">{f.descricao}</span></td>
                        <td className="px-6 py-4 font-bold text-gray-700">{f.categoria}</td>
                        <td className={`px-6 py-4 text-right font-black ${f.tipo==='receita'?'text-green-600':'text-red-600'}`}>{f.tipo==='receita'?'+':'-'}{formatCurrency(f.valor)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setEditingFinance(f); setIsFinanceFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                          <button onClick={() => del('financeiro', f.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'sanidade' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><ShieldAlert className="mr-3 text-red-500" /> Sanidade e Vacinação</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex space-x-1">
                  <button onClick={() => setSanidadeTab('registos')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${sanidadeTab === 'registos' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>Histórico</button>
                  <button onClick={() => setSanidadeTab('calendario')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${sanidadeTab === 'calendario' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>Calendário RO</button>
                </div>
              </div>

              {sanidadeTab === 'registos' ? (
                <>
                  <div className="flex justify-end mb-4">
                    <button onClick={() => { setEditingVaccine(null); setIsVaccineFormOpen(true); }} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-red-700"><Plus className="mr-2" /> Tratamento de Lote</button>
                  </div>
                  <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y">
                      <thead className="bg-red-50">
                        <tr><th className="px-6 py-4 text-left text-xs font-black text-red-800 uppercase">Data / Vacina</th><th className="px-6 py-4 text-left text-xs font-black text-red-800 uppercase">Lote Alvo</th><th className="px-6 py-4 text-left text-xs font-black text-red-800 uppercase">Carência</th><th className="px-6 py-4 text-right text-xs font-black text-red-800 uppercase">Liberação</th><th className="px-6 py-4 text-right text-xs font-black text-red-800 uppercase">Ações</th></tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {cVacinacoes.map((vac) => (
                          <tr key={vac.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4"><span className="block font-black text-gray-900">{vac.vacina}</span><span className="text-sm font-bold text-gray-500">{vac.dataAplicacao}</span></td>
                            <td className="px-6 py-4 font-bold text-gray-700">{vac.lote} ({vac.qtdAnimais} cab.)</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{vac.carenciaDias} dias</td>
                            <td className="px-6 py-4 text-right"><span className="px-3 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-800">{vac.dataLiberacao || '-'}</span></td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => { setEditingVaccine(vac); setIsVaccineFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                              <button onClick={() => del('vacinacoes', vac.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-center text-yellow-800"><CalendarDays className="mr-3" /><div><h4 className="font-bold">Calendário Sanitário - IDARON</h4><p className="text-sm">Rondônia é área livre de febre aftosa sem vacinação.</p></div></div>
                    <button onClick={() => { setEditingCalendario(null); setIsCalendarioFormOpen(true); }} className="bg-yellow-600 text-white px-4 py-2 rounded-xl font-bold flex items-center text-sm hover:bg-yellow-700"><Plus className="w-4 h-4 mr-1" /> Adicionar Evento</button>
                  </div>
                  <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y">
                      <thead className="bg-gray-50">
                        <tr><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Doença / Vacina</th><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Mês(es)</th><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Público Alvo</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Status</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Ações</th></tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {cCalendario.map((cal) => (
                          <tr key={cal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-black text-gray-900">{cal.doenca}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{cal.mes}</td>
                            <td className="px-6 py-4 font-medium text-gray-600">{cal.publico}</td>
                            <td className="px-6 py-4 text-right">{cal.obrigatorio ? <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">Obrigatório</span> : <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">Recomendado</span>}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => { setEditingCalendario(cal); setIsCalendarioFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                              <button onClick={() => del('calendarioSanitario', cal.id, 'Excluir?')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {currentView === 'insumos' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><Archive className="mr-3 text-purple-600" /> Estoque de Insumos</h3>
                <button onClick={() => { setEditingInsumo(null); setIsInsumoFormOpen(true); }} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-purple-700 transition-colors"><Plus className="mr-2" /> Novo Insumo</button>
              </div>
              <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-purple-800 uppercase">Produto / Categoria</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Qtd Atual</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Estoque Min.</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Status</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {cInsumos.map((ins) => {
                      const isCritico = ins.quantidade <= (ins.estoqueMinimo || 0);
                      return (
                        <tr key={ins.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><span className="block font-black text-gray-900">{ins.nome}</span><span className="text-sm font-bold text-gray-500">{ins.categoria}</span></td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">{ins.quantidade} {ins.unidade}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-500">{ins.estoqueMinimo} {ins.unidade}</td>
                          <td className="px-6 py-4 text-right">{isCritico ? <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">Crítico</span> : <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">Normal</span>}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setConsumoInsumoSelecionado(ins); setIsConsumoFormOpen(true); }} className="text-orange-500 hover:text-orange-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-50 mr-2 inline-flex items-center"><MinusCircle size={14} className="mr-1"/> Consumo</button>
                            <button onClick={() => { setEditingInsumo(ins); setIsInsumoFormOpen(true); }} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                            <button onClick={() => del('insumos', ins.id, 'Excluir Insumo?')} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'anotacoes' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 flex items-center"><NotebookPen className="mr-3 text-amber-600" /> Anotações Gerais</h3>
                  <p className="text-gray-500 text-sm mt-1">Registros livres vinculados à propriedade <b>{propriedadeAtiva.nome || 'Fazenda'}</b></p>
                </div>
                <button onClick={() => setIsAnotacaoFormOpen(true)} className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-amber-700 transition-colors"><Plus className="mr-2" /> Nova Anotação</button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" value={filtroAnotacao} onChange={(e) => setFiltroAnotacao(e.target.value)} placeholder="Buscar por título, texto ou tag..." className="w-full pl-12 pr-5 py-4 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-400 shadow-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {cAnotacoes.filter(a => (a.titulo || '').toLowerCase().includes(filtroAnotacao.toLowerCase()) || (a.texto || '').toLowerCase().includes(filtroAnotacao.toLowerCase()) || (a.tag || '').toLowerCase().includes(filtroAnotacao.toLowerCase())).map(nota => (
                  <div key={nota.id} className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-3 transition-all ${nota.status === 'resolvido' ? 'opacity-60 border-gray-100' : 'border-amber-100'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`text-base font-black ${nota.status === 'resolvido' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{nota.titulo}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 font-medium">{nota.data}</span>
                          {nota.tag && <span className="bg-amber-100 text-amber-700 font-bold text-xs px-2 py-0.5 rounded-full">{nota.tag}</span>}
                        </div>
                      </div>
                      <button onClick={() => del('anotacoes', nota.id, 'Remover anotação?')} className="text-red-300 hover:text-red-500 ml-2 shrink-0"><Trash2 size={16}/></button>
                    </div>
                    <p className="text-sm text-gray-600 flex-1 whitespace-pre-wrap">{nota.texto}</p>
                    <button onClick={() => handleToggleAnotacao(nota.id)} className={`w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${nota.status === 'resolvido' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}>
                      <CheckCircle2 size={16} /> {nota.status === 'resolvido' ? 'Reabrir' : 'Marcar como Resolvido'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'propriedades' && (
             <div className="animate-in fade-in space-y-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-black flex items-center text-gray-900"><MapPin className="mr-3 text-blue-500" /> Gestão de Propriedades</h3>
               <button onClick={() => { setEditingPropriedade(null); setIsPropriedadeFormOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-blue-700 transition-colors"><Plus className="mr-2" /> Nova Propriedade</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {(appData.propriedades || []).map((p) => (
                <div key={p.id} className={`bg-white p-6 rounded-3xl border shadow-sm ${activePropriedadeId === p.id ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-2xl text-gray-900">{p.nome}</h4>
                    <div className="flex items-center space-x-2">
                      {activePropriedadeId === p.id && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Ativa</span>}
                      <button onClick={() => { setEditingPropriedade(p); setIsPropriedadeFormOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                      <button onClick={() => del('propriedades', p.id, 'Excluir Propriedade?', () => { if(activePropriedadeId === p.id) setActivePropriedadeId((appData.propriedades || []).find(x=>x.id!==p.id)?.id || 1); })} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm font-medium text-gray-600">
                    <p><strong className="text-gray-900">Responsável:</strong> {p.responsavel}</p>
                    <p><strong className="text-gray-900">Localização:</strong> {p.cidade} - {p.estado}</p>
                    <p><strong className="text-gray-900">Área:</strong> {p.area_ha} ha</p>
                    <p><strong className="text-gray-900">Inscrição Est.:</strong> {p.ie}</p>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setActivePropriedadeId(p.id)} disabled={activePropriedadeId === p.id} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activePropriedadeId === p.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black'}`}>
                      {activePropriedadeId === p.id ? 'Selecionada' : 'Tornar Ativa'}
                    </button>
                  </div>
                </div>
               ))}
             </div>
           </div>
          )}

          {currentView === 'configuracoes' && (
            <div className="animate-in fade-in space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center"><Users className="mr-3 text-indigo-600" /> Acessos e Operadores</h3>
                  <button onClick={() => { setEditingUsuario(null); setIsUsuarioFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Novo Utilizador</button>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Nome / Email</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Status / Permissão</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(appData.usuarios || []).map((usr) => (
                        <tr key={usr.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><span className="block font-black text-gray-900">{usr.nome}</span><span className="text-sm font-bold text-gray-500">{usr.email}</span></td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold mr-2 ${usr.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>{usr.role}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${usr.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{usr.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setEditingUsuario(usr); setIsUsuarioFormOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><Edit size={18} /></button>
                            <button onClick={() => del('usuarios', usr.id, 'Remover utilizador?')} className="text-red-500 hover:bg-red-50 p-2 ml-2 rounded-lg"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl shadow-sm border border-gray-700 p-8 mb-8 text-white relative overflow-hidden">
                <Bot size={140} className="absolute -right-10 -bottom-10 text-white/5" />
                <h3 className="text-2xl font-black flex items-center mb-2"><Sparkles className="mr-3 text-green-400" /> Inteligência Artificial</h3>
                <p className="text-slate-300 font-medium mb-6 max-w-2xl">Para usar os relatórios de IA e o Assistente, insira a sua chave API do Google AI Studio e escolha o modelo.</p>
                <div className="space-y-4 max-w-lg relative z-10">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">API Key (Chave de Acesso)</label>
                    <input type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} placeholder="Cole a sua API Key aqui..." className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Endereço da API (URL Base)</label>
                    <input type="text" value={aiEndpoint} onChange={(e) => setAiEndpoint(e.target.value)} className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Modelo de IA</label>
                    <input type="text" value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-white font-mono" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center">
                <FileSpreadsheet size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">Exportação de Planilhas</h3>
                <p className="text-gray-500 font-medium mb-8">Descarregue os dados da propriedade <b className="text-gray-900">{propriedadeAtiva.nome || 'Fazenda'}</b> em formato CSV.</p>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button onClick={exportRebanho} className="bg-green-50 hover:bg-green-100 text-green-800 font-bold px-6 py-3 rounded-xl shadow-sm border border-green-200 transition-colors flex items-center"><Download size={18} className="mr-2"/> Rebanho</button>
                  <button onClick={exportFinanceiro} className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-6 py-3 rounded-xl shadow-sm border border-blue-200 transition-colors flex items-center"><Download size={18} className="mr-2"/> Financeiro</button>
                  <button onClick={exportReproducao} className="bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold px-6 py-3 rounded-xl shadow-sm border border-pink-200 transition-colors flex items-center"><Download size={18} className="mr-2"/> Reprodução</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- MODAIS DE FORMULÁRIO COMPLETOS E RICOS --- */}
      {isAnimalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center"><Beef className="mr-2 text-green-600"/> {editingAnimal ? 'Editar Animal' : 'Registar Animal Único'}</h2>
              <button onClick={() => {setIsAnimalFormOpen(false); setEditingAnimal(null);}} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto">
              <form id="af" onSubmit={handleSaveAnimal} className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Brinco *</label><input required name="brinco" defaultValue={editingAnimal?.brinco||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Nome</label><input name="nome" defaultValue={editingAnimal?.nome !== '-' ? editingAnimal?.nome : ''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium" placeholder="Opcional" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Peso (kg) *</label><input required type="number" name="peso" defaultValue={editingAnimal?.peso||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-900" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lote Destino</label>
                    <select name="lote" defaultValue={editingAnimal?.lote||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium">
                      <option value="">Sem Lote</option>{cLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sexo</label>
                    <select name="sexo" defaultValue={editingAnimal?.sexo||'F'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"><option value="F">Fêmea</option><option value="M">Macho</option></select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                    <select name="categoria" defaultValue={editingAnimal?.categoria||'Bezerro'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"><option value="Bezerro">Bezerro(a)</option><option value="Novilha">Novilha</option><option value="Garrote">Garrote</option><option value="Vaca">Vaca</option><option value="Boi Gordo">Boi Gordo</option><option value="Touro">Touro</option></select>
                  </div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Raça</label><input required name="raca" defaultValue={editingAnimal?.raca||'Nelore'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Data de Nascimento</label><input type="date" required name="dataNasc" defaultValue={editingAnimal?.dataNasc || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-gray-700" /></div>
                  <input type="hidden" name="tipo" value={editingAnimal?.tipo || "Corte"} />
                </div>
              </form>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => {setIsAnimalFormOpen(false); setEditingAnimal(null);}} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="af" className="px-8 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-md transition-colors flex items-center"><Save size={18} className="mr-2" /> Guardar Dados</button>
            </div>
          </div>
        </div>
      )}

      {isBatchAnimalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="border-b border-indigo-100 p-6 flex justify-between items-center bg-indigo-50 shrink-0">
              <h2 className="text-xl font-black text-indigo-900 flex items-center"><ListPlus className="mr-3 text-indigo-600"/> Cadastrar Animais em Lote</h2>
              <button onClick={() => setIsBatchAnimalFormOpen(false)} className="text-indigo-400 hover:text-indigo-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto">
              <form id="baf" onSubmit={handleSaveBatchAnimais} className="p-8">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Prefixo Brinco</label><input name="prefixo" placeholder="Ex: NEL-" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Início Numeração *</label><input required type="number" name="inicio" defaultValue="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div>
                  <div><label className="block text-sm font-bold text-indigo-700 mb-2">Quantidade *</label><input required type="number" name="quantidade" defaultValue="10" className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-900" /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Raça Base</label><input required name="raca" defaultValue="Nelore" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Peso Base Misto (kg)</label><input required type="number" name="peso" defaultValue="200" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lote Destino</label>
                    <select name="lote" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                      <option value="">Sem Lote Inicial</option>{cLotes.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoria Geral</label>
                    <select name="categoria" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                      <option value="Bezerro">Bezerros / Bezerras</option>
                      <option value="Novilha">Novilhas</option>
                      <option value="Garrote">Garrotes</option>
                      <option value="Garrote">Vaca</option>
                      <option value="Boi Gordo">Bois (Terminação)</option>
                    </select>
                  </div>
                  <input type="hidden" name="sexo" value="F" /><input type="hidden" name="tipo" value="Corte" /><input type="hidden" name="dataNasc" value={new Date().toISOString().split('T')[0]} />
                </div>
              </form>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => setIsBatchAnimalFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="baf" className="px-8 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors flex items-center"><ListPlus size={18} className="mr-2" /> Gerar Lote</button>
            </div>
          </div>
        </div>
      )}

      {isPesagemFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-orange-100 p-6 flex justify-between items-center bg-orange-50 shrink-0">
              <h2 className="text-xl font-black text-orange-900 flex items-center"><Scale className="mr-3 text-orange-600"/> {editingPesagem ? 'Editar Pesagem' : 'Registar Pesagem'}</h2>
              <button onClick={() => {setIsPesagemFormOpen(false); setEditingPesagem(null);}} className="text-orange-400 hover:text-orange-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="pf" onSubmit={handleSavePesagem} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Identificador do Brinco *</label><input required name="brinco" defaultValue={editingPesagem?.brinco||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" placeholder="Ex: 105" /></div>
              <div><label className="block text-sm font-bold text-orange-700 mb-2">Peso Atual na Balança (kg) *</label><input required type="number" name="pesoAtual" defaultValue={editingPesagem?.pesoAtual||''} className="w-full px-4 py-4 bg-orange-50 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-black text-2xl text-orange-900 text-center" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Data da Pesagem *</label><input required type="date" name="data" defaultValue={editingPesagem?.data || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium" /></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => {setIsPesagemFormOpen(false); setEditingPesagem(null);}} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="pf" className="px-8 py-3 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-colors flex items-center">Guardar Peso</button>
            </div>
          </div>
        </div>
      )}

      {isNascimentoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-blue-100 p-6 flex justify-between items-center bg-blue-50 shrink-0">
              <h2 className="text-xl font-black text-blue-900 flex items-center"><Baby className="mr-3 text-blue-600"/> Registar Nascimento</h2>
              <button onClick={() => setIsNascimentoFormOpen(false)} className="text-blue-400 hover:text-blue-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="nf" onSubmit={handleAddNascimento} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Brinco Matriz *</label><input required name="brincoMatriz" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" /></div>
                <div><label className="block text-sm font-bold text-blue-700 mb-2">Brinco Cria *</label><input required name="brincoBezerro" className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-900" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Sexo</label><select name="sexo" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"><option value="M">M</option><option value="F">F</option></select></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Peso (kg)</label><input required type="number" name="pesoNascimento" defaultValue="35" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Data *</label><input required type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" /></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Raça (Predominante)</label><input required name="raca" defaultValue="Nelore" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Detalhes do Parto (Obs)</label><textarea name="obs" rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Intercorrências, assistência..."></textarea></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => setIsNascimentoFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="nf" className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors flex items-center">Efetivar Registo</button>
            </div>
          </div>
        </div>
      )}

      {isNascimentoEditFormOpen && editingNascimento && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-blue-100 p-6 flex justify-between items-center bg-blue-50 shrink-0">
              <h2 className="text-xl font-black text-blue-900 flex items-center"><Edit className="mr-3 text-blue-600"/> Editar Nascimento</h2>
              <button onClick={() => { setIsNascimentoEditFormOpen(false); setEditingNascimento(null); }} className="text-blue-400 hover:text-blue-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="nef" onSubmit={handleSaveNascimentoEdit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Brinco Matriz *</label><input required name="brincoMatriz" defaultValue={editingNascimento.brincoMatriz} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" /></div>
                <div><label className="block text-sm font-bold text-blue-700 mb-2">Brinco Cria *</label><input required name="brincoBezerro" defaultValue={editingNascimento.brincoBezerro} className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-900" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Data do Parto *</label><input required type="date" name="data" defaultValue={editingNascimento.data} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Peso Nasc. *</label><input required type="number" name="pesoNascimento" defaultValue={editingNascimento.pesoNascimento} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center" /></div>
              </div>
              <input type="hidden" name="sexo" value={editingNascimento.sexo} />
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Observações</label><textarea name="obs" rows={3} defaultValue={editingNascimento.obs || ''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"></textarea></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsNascimentoEditFormOpen(false); setEditingNascimento(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="nef" className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors flex items-center">Guardar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {isLoteFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-green-100 p-6 flex justify-between items-center bg-green-50 shrink-0">
              <h2 className="text-xl font-black text-green-900 flex items-center"><LayoutGrid className="mr-3 text-green-600"/> {editingLote ? 'Editar Pastagem' : 'Novo Lote / Pasto'}</h2>
              <button onClick={() => { setIsLoteFormOpen(false); setEditingLote(null); }} className="text-green-400 hover:text-green-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="lf" onSubmit={handleSaveLote} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Nome de Referência *</label><input required name="nome" defaultValue={editingLote?.nome||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-900" placeholder="Ex: Pasto Maternidade" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Capacidade Máx.</label><input required type="number" name="capacidade" defaultValue={editingLote?.capacidade||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="Ex: 50" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label><select name="tipo" defaultValue={editingLote?.tipo||'Pasto'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"><option value="Pasto">Pasto Aberto</option><option value="Baia">Confinamento / Baia</option></select></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Qualidade / Observações</label><textarea name="obs" rows={2} defaultValue={editingLote?.obs||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" placeholder="Braquiária rotacionada..."></textarea></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsLoteFormOpen(false); setEditingLote(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="lf" className="px-8 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-md transition-colors flex items-center">Salvar Lote</button>
            </div>
          </div>
        </div>
      )}

      {isFinanceFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-green-100 p-6 flex justify-between items-center bg-green-50 shrink-0">
              <h2 className="text-xl font-black text-green-900 flex items-center"><DollarSign className="mr-3 text-green-600"/> {editingFinance ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
              <button onClick={() => { setIsFinanceFormOpen(false); setEditingFinance(null); }} className="text-green-400 hover:text-green-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="ff" onSubmit={handleSaveFinance} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Descrição da Movimentação *</label><input required name="descricao" defaultValue={editingFinance?.descricao||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="Ex: Venda de 5 Bezerras Nelore" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Fluxo</label><select name="tipo" defaultValue={editingFinance?.tipo||'receita'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-black"><option value="receita" className="text-green-600">Receita (+)</option><option value="despesa" className="text-red-600">Despesa (-)</option></select></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Valor (R$) *</label><input required type="number" step="0.01" name="valor" defaultValue={editingFinance?.valor||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-black text-lg text-right" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Data de Efetivação *</label><input required type="date" name="data" defaultValue={editingFinance?.data || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Categoria Geral</label><input required name="categoria" defaultValue={editingFinance?.categoria||'Geral'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium" /></div>
              </div>
              <input type="hidden" name="status" value={editingFinance?.status || 'pago'} />
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsFinanceFormOpen(false); setEditingFinance(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="ff" className="px-8 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-md transition-colors flex items-center">Efetivar Lançamento</button>
            </div>
          </div>
        </div>
      )}

      {isReproducaoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-pink-100 p-6 flex justify-between items-center bg-pink-50 shrink-0">
              <h2 className="text-xl font-black text-pink-900 flex items-center"><HeartPulse className="mr-3 text-pink-600"/> {editingReproducao ? 'Editar Registo' : 'Registo de Inseminação / Monta'}</h2>
              <button onClick={() => { setIsReproducaoFormOpen(false); setEditingReproducao(null); }} className="text-pink-400 hover:text-pink-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="rf" onSubmit={handleSaveReproducao} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Brinco da Matriz (Vaca/Novilha) *</label><input required name="brincoVaca" defaultValue={editingReproducao?.brincoVaca||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-bold" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Identificação do Sêmen ou Touro *</label><input required name="reprodutor" defaultValue={editingReproducao?.reprodutor||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-bold" placeholder="Ex: Nelore PO 5543" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Método Utilizado</label><select name="metodo" defaultValue={editingReproducao?.metodo||'IA'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium"><option value="IA">Inseminação Artific.</option><option value="IATF">IATF</option><option value="TE">Transf. Embrião</option><option value="Monta Natural">Monta Natural</option></select></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Data do Evento *</label><input required type="date" name="dataInseminacao" defaultValue={editingReproducao?.dataInseminacao || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium" /></div>
              </div>
              <input type="hidden" name="status" value={editingReproducao?.status || 'Prenhe'} />
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsReproducaoFormOpen(false); setEditingReproducao(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="rf" className="px-8 py-3 rounded-xl font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-md transition-colors flex items-center">Salvar Registo</button>
            </div>
          </div>
        </div>
      )}

      {isVaccineFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-red-100 p-6 flex justify-between items-center bg-red-50 shrink-0">
              <h2 className="text-xl font-black text-red-900 flex items-center"><ShieldAlert className="mr-3 text-red-600"/> {editingVaccine ? 'Editar Tratamento' : 'Novo Registo Sanitário'}</h2>
              <button onClick={() => { setIsVaccineFormOpen(false); setEditingVaccine(null); }} className="text-red-400 hover:text-red-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="vf" onSubmit={handleSaveVaccine} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Nome da Vacina / Medicamento *</label><input required name="vacina" defaultValue={editingVaccine?.vacina||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-900" placeholder="Ex: Ivermectina 1%" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Lote de Aplicação</label><select name="lote" defaultValue={editingVaccine?.lote||'Todo o Rebanho'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-medium"><option value="Todo o Rebanho">Todo o Rebanho</option>{cLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}</select></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Cabeças Vacinadas</label><input required type="number" name="qtdAnimais" defaultValue={editingVaccine?.qtdAnimais||1} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Data da Aplicação *</label><input required type="date" name="dataAplicacao" defaultValue={editingVaccine?.dataAplicacao || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-medium" /></div>
                <div><label className="block text-sm font-bold text-red-700 mb-2">Carência do Leite/Corte (Dias)</label><input required type="number" name="carenciaDias" defaultValue={editingVaccine?.carenciaDias||0} className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-black text-red-900" /></div>
              </div>
              <input type="hidden" name="status" value="concluida" />
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsVaccineFormOpen(false); setEditingVaccine(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="vf" className="px-8 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors flex items-center">Efetivar Registo</button>
            </div>
          </div>
        </div>
      )}

      {isInsumoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-purple-100 p-6 flex justify-between items-center bg-purple-50 shrink-0">
              <h2 className="text-xl font-black text-purple-900 flex items-center"><Archive className="mr-3 text-purple-600"/> {editingInsumo ? 'Editar Insumo' : 'Entrada de Novo Insumo'}</h2>
              <button onClick={() => { setIsInsumoFormOpen(false); setEditingInsumo(null); }} className="text-purple-400 hover:text-purple-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="inf" onSubmit={handleSaveInsumo} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Descrição do Produto *</label><input required name="nome" defaultValue={editingInsumo?.nome||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-bold" placeholder="Ex: Sal Mineral 80..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Finalidade / Categoria</label><input required name="categoria" defaultValue={editingInsumo?.categoria||'Nutrição'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Unidade de Medida</label><input required name="unidade" defaultValue={editingInsumo?.unidade||''} placeholder="kg, fardos, L..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Qtd de Entrada *</label><input required type="number" step="0.01" name="quantidade" defaultValue={editingInsumo?.quantidade||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-black text-lg" /></div>
                <div><label className="block text-sm font-bold text-purple-700 mb-2">Alerta de Estoque Mín.</label><input required type="number" step="0.01" name="estoqueMinimo" defaultValue={editingInsumo?.estoqueMinimo||10} className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-bold text-purple-900" /></div>
              </div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsInsumoFormOpen(false); setEditingInsumo(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="inf" className="px-8 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-colors flex items-center">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}

      {isConsumoFormOpen && consumoInsumoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-orange-100 p-6 flex justify-between items-center bg-orange-50 shrink-0">
              <h2 className="text-xl font-black text-orange-900 flex items-center"><MinusCircle className="mr-3 text-orange-600"/> Lançar Consumo de Insumo</h2>
              <button onClick={() => { setIsConsumoFormOpen(false); setConsumoInsumoSelecionado(null); }} className="text-orange-400 hover:text-orange-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="cf" onSubmit={handleLancarConsumo} className="p-8 space-y-6">
              <div className="bg-orange-100/50 p-4 rounded-xl border border-orange-100">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">Stock Disponível Atualmente</p>
                <p className="text-2xl font-black text-orange-900">{consumoInsumoSelecionado.quantidade} <span className="text-sm font-bold text-orange-700">{consumoInsumoSelecionado.unidade}</span></p>
                <p className="text-sm font-bold text-gray-700 mt-2">{consumoInsumoSelecionado.nome}</p>
              </div>
              <div><label className="block text-sm font-bold text-orange-700 mb-2">Quantidade a Subtrair ao Estoque *</label><input required type="number" step="0.01" name="quantidadeConsumo" max={consumoInsumoSelecionado.quantidade} className="w-full px-4 py-4 bg-white border-2 border-orange-300 rounded-xl outline-none focus:ring-4 focus:ring-orange-500/20 font-black text-2xl text-center text-orange-900 shadow-inner" placeholder="0.00" autoFocus /></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsConsumoFormOpen(false); setConsumoInsumoSelecionado(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="cf" className="px-8 py-3 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-colors flex items-center">Efetivar Consumo</button>
            </div>
          </div>
        </div>
      )}

      {isPropriedadeFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-blue-100 p-6 flex justify-between items-center bg-blue-50 shrink-0">
              <h2 className="text-xl font-black text-blue-900 flex items-center"><MapPin className="mr-3 text-blue-600"/> {editingPropriedade ? 'Editar' : 'Nova'} Propriedade</h2>
              <button onClick={() => { setIsPropriedadeFormOpen(false); setEditingPropriedade(null); }} className="text-blue-400 hover:text-blue-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="propf" onSubmit={handleSavePropriedade} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Nome Comercial da Fazenda *</label><input required name="nome" defaultValue={editingPropriedade?.nome||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Responsável Legal / Gestor *</label><input required name="responsavel" defaultValue={editingPropriedade?.responsavel||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Município Sede</label><input required name="cidade" defaultValue={editingPropriedade?.cidade||'Rondonópolis'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Estado (UF)</label><input required name="estado" maxLength={2} defaultValue={editingPropriedade?.estado||'MT'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold text-center" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Área Total (Hectares)</label><input required type="number" name="area_ha" defaultValue={editingPropriedade?.area_ha||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">Inscrição Estadual (IE)</label><input name="ie" defaultValue={editingPropriedade?.ie||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Opcional" /></div>
              </div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsPropriedadeFormOpen(false); setEditingPropriedade(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="propf" className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors flex items-center">Salvar Estrutura</button>
            </div>
          </div>
        </div>
      )}

      {isUsuarioFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-indigo-100 p-6 flex justify-between items-center bg-indigo-50 shrink-0">
              <h2 className="text-xl font-black text-indigo-900 flex items-center"><Users className="mr-3 text-indigo-600"/> {editingUsuario ? 'Editar Operador' : 'Novo Convite de Acesso'}</h2>
              <button onClick={() => { setIsUsuarioFormOpen(false); setEditingUsuario(null); }} className="text-indigo-400 hover:text-indigo-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="usrf" onSubmit={handleSaveUsuario} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo *</label><input required name="nome" defaultValue={editingUsuario?.nome||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Email para Login *</label><input required type="email" name="email" defaultValue={editingUsuario?.email||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Senha Provisória *</label><input required type="text" name="senha" defaultValue={editingUsuario?.senha||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Defina uma senha segura..." /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Nível de Permissão do Sistema</label><select name="role" defaultValue={editingUsuario?.role||'Operador'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"><option value="Operador">Operador (Lança dados na fazenda)</option><option value="Admin">Administrador (Controlo total)</option><option value="Leitor">Investidor/Leitor (Apenas visualizar)</option></select></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsUsuarioFormOpen(false); setEditingUsuario(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="usrf" className="px-8 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors flex items-center">{editingUsuario ? 'Salvar Edição' : 'Criar Conta'}</button>
            </div>
          </div>
        </div>
      )}

      {emailModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center animate-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={32} /></div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Conta Criada!</h2>
            <p className="text-gray-500 font-medium mb-6">Pode enviar os dados de acesso diretamente para o email do novo operador.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left mb-6 space-y-3">
              <p className="text-sm"><span className="font-bold text-gray-400 uppercase">Utilizador:</span> <span className="font-bold text-gray-900 block">{emailModalData.nome}</span></p>
              <p className="text-sm"><span className="font-bold text-gray-400 uppercase">Email/Login:</span> <span className="font-bold text-indigo-600 block">{emailModalData.email}</span></p>
              <p className="text-sm"><span className="font-bold text-gray-400 uppercase">Senha Gerada:</span> <code className="bg-white border border-gray-200 px-2 py-1 rounded-lg font-mono text-gray-900 block mt-1">{emailModalData.senha}</code></p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEmailModalData(null)} className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Fechar</button>
              <button onClick={handleSendEmail} className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors flex items-center justify-center"><Mail size={18} className="mr-2" /> Enviar por Email</button>
            </div>
          </div>
        </div>
      )}

      {isCalendarioFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-yellow-100 p-6 flex justify-between items-center bg-yellow-50 shrink-0">
              <h2 className="text-xl font-black text-yellow-900 flex items-center"><CalendarDays className="mr-3 text-yellow-600"/> {editingCalendario ? 'Editar Data' : 'Novo Evento no Calendário'}</h2>
              <button onClick={() => { setIsCalendarioFormOpen(false); setEditingCalendario(null); }} className="text-yellow-500 hover:text-yellow-700 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form id="calf" onSubmit={handleSaveCalendario} className="p-8 space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Campanha / Doença *</label><input required name="doenca" defaultValue={editingCalendario?.doenca||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 font-bold" placeholder="Ex: Campanha da Aftosa" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Mês / Período *</label><input required name="mes" defaultValue={editingCalendario?.mes||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 font-medium" placeholder="Ex: Novembro" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Público Alvo na Fazenda *</label><input required name="publico" defaultValue={editingCalendario?.publico||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 font-medium" placeholder="Ex: Bezerros de 3 a 8 meses" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Exigência Legal (IDARON)</label><select name="obrigatorio" defaultValue={editingCalendario ? (editingCalendario.obrigatorio ? 'true' : 'false') : 'true'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-yellow-900"><option value="true">Obrigatório (Oficial)</option><option value="false">Maneio Recomendado</option></select></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 space-x-3 bg-gray-50/50">
              <button onClick={() => { setIsCalendarioFormOpen(false); setEditingCalendario(null); }} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
              <button type="submit" form="calf" className="px-8 py-3 rounded-xl font-bold bg-yellow-600 hover:bg-yellow-700 text-white shadow-md transition-colors flex items-center">Agendar Evento</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
