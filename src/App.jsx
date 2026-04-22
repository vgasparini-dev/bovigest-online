// build trigger
// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search, Plus, MapPin, DollarSign, HeartPulse, 
  LayoutGrid, X, Trash2, Edit, Baby, LayoutDashboard, Scale, Settings, Sparkles, Bot, Send, 
  Loader2, CheckCircle2, Download, Archive, Target, PackagePlus, AlertTriangle, ListPlus, 
  ShieldAlert, Wheat, Calculator, Users, CalendarDays, Mail, MessageSquare, Save, NotebookPen, 
  Cloud, CloudOff, MinusCircle, Menu, Droplets, CheckSquare
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

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

const defaultData = {
  propriedades: [{ id: 1, nome: "Minha Fazenda", responsavel: "Gestor", cidade: "Local", estado: "BR", area_ha: 100, ie: "" }],
  usuarios: [{ id: 1, nome: "Administrador", email: "admin@bovigest.com", senha: "admin", role: "Admin", status: "Ativo" }],
  calendarioSanitario: [
    { id: 1, propriedadeId: 1, doenca: "Febre Aftosa", mes: "Maio / Novembro", publico: "Bovinos", obrigatorio: true },
    { id: 2, propriedadeId: 1, doenca: "Brucelose", mes: "Qualquer", publico: "Fêmeas 3-8m", obrigatorio: true },
    { id: 3, propriedadeId: 1, doenca: "Raiva", mes: "Maio", publico: "Todo Rebanho", obrigatorio: true },
    { id: 4, propriedadeId: 1, doenca: "Vermifugação", mes: "Maio/Ago/Nov", publico: "Rebanho", obrigatorio: false }
  ],
  lotes: [], animais: [], pesagens: [], reproducao: [], nascimentos: [], vacinacoes: [], insumos: [], financeiro: [], anotacoes: [], producaoLeite: [],
  bibliotecaAlimentos: [
    { id: 1, nome: "Silagem Milho", ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: "Milho Grão", ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 }
  ]
};

// --- COMPONENTES UI REUTILIZÁVEIS E BLINDADOS ---
const Input = ({ label, name, type = "text", req = false, def = "", ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1.5">{label} {req && <span className="text-red-500">*</span>}</label>
    <input type={type} name={name} required={req} defaultValue={def} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all" {...props} />
  </div>
);

const Select = ({ label, name, req = false, def = "", options, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1.5">{label} {req && <span className="text-red-500">*</span>}</label>
    <select name={name} required={req} defaultValue={def} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all appearance-none" {...props}>
      {options.map((o, i) => {
        const val = typeof o === 'object' && o !== null ? o.val : o;
        const lbl = typeof o === 'object' && o !== null ? o.lbl : o;
        return <option key={i} value={val}>{lbl}</option>;
      })}
    </select>
  </div>
);

const Modal = ({ title, icon: Icon, onClose, onSubmit, formId, submitText = "Salvar", children, wide }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className={`bg-white rounded-3xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-hidden flex flex-col max-h-[90vh] shadow-2xl`}>
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h2 className="font-black text-lg text-gray-900 flex items-center"><Icon className="mr-2 text-green-600"/> {title}</h2>
        <button type="button" onClick={onClose} className="p-1.5 bg-white text-gray-400 hover:text-gray-800 rounded-full shadow-sm transition-colors"><X size={18}/></button>
      </div>
      <div className="overflow-y-auto p-6 custom-scrollbar">
        <form id={formId} onSubmit={onSubmit} className="space-y-4">{children}</form>
      </div>
      <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100">Cancelar</button>
        <button type="submit" form={formId} className="px-8 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-black shadow-md">{submitText}</button>
      </div>
    </div>
  </div>
);

const Table = ({ headers, children }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden w-full">
    <div className="overflow-x-auto w-full custom-scrollbar max-h-[60vh]">
      <table className="min-w-full divide-y divide-gray-100 relative">
        <thead className="bg-gray-50 sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
          <tr>{headers.map((h, i) => <th key={i} className={`px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-500 whitespace-nowrap ${i === headers.length-1 ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">{children}</tbody>
      </table>
    </div>
  </div>
);

// --- IA E UTILITÁRIOS ---
const callGemini = async (prompt, sys, userApiKey) => {
  if (!userApiKey) return "⚠️ Chave API do Gemini não configurada em Configurações.";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${userApiKey.trim()}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: sys }] } })
    });
    if (!res.ok) throw new Error("Erro API");
    const result = await res.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
  } catch (e) { return "❌ Erro ao comunicar com IA. Verifique a chave e a internet."; }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
    const [farmName, setFarmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [activePropriedadeId, setActivePropriedadeId] = useState(1);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('bovigest_ai_key') || '');
  const [selectedAnimaisIds, setSelectedAnimaisIds] = useState([]); 

  // Gestão unificada de Modais
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [modalType, setModalType] = useState(null); 
  const [editingItem, setEditingItem] = useState(null);
  const [consumoItem, setConsumoItem] = useState(null);

  const [aiInsights, setAiInsights] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: 'Olá! Sou o seu Consultor Agro IA. Como posso ajudar?' }]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dietaAtual, setDietaAtual] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState("");
  const [emailModalData, setEmailModalData] = useState(null);
  const [sanidadeTab, setSanidadeTab] = useState('registos');

  const [nutriAlvoPeso, setNutriAlvoPeso] = useState(400);
  const [nutriAlvoGPD, setNutriAlvoGPD] = useState(1.2);

  // --- NUVEM & PERSISTÊNCIA FIREBASE ---
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_v1');
    if (saved) {
      try { return { ...defaultData, ...JSON.parse(saved) }; } catch (e) { return defaultData; }
    }
    return defaultData;
  });
  
  const [isCloudReady, setIsCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('connecting'); // ADICIONADO AQUI
  const [firebaseUser, setFirebaseUser] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setFirebaseUser);
  }, []);

  useEffect(() => {
    if (!firebaseUser || !isLoggedIn || !currentUser) return;
    const docRef = doc(db, 'bovigest_users', currentUser.email);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setAppData(prev => ({ ...defaultData, ...docSnap.data() }));
      setIsCloudReady(true);
      setCloudStatus('online'); // ATUALIZAR STATUS DA NUVEM
    }, (err) => { 
      console.error(err); 
      setCloudStatus('error'); 
    });
    return () => unsub();
  }, [firebaseUser, isLoggedIn, currentUser]);

  const updateApp = (updater) => {
    setAppData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (isCloudReady && currentUser) setDoc(doc(db, 'bovigest_users', currentUser.email), next).catch(console.error);
      localStorage.setItem('bovigest_data_v1', JSON.stringify(next)); 
      return next;
    });
    setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
  };

  useEffect(() => { localStorage.setItem('bovigest_ai_key', geminiApiKey); }, [geminiApiKey]);

  // --- ACESSO AOS DADOS SEGURO (Prevenção de Tela Branca) ---
  const d = appData || defaultData;
  const arr = (v) => Array.isArray(v) ? v : [];
  
  const pAtiva = arr(d.propriedades).find(p => p.id === activePropriedadeId) || arr(d.propriedades)[0] || defaultData.propriedades[0];
  const cAnimais = arr(d.animais).filter(a => a.propriedadeId === activePropriedadeId);
  const cLotes = arr(d.lotes).filter(a => a.propriedadeId === activePropriedadeId);
  const cFin = arr(d.financeiro).filter(a => a.propriedadeId === activePropriedadeId);
  const cPesagens = arr(d.pesagens).filter(a => a.propriedadeId === activePropriedadeId);
  const cRep = arr(d.reproducao).filter(a => a.propriedadeId === activePropriedadeId);
  const cNasc = arr(d.nascimentos).filter(a => a.propriedadeId === activePropriedadeId);
  const cVac = arr(d.vacinacoes).filter(a => a.propriedadeId === activePropriedadeId);
  const cInsumos = arr(d.insumos).filter(a => a.propriedadeId === activePropriedadeId);
  const cCal = arr(d.calendarioSanitario).filter(a => a.propriedadeId === activePropriedadeId);
  const cAnot = arr(d.anotacoes).filter(a => a.propriedadeId === activePropriedadeId);
  const cLeite = arr(d.producaoLeite).filter(a => a.propriedadeId === activePropriedadeId);

  // --- CÁLCULOS ROBUSTOS ---
  const formatCurrency = (val) => Number.isFinite(Number(val)) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val)) : "R$ 0,00";
  
  const finStats = useMemo(() => cFin.reduce((acc, i) => {
    if (i?.status === 'pago') { i.tipo === 'receita' ? acc.r += Number(i.valor||0) : acc.d += Number(i.valor||0); }
    return acc;
  }, { r: 0, d: 0 }), [cFin]);
  
  const saldoAtual = finStats.r - finStats.d;
  const pesoMedio = cAnimais.length === 0 ? 0 : Math.round(cAnimais.reduce((acc, a) => acc + (Number(a.peso)||0), 0) / cAnimais.length);
  const custoArroba = cAnimais.length === 0 || finStats.d === 0 ? 0 : finStats.d / (cAnimais.reduce((acc, a) => acc + (Number(a.peso)||0), 0) / 30);

  const filtAnimais = useMemo(() => cAnimais.filter(a => {
    const q = String(searchQuery||'').toLowerCase();
    return String(a.brinco||'').toLowerCase().includes(q) || String(a.nome||'').toLowerCase().includes(q) || String(a.lote||'').toLowerCase().includes(q);
  }), [searchQuery, cAnimais]);

  const femeasArray = cAnimais.filter(a => a.sexo === 'F');
  const gadoDeCorte = cAnimais.filter(a => a.tipo === 'Corte');
  const totalLeiteMes = cLeite.filter(l => l.data && new Date(l.data).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + (Number(curr.litros)||0), 0);

  const mediaLitrosVaca = femeasArray.length === 0 ? 0 : (totalLeiteMes / femeasArray.length).toFixed(1); const getGPD = (brinco) => {
    const p = cPesagens.filter(x => x.brinco === brinco).sort((a,b) => new Date(b.data) - new Date(a.data));
    if (p.length > 1 && p[0].data && p[1].data) { 
      const dias = (new Date(p[0].data) - new Date(p[1].data)) / 86400000; 
      return dias > 0 ? ((p[0].pesoAtual - p[1].pesoAtual) / dias).toFixed(2) : null; 
    }
    return null;
  };

  const isEmCarencia = (lote) => { const v = cVac.find(x => x.lote === lote || x.lote === "Todo o Rebanho"); return (v && v.dataLiberacao && new Date() < new Date(v.dataLiberacao)) ? v : false; };

  // --- HANDLERS E FUNÇÕES ---
  const openModal = (type, item = null) => { setEditingItem(item); setModalType(type); };
  const closeModal = () => { setModalType(null); setEditingItem(null); setConsumoItem(null); };
  const handleDel = (coll, id) => { if(confirm('Confirmar remoção permanente?')) updateApp(p => ({ ...p, [coll]: arr(p[coll]).filter(x => x.id !== id) })); };
  
  const handleLogin = async (e) => {
    e.preventDefault(); setIsLoginLoading(true); setLoginError("");
    const email = e.target.email.value.trim().toLowerCase(); const senha = e.target.senha.value;
    try {
      const docSnap = await getDoc(doc(db, 'bovigest_users', email));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const user = arr(data.usuarios).find(u => u.email === email);
        if (user && user.senha === senha) { setAppData({ ...defaultData, ...data }); setCurrentUser(user); setIsLoggedIn(true); } 
        else setLoginError("Senha incorreta.");
      } else {
        let newData = { ...defaultData };
        newData.usuarios = [{ id: Date.now(), nome: email.split('@')[0], email, senha, role: "Admin", status: "Ativo" }];
        await setDoc(doc(db, 'bovigest_users', email), newData);
        setAppData(newData); setCurrentUser(newData.usuarios[0]); setIsLoggedIn(true);
      }
    } catch(err) { setLoginError("Erro na nuvem."); }
    setIsLoginLoading(false);
  };

  const handleSaveForm = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const d = Object.fromEntries(fd.entries());
    d.id = editingItem?.id || Date.now();
    d.propriedadeId = activePropriedadeId;

    if (modalType === 'animal') { 
      d.peso = Number(d.peso); d.ativo = true; 
      updateApp(p => ({...p, animais: editingItem ? arr(p.animais).map(x=>x.id===d.id?d:x) : [d, ...arr(p.animais)]})); 
    }
    if (modalType === 'batch') { 
      const n = []; const pref = d.prefixo||''; const qtd = Number(d.quantidade); const ini = Number(d.inicio);
      for(let i=0; i<qtd; i++) n.push({ ...d, id: Date.now()+i, brinco: `${pref}${(ini+i).toString().padStart(3,'0')}`, nome: "-", sexo: fd.get('sexo'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'), dataNasc: fd.get('dataNasc'), peso: Number(d.peso), ativo: true});
      updateApp(p => ({...p, animais: [...n, ...arr(p.animais)]})); 
    }
    if (modalType === 'lote') { 
      d.capacidade = Number(d.capacidade); 
      updateApp(p => ({...p, lotes: editingItem ? arr(p.lotes).map(x=>x.id===d.id?d:x) : [d, ...arr(p.lotes)]})); 
    }
    if (modalType === 'pesagem') { 
      d.pesoAtual = Number(d.pesoAtual); const an = cAnimais.find(x=>x.brinco===d.brinco); if(!an && !editingItem) return alert('Brinco não encontrado.');
      d.pesoAnterior = editingItem ? editingItem.pesoAnterior : an.peso;
      updateApp(p => ({...p, pesagens: editingItem ? arr(p.pesagens).map(x=>x.id===d.id?d:x) : [d, ...arr(p.pesagens)], animais: arr(p.animais).map(x=>x.brinco===d.brinco?{...x,peso:d.pesoAtual}:x)})); 
    }
    if (modalType === 'financeiro') { 
      d.valor = Number(d.valor); d.status = d.status||'pago'; 
      updateApp(p => ({...p, financeiro: editingItem ? arr(p.financeiro).map(x=>x.id===d.id?d:x) : [d, ...arr(p.financeiro)]})); 
    }
    if (modalType === 'reproducao') { 
      d.previsaoParto = d.dataInseminacao ? new Date(new Date(d.dataInseminacao).setDate(new Date(d.dataInseminacao).getDate()+290)).toISOString().split('T')[0] : ''; 
      updateApp(p => ({...p, reproducao: editingItem ? arr(p.reproducao).map(x=>x.id===d.id?d:x) : [d, ...arr(p.reproducao)]})); 
    }
    if (modalType === 'nascimento') { 
      d.pesoNascimento = Number(d.pesoNascimento);
      const cria = { id: d.id+1, propriedadeId: activePropriedadeId, brinco: d.brincoBezerro, nome: "-", sexo: d.sexo, categoria: "Bezerro(a)", tipo: "Cria", raca: d.raca, dataNasc: d.data, peso: d.pesoNascimento, lote: "Maternidade", obs: `Cria de ${d.brincoMatriz}`, ativo: true };
      updateApp(p => ({...p, nascimentos: editingItem ? arr(p.nascimentos).map(x=>x.id===d.id?d:x) : [d, ...arr(p.nascimentos)], animais: editingItem ? arr(p.animais) : [cria, ...arr(p.animais)]})); 
    }
    if (modalType === 'leite') { 
      d.litros = Number(d.litros); 
      updateApp(p => ({...p, producaoLeite: editingItem ? arr(p.producaoLeite).map(x=>x.id===d.id?d:x) : [d, ...arr(p.producaoLeite)]})); 
    }
    if (modalType === 'vacina') { 
      d.carenciaDias = Number(d.carenciaDias); d.qtdAnimais = Number(d.qtdAnimais);
      if(d.carenciaDias > 0) { const ld = new Date(d.dataAplicacao); ld.setDate(ld.getDate()+d.carenciaDias); d.dataLiberacao = ld.toISOString().split('T')[0]; }
      updateApp(p => ({...p, vacinacoes: editingItem ? arr(p.vacinacoes).map(x=>x.id===d.id?d:x) : [d, ...arr(p.vacinacoes)]})); 
    }
    if (modalType === 'insumo') { 
      d.quantidade = Number(d.quantidade); d.estoqueMinimo = Number(d.estoqueMinimo); 
      updateApp(p => ({...p, insumos: editingItem ? arr(p.insumos).map(x=>x.id===d.id?d:x) : [d, ...arr(p.insumos)]})); 
    }
    if (modalType === 'consumo') { 
      const q = Number(d.quantidadeConsumo); 
      updateApp(p => ({...p, insumos: arr(p.insumos).map(x=>x.id===consumoItem.id ? {...x, quantidade: Math.max(0, x.quantidade-q)} : x)})); 
    }
    if (modalType === 'calendario') { 
      d.obrigatorio = d.obrigatorio === 'true'; 
      updateApp(p => ({...p, calendarioSanitario: editingItem ? arr(p.calendarioSanitario).map(x=>x.id===d.id?d:x) : [d, ...arr(p.calendarioSanitario)]})); 
    }
    if (modalType === 'anotacao') { 
      d.status = 'aberto'; d.data = new Date().toLocaleDateString('pt-BR'); 
      updateApp(p => ({...p, anotacoes: [d, ...arr(p.anotacoes)]})); 
    }
    if (modalType === 'propriedade') { 
      d.area_ha = Number(d.area_ha); 
      updateApp(p => ({...p, propriedades: editingItem ? arr(p.propriedades).map(x=>x.id===d.id?d:x) : [d, ...arr(p.propriedades)]})); 
    }
    if (modalType === 'usuario') { 
      updateApp(p => ({...p, usuarios: editingItem ? arr(p.usuarios).map(x=>x.id===d.id?d:x) : [d, ...arr(p.usuarios)]})); 
      if (!editingItem) setEmailModalData(d); 
    }

    closeModal();
  };

  // --- SELEÇÃO MÚLTIPLA ---
  const toggleAnimalSelection = (id) => setSelectedAnimaisIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
  const toggleAllAnimais = () => setSelectedAnimaisIds(selectedAnimaisIds.length === filtAnimais.length ? [] : filtAnimais.map(a=>a.id));
  const handleDeleteMultipleAnimais = () => {
    if (confirm(`Atenção: Deseja remover permanentemente ${selectedAnimaisIds.length} animais?`)) {
      updateApp(p => ({ ...p, animais: arr(p.animais).filter(a => !selectedAnimaisIds.includes(a.id)) }));
      setSelectedAnimaisIds([]);
    }
  };

  // --- IA E EXPORTAÇÕES ---
  const handleAnalyzeFarm = async () => {
    setIsAnalyzing(true);
    const ctx = `Rebanho: ${cAnimais.length} cab. Peso Médio: ${pesoMedio}kg. Saldo: ${formatCurrency(saldoAtual)}.`;
    const response = await callGemini("Resumo executivo de indicadores positivos e sugestão de lucro. Contexto: " + ctx, "Consultor agronegócio PT-PT.", geminiApiKey);
    setAiInsights(response);
    setIsAnalyzing(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault(); if (!chatInput.trim()) return;
    const txt = chatInput; setChatMessages(p => [...p, { role: 'user', text: txt }]); setChatInput(""); setIsChatLoading(true);
    const ctx = `Animais: ${cAnimais.length}. Lotes: ${cLotes.length}.`;
    const hist = chatMessages.map(m => `${m.role}: ${m.text}`).join("\n");
    const aiResponse = await callGemini(`Contexto: ${ctx}\nHistórico:\n${hist}\nUser: ${txt}`, "Assistente pecuário.", geminiApiKey);
    setChatMessages(p => [...p, { role: 'model', text: aiResponse }]);
    setIsChatLoading(false);
  };

  const exportCSV = (name, hdrs, rows) => { 
    const blob = new Blob([[hdrs.join(','), ...rows.map(r=>r.map(i=>`"${i}"`).join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' }); 
    const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = name; l.click(); 
  };

  // --- MENU ---
  const navs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' }, { id: 'animais', icon: Beef, label: 'Rebanho' }, { id: 'gado_corte', icon: Target, label: 'Engorda' }, { id: 'leite', icon: Droplets, label: 'Leite' }, { id: 'pastagens', icon: LayoutGrid, label: 'Lotes' }, { id: 'reproducao', icon: HeartPulse, label: 'Reprodução' }, { id: 'nascimentos', icon: Baby, label: 'Nascimentos' }, { id: 'pesagens', icon: Scale, label: 'Pesagens' }, { id: 'sanidade', icon: ShieldAlert, label: 'Sanidade' }, { id: 'nutricao', icon: Wheat, label: 'Nutrição' }, { id: 'insumos', icon: Archive, label: 'Insumos' }, { id: 'financeiro', icon: DollarSign, label: 'Financeiro' }, { id: 'anotacoes', icon: NotebookPen, label: 'Anotações' }, { id: 'ai-assistant', icon: Sparkles, label: 'Assistente IA' }, { id: 'propriedades', icon: MapPin, label: 'Propriedades' }, { id: 'configuracoes', icon: Settings, label: 'Configurações' }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center px-4 max-w-md mx-auto">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-700 rounded-3xl flex items-center justify-center shadow-2xl mb-6"><Beef size={48} className="text-white" /></div>
          <h2 className="text-5xl font-extrabold text-white tracking-tight">BoviGest <span className="text-green-500">PRO</span></h2>
          <div className="mt-8 bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 text-left">
            {loginError && <p className="text-red-400 mb-4 font-bold text-center">{loginError}</p>}
            <form className="space-y-6" onSubmit={handleLogin}>
              <Input label="Email de Acesso (Ou digite novo para criar)" name="email" type="email" req placeholder="ex: gestor@fazenda.com" className="w-full px-5 py-4 bg-slate-800 text-white border-none rounded-xl outline-none" />
              <Input label="Senha" name="senha" type="password" req placeholder="••••••••" className="w-full px-5 py-4 bg-slate-800 text-white border-none rounded-xl outline-none" />
              <button type="submit" disabled={isLoginLoading} className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 shadow-lg">{isLoginLoading ? 'A conectar...' : 'Entrar no Sistema'}</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-gray-900 font-sans">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-950/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-950 flex flex-col z-50 transition-transform md:relative ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center"><div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-3"><Beef size={22} className="text-white" /></div><span className="text-2xl font-black text-white">BoviGest</span></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white"><X/></button>
        </div>
        <div className="p-6 bg-slate-900/50 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-green-400 font-bold mr-3 shrink-0">{(currentUser?.nome || 'U')[0].toUpperCase()}</div>
            <div className="overflow-hidden"><p className="font-bold text-sm text-white truncate">{pAtiva.nome}</p><p className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-widest">{pAtiva.responsavel}</p></div>
          </div>
          <select value={activePropriedadeId} onChange={(e) => setActivePropriedadeId(Number(e.target.value))} className="w-full bg-slate-800 text-white text-sm font-bold px-3 py-2 rounded-lg outline-none">
            {arr(appData.propriedades).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navs.map(n => {
            const act = currentView === n.id;
            return (
              <button key={n.id} onClick={() => { setCurrentView(n.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${act ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <n.icon className={`mr-3 h-5 w-5 ${act?'text-white':'text-slate-500'}`} /> {n.label}
              </button>
            )
          })}
        </nav>
        <div className="p-6 border-t border-slate-800/50 shrink-0">
          <button onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }} className="flex items-center justify-center w-full px-4 py-3 text-slate-400 border border-slate-700/50 hover:text-red-400 hover:bg-slate-900 rounded-xl font-bold text-sm">
            <LogOut className="mr-2 h-4 w-4" /> Terminar Sessão
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 sm:h-24 bg-white border-b flex items-center justify-between px-6 sm:px-10 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-4 bg-gray-100 p-2 rounded-lg"><Menu/></button>
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center">
              {(() => { const C = navs.find(n=>n.id===currentView)?.icon || LayoutDashboard; return <C className="mr-3 text-green-600 shrink-0" size={26} /> })()}
              {navs.find(n=>n.id===currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            {cloudStatus === 'online' && <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex"><Cloud size={14} className="mr-1"/> Nuvem</span>}
            {saveSuccess && <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex"><CheckCircle2 size={14} className="mr-1"/> Salvo</span>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-blue-600"><Beef size={28}/></div><h3 className="text-4xl font-black">{cAnimais.length}</h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase">Cabeças</p></div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-green-600"><DollarSign size={28}/></div><h3 className="text-2xl font-black mt-2 truncate">{formatCurrency(saldoAtual)}</h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase">Saldo Global</p></div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="bg-cyan-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-cyan-600"><Droplets size={28}/></div><h3 className="text-4xl font-black">{totalLeiteMes} <span className="text-lg text-gray-400">L</span></h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase">Leite Mês</p></div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="bg-pink-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-pink-600"><HeartPulse size={28}/></div><h3 className="text-4xl font-black">{cRep.filter(r=>r.status==='Prenhe').length}</h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase">Prenhes</p></div><div className="bg-white p-5 rounded-3xl border shadow-sm"><div className="bg-rose-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-rose-500 font-black text-xl">♀</div><h3 className="text-3xl font-black text-rose-500">{cAnimais.filter(a=>a.sexo==='F').length}</h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase">Fêmeas</p></div><div className="bg-white p-5 rounded-3xl border shadow-sm"><div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-blue-500 font-black text-xl">♂</div><h3 className="text-3xl font-black text-blue-500">{cAnimais.filter(a=>a.sexo==='M').length}</h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase">Machos</p></div>
              </div>
            </div>
          )}

          {currentView === 'animais' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Pesquisar brinco, lote..." className="w-full pl-12 pr-4 py-3 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="flex gap-2">
                  {selectedAnimaisIds.length > 0 ? (
                    <button onClick={handleDeleteMultipleAnimais} className="bg-red-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Trash2 size={18} className="mr-2"/> Remover {selectedAnimaisIds.length}</button>
                  ) : (
                    <><button onClick={()=>openModal('batch')} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><ListPlus size={18} className="mr-2"/> Lote</button><button onClick={()=>openModal('animal')} className="bg-green-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Único</button></>
                  )}
                </div>
              </div>
              <Table headers={['Sel.', 'Animal', 'Sexo', 'Lote', 'Peso', 'Ações']}>
                {filtAnimais.map(a => (
                  <tr key={a.id} className={selectedAnimaisIds.includes(a.id) ? 'bg-green-50' : 'hover:bg-gray-50'}>
                    <td className="px-5 py-4 text-center"><input type="checkbox" checked={selectedAnimaisIds.includes(a.id)} onChange={()=>toggleAnimalSelection(a.id)} className="w-4 h-4 text-green-600"/></td>
                    <td className="px-5 py-4 flex items-center gap-4"><div className="w-12 h-12 bg-green-100 text-green-700 font-black rounded-xl flex items-center justify-center text-sm">{a.brinco}</div><div><div className="font-black text-sm">{a.nome!=='-'?a.nome:`Brinco ${a.brinco}`}</div><div className="text-xs text-gray-500 font-medium">{a.raca} • {a.categoria} • <span classname={`font-bold ${a.sexo==='F'?'text-rose-500':'text-blue-500'}`}>{a.sexo==='F'?'♀ fêmea':'♂ macho'}</span></div></div></td>
                    <td className="px-5 py-4 text-center"><span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${a.sexo==='F'?'bg-rose-100 text-rose-600':'bg-blue-100 text-blue-600'}`}>{a.sexo==='F'?'♀ Fêmea':'♂ Macho'}</span></td><td className="px-5 py-4"><span className="bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs">{a.lote}</span></td>
                    <td className="px-5 py-4 text-right font-black text-lg">{a.peso} <span className="text-xs text-gray-400">kg</span></td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={()=>setSelectedAnimal(a)} className="bg-white border text-gray-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-50 mr-2 shadow-sm">Ficha</button>
                      <button onClick={()=>openModal('animal', a)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit size={18}/></button>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {currentView === 'gado_corte' && (
            <div className="space-y-6"><Table headers={['Animal', 'Lote', 'Peso']}>{gadoDeCorte.map(a => (<tr key={a.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-black">{a.brinco} <span className="text-xs text-gray-500 font-medium">{a.raca}</span></td><td className="px-5 py-4 font-bold text-sm">{a.lote}</td><td className="px-5 py-4 text-right font-black">{a.peso} kg</td></tr>))}</Table></div>
          )}

          {currentView === 'leite' && (
            <div className="space-y-6">
              <div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><Droplets className="mr-3 text-cyan-500"/> Leite</h3><button onClick={()=>openModal('leite')} className="bg-cyan-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Ordenha</button></div>
              <div className="grid grid-cols-2 gap-4"><div className="bg-white border p-6 rounded-3xl text-center shadow-sm"><h3 className="text-4xl font-black">{totalLeiteMes} <span className="text-gray-400 text-xl">L</span></h3><p className="text-xs font-bold text-gray-400 uppercase mt-2">Neste Mês</p></div><div className="bg-white border p-6 rounded-3xl text-center shadow-sm"><h3 className="text-4xl font-black">{mediaLitrosVaca} <span className="text-gray-400 text-xl">L/dia</span></h3><p className="text-xs font-bold text-gray-400 uppercase mt-2">Média Diária</p></div></div>
              <Table headers={['Data/Turno', 'Matriz', 'Volume', 'Ações']}>{cLeite.map(l => (<tr key={l.id} className="hover:bg-cyan-50/50"><td className="px-5 py-4"><span className="font-black block">{l.data}</span><span className="text-xs font-bold text-gray-500">{l.turno}</span></td><td className="px-5 py-4 font-bold"><span className="bg-gray-100 px-3 py-1.5 rounded-lg">{l.brincoMatriz==='TODAS'?'Rebanho (Total)':`Vaca ${l.brincoMatriz}`}</span></td><td className="px-5 py-4 text-right font-black text-cyan-600 text-lg">{l.litros} L</td><td className="px-5 py-4 text-right"><button onClick={()=>openModal('leite', l)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('producaoLeite', l.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}</Table>
            </div>
          )}

          {currentView === 'pastagens' && (
            <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><LayoutGrid className="mr-3 text-green-600"/> Lotes</h3><button onClick={()=>openModal('lote')} className="bg-green-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Novo Lote</button></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">{cLotes.map(l => { const an = cAnimais.filter(a => a.lote === l.nome).length; const oc = Math.round((an/l.capacidade)*100)||0; return (<div key={l.id} className="bg-white p-6 rounded-3xl border shadow-sm"><div className="flex justify-between mb-4"><h4 className="font-black text-lg truncate pr-2">{l.nome}</h4><div className="flex shrink-0 gap-1"><button onClick={()=>openModal('lote', l)} className="text-blue-500"><Edit size={16}/></button><button onClick={()=>handleDel('lotes', l.id)} className="text-red-500"><Trash2 size={16}/></button></div></div><div className="flex justify-between items-end mb-2"><span className="text-3xl font-black">{an}</span><span className="text-xs font-bold text-gray-400">/ {l.capacidade}</span></div><div className="w-full bg-gray-100 h-2 rounded-full"><div className={`h-full ${oc>90?'bg-red-500':'bg-green-500'}`} style={{width:`${Math.min(oc,100)}%`}}></div></div></div>) })}</div>
            </div>
          )}

          {currentView === 'reproducao' && (
            <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><HeartPulse className="mr-3 text-pink-600"/> Reprodução</h3><button onClick={()=>openModal('reproducao')} className="bg-pink-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Inseminar</button></div>
              <Table headers={['Matriz', 'Método/Data', 'Prev. Parto', 'Status', 'Ações']}>{cRep.map(r => (<tr key={r.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-black">{r.brincoVaca}</td><td className="px-5 py-4"><span className="block font-bold">{r.dataInseminacao}</span><span className="text-xs text-gray-500">{r.metodo} - {r.reprodutor}</span></td><td className="px-5 py-4 font-bold">{r.previsaoParto||'-'}</td><td className="px-5 py-4 text-right"><span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${r.status==='Prenhe'?'bg-green-100 text-green-700':r.status==='Aguardando DG'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{r.status}</span></td><td className="px-5 py-4 text-right"><button onClick={()=>openModal('reproducao', r)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('reproducao', r.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}</Table>
            </div>
          )}

          {currentView === 'nascimentos' && (
            <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><Baby className="mr-3 text-blue-500"/> Nascimentos</h3><button onClick={()=>openModal('nascimento')} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Parto</button></div>
              <Table headers={['Data', 'Matriz > Cria', 'Sexo', 'Peso', 'Ações']}>{cNasc.map(n => (<tr key={n.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-bold text-sm">{n.data}</td><td className="px-5 py-4"><span className="block font-black">M: {n.brincoMatriz}</span><span className="text-xs font-bold text-blue-600">B: {n.brincoBezerro}</span></td><td className="px-5 py-4 font-bold text-sm">{n.sexo}</td><td className="px-5 py-4 text-right font-black">{n.pesoNascimento} kg</td><td className="px-5 py-4 text-right"><button onClick={()=>openModal('nascimento', n)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('nascimentos', n.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}</Table>
            </div>
          )}

          {currentView === 'pesagens' && (
            <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><Scale className="mr-3 text-orange-500"/> Pesagens</h3><button onClick={()=>openModal('pesagem')} className="bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Pesagem</button></div>
              <Table headers={['Brinco', 'Anterior', 'Atual', 'Evolução', 'Ações']}>{cPesagens.map(p => { const df = (p.pesoAtual||0)-(p.pesoAnterior||0); return (<tr key={p.id} className="hover:bg-gray-50"><td className="px-5 py-4"><span className="block font-black">{p.brinco}</span><span className="text-xs text-gray-500 font-bold">{p.data}</span></td><td className="px-5 py-4 text-right font-bold text-gray-500">{p.pesoAnterior} kg</td><td className="px-5 py-4 text-right font-black text-lg">{p.pesoAtual} kg</td><td className={`px-5 py-4 text-right font-black ${df>=0?'text-green-600':'text-red-600'}`}>{df>0?'+':''}{df} kg</td><td className="px-5 py-4 text-right"><button onClick={()=>openModal('pesagem', p)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('pesagens', p.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>); })}</Table>
            </div>
          )}

          {currentView === 'sanidade' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center"><div className="bg-white border rounded-xl p-1 flex"><button onClick={()=>setSanidadeTab('registos')} className={`px-5 py-2 text-sm font-bold rounded-lg ${sanidadeTab==='registos'?'bg-red-50 text-red-700 shadow-sm':'text-gray-500'}`}>Histórico</button><button onClick={()=>setSanidadeTab('calendario')} className={`px-5 py-2 text-sm font-bold rounded-lg ${sanidadeTab==='calendario'?'bg-red-50 text-red-700 shadow-sm':'text-gray-500'}`}>Plano Anual</button></div><button onClick={()=>openModal(sanidadeTab==='registos'?'vacina':'calendario')} className="bg-red-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Adicionar</button></div>
              {sanidadeTab==='registos' ? 
                <Table headers={['Vacina/Lote', 'Carência/Liberação', 'Ações']}>{cVac.map(v => (<tr key={v.id} className="hover:bg-gray-50"><td className="px-5 py-4"><span className="font-black block text-sm">{v.vacina}</span><span className="text-xs font-bold text-gray-500">Lote: {v.lote}</span></td><td className="px-5 py-4 text-right font-bold text-sm"><span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-xs">{v.dataLiberacao||'Sem carência'}</span></td><td className="px-5 py-4 text-right"><button onClick={()=>openModal('vacina', v)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('vacinacoes', v.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}</Table>
                : 
                <Table headers={['Mês - Campanha', 'Público / Status', 'Ações']}>{cCal.sort((a,b)=>["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].indexOf(a.mes)-["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].indexOf(b.mes)).map(c => (<tr key={c.id} className="hover:bg-gray-50"><td className="px-5 py-4"><span className="font-black block text-red-600">{c.mes}</span><span className="font-bold text-sm">{c.doenca}</span></td><td className="px-5 py-4"><span className="block text-sm font-medium text-gray-700">{c.publico}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${c.obrigatorio?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{c.obrigatorio?'Obrigatório':'Recomendado'}</span></td><td className="px-5 py-4 text-right"><button onClick={()=>openModal('calendario', c)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('calendarioSanitario', c.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}</Table>
              }
            </div>
          )}

          {currentView === 'financeiro' && (
            <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><DollarSign className="mr-3 text-green-600"/> Financeiro</h3><button onClick={()=>openModal('financeiro')} className="bg-green-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Lançar</button></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><div className="bg-white border p-6 rounded-2xl shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase">Receitas</p><p className="text-2xl font-black text-green-600">{formatCurrency(finStats.r)}</p></div><div className="bg-white border p-6 rounded-2xl shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase">Despesas</p><p className="text-2xl font-black text-red-600">{formatCurrency(finStats.d)}</p></div><div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg"><p className="text-xs font-bold text-slate-400 uppercase">Saldo</p><p className={`text-2xl font-black ${saldoAtual>=0?'text-white':'text-red-400'}`}>{formatCurrency(saldoAtual)}</p></div></div>
              <Table headers={['Data/Descrição', 'Cat', 'Valor', 'Ações']}>{cFin.map(f => (<tr key={f.id} className="hover:bg-gray-50"><td className="px-5 py-4"><span className="block font-black text-sm">{f.descricao}</span><span className="text-xs font-bold text-gray-500">{f.data}</span></td><td className="px-5 py-4 font-bold text-sm">{f.categoria}</td><td className={`px-5 py-4 text-right font-black ${f.tipo==='receita'?'text-green-600':'text-red-600'}`}>{f.tipo==='receita'?'+':'-'}{formatCurrency(f.valor)}</td><td className="px-5 py-4 text-right"><button onClick={()=>openModal('financeiro', f)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('financeiro', f.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}</Table>
            </div>
          )}

          {currentView === 'insumos' && (
            <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><Archive className="mr-3 text-purple-600"/> Insumos</h3><button onClick={()=>openModal('insumo')} className="bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Produto</button></div>
              <Table headers={['Produto', 'Qtd', 'Ações']}>{cInsumos.map(i => (<tr key={i.id} className="hover:bg-purple-50/50"><td className="px-5 py-4"><span className="block font-black text-sm">{i.nome}</span><span className="text-xs font-bold text-gray-500">{i.categoria}</span></td><td className="px-5 py-4 text-right"><span className="block font-black">{i.quantidade} {i.unidade}</span>{i.quantidade<=i.estoqueMinimo && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">Crítico</span>}</td><td className="px-5 py-4 text-right"><button onClick={()=>{setConsumoItem(i);setModalType('consumo');}} className="text-orange-500 font-bold text-xs bg-orange-50 px-3 py-1.5 rounded-lg mr-2"><MinusCircle size={14} className="inline mr-1"/> Consumo</button><button onClick={()=>openModal('insumo', i)} className="text-blue-500 p-2"><Edit size={18}/></button><button onClick={()=>handleDel('insumos', i.id)} className="text-red-500 p-2"><Trash2 size={18}/></button></td></tr>))}</Table>
            </div>
          )}

          {currentView === 'anotacoes' && (
            <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><NotebookPen className="mr-3 text-amber-600"/> Anotações</h3><button onClick={()=>openModal('anotacao')} className="bg-amber-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Nota</button></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">{cAnot.map(n => (<div key={n.id} className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col transition-all ${n.status==='resolvido'?'opacity-60':''}`}><div className="flex justify-between items-start mb-2"><h4 className={`font-black flex-1 pr-2 ${n.status==='resolvido'?'line-through':''}`}>{n.titulo}</h4><button onClick={()=>handleDel('anotacoes', n.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div><p className="text-sm text-gray-600 flex-1 whitespace-pre-wrap mt-2 mb-4">{n.texto}</p><button onClick={()=>{updateApp(p=>({...p,anotacoes:p.anotacoes.map(a=>a.id===n.id?{...a,status:a.status==='resolvido'?'aberto':'resolvido'}:a)}))}} className="w-full py-2.5 font-bold rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">{n.status==='resolvido'?'Reabrir':'Marcar Resolvido'}</button></div>))}</div>
            </div>
          )}

          {currentView === 'propriedades' && (
             <div className="space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black flex items-center"><MapPin className="mr-3 text-blue-500"/> Fazendas</h3><button onClick={()=>openModal('propriedade')} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center"><Plus size={18} className="mr-2"/> Fazenda</button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{appData.propriedades.map((p) => (<div key={p.id} className={`bg-white p-6 rounded-3xl border shadow-sm ${activePropriedadeId === p.id ? 'ring-2 ring-green-500' : ''}`}><div className="flex justify-between"><h4 className="font-black text-2xl">{p.nome}</h4><button onClick={()=>openModal('propriedade', p)} className="text-blue-500 p-2"><Edit size={18}/></button></div><p className="text-sm font-bold text-gray-500 mt-2">{p.cidade} - {p.estado}</p><button onClick={() => setActivePropriedadeId(p.id)} disabled={activePropriedadeId === p.id} className={`w-full py-3 mt-6 rounded-xl font-bold transition-all ${activePropriedadeId === p.id ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white'}`}>{activePropriedadeId === p.id ? 'Em Uso' : 'Entrar'}</button></div>))}</div></div>
          )}

      {currentView === 'configuracoes' && (
        <div className="space-y-6">
          {/* Cabecalho */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Settings className="text-green-600" size={28}/>
              Configuracoes do Sistema
            </h2>
          </div>

          {/* Dados da Fazenda */}
          <div className="bg-white rounded-3xl border p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dados da Fazenda</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Fazenda</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="Ex: Fazenda Boa Vista"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proprietario</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nome do proprietario"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localizacao</label>
                <input
                  type="text"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  placeholder="Cidade / Estado"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Chave API Gemini */}
          <div className="bg-white rounded-3xl border p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Assistente IA (Gemini)</h3>
            <p className="text-sm text-gray-500 mb-4">Insira sua chave de API do Google Gemini para ativar o assistente de IA.</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Cole sua chave API aqui (AIza...)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => { localStorage.setItem('bovigest_ai_key', geminiApiKey); alert('Chave salva!'); }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2"
              >
                <Save size={18}/> Salvar
              </button>
            </div>
            {geminiApiKey ? (
              <p className="mt-3 text-green-400 text-sm flex items-center gap-1">
                <CheckCircle2 size={16}/> Chave configurada. Assistente IA ativo.
              </p>
            ) : null}
          </div>

          {/* Versao */}
          <div className="bg-white rounded-3xl border p-8 text-center shadow-sm">
            <Tractor size={48} className="mx-auto text-green-600 mb-4" />
            <h3 className="font-black text-xl text-gray-900">BoviGest PRO</h3>
            <p className="text-gray-500 mt-1">Versao 1.0 - Gestao Pecuaria Inteligente</p>
            <p className="text-gray-400 text-sm mt-2">Desenvolvido para pecuaristas modernos</p>
          </div>
        </div>
      )}
          {currentView === 'ai-assistant' && (
            <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b bg-slate-900 text-white flex items-center"><Bot size={28} className="mr-3 text-green-400" /><div><h2 className="font-extrabold text-xl">Consultor IA</h2><p className="text-slate-400 text-xs mt-1 font-medium">BoviGest PRO</p></div></div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">{chatMessages.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none'} whitespace-pre-wrap font-medium leading-relaxed`}>{msg.text}</div></div>))}{isChatLoading && <div className="flex justify-start"><div className="bg-white border rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"></div><div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce delay-75"></div><div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce delay-150"></div></div></div>}</div>
              <div className="p-4 bg-white border-t"><form onSubmit={handleSendMessage} className="relative flex items-center"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Pergunte-me algo sobre a fazenda..." className="w-full pl-6 pr-14 py-4 bg-gray-50 border rounded-full outline-none focus:ring-2 focus:ring-green-500 font-medium shadow-inner" disabled={isChatLoading} /><button type="submit" disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 shadow-md"><Send size={18}/></button></form></div>
            </div>
        )}
        </div>
      </main>

      {/* --- MODAIS DE DETALHES --- */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <div className={`bg-gradient-to-r ${isEmCarencia(selectedAnimal.lote) ? 'from-red-700 to-red-600' : 'from-slate-800 to-slate-700'} p-8 flex justify-between items-start text-white shrink-0`}>
              <div><h2 className="text-4xl font-black mb-1">{selectedAnimal.nome !== '-' ? selectedAnimal.nome : `Bovino #${selectedAnimal.brinco}`}</h2><p className="text-white/80 font-bold text-lg">Brinco: {selectedAnimal.brinco} • {selectedAnimal.raca} • {selectedAnimal.categoria}</p>{isEmCarencia(selectedAnimal.lote) && (<div className="mt-4 bg-white/20 inline-flex items-center px-4 py-2 rounded-xl backdrop-blur-md"><ShieldAlert size={20} className="mr-2 text-white" /><span className="font-bold text-white">Animal em Carência até {isEmCarencia(selectedAnimal.lote).dataLiberacao.split('-').reverse().join('/')}</span></div>)}</div>
              <button onClick={() => setSelectedAnimal(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto bg-slate-50 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase">Peso Atual</p><p className="text-3xl font-black mt-1">{selectedAnimal.peso} <span className="text-base text-gray-400">kg</span></p></div><div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase">Lote</p><p className="text-xl font-black mt-2 truncate">{selectedAnimal.lote}</p></div><div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase">Idade Aprox.</p><p className="text-xl font-black mt-2 truncate">{Math.floor((new Date() - new Date(selectedAnimal.dataNasc)) / (1000*60*60*24*30))} m</p></div><div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase">GMD</p><p className="text-xl font-black mt-2 truncate">{getGPD(selectedAnimal.brinco) || '-'} <span className="text-sm text-gray-400">kg/d</span></p></div></div>
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><div className="px-5 py-3 bg-gray-50 border-b flex items-center gap-2"><MessageSquare size={15} className="text-green-600" /><span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Observações</span></div><div className="p-4"><textarea rows={3} defaultValue={selectedAnimal.obs||""} onBlur={(e)=>{const obs=e.target.value;updateApp(p=>({...p,animais:p.animais.map(a=>a.id===selectedAnimal.id?{...a,obs}:a)}));setSelectedAnimal(prev=>({...prev,obs}));setSaveSuccess(true);setTimeout(()=>setSaveSuccess(false),3000);}} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 resize-none font-medium text-sm" placeholder="Anotações sobre este animal..."/></div></div>
            </div>
            <div className="p-6 border-t bg-white flex justify-between shrink-0"><button onClick={() => handleDel('animais', selectedAnimal.id)} className="bg-red-50 text-red-600 px-6 py-4 rounded-xl font-bold flex items-center"><Trash2 size={18} className="mr-2"/> Eliminar</button><button onClick={() => { openModal('animal', selectedAnimal); setSelectedAnimal(null); }} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center shadow-lg"><Edit size={18} className="mr-3"/> Editar Ficha</button></div>
          </div>
        </div>
      )}

      {/* --- MODAIS DE FORMULÁRIO (COMPONENTIZADOS) --- */}
      {modalType === 'animal' && (
        <Modal title={editingItem ? 'Editar Animal' : 'Novo Animal'} icon={Beef} formId="f_ani" onClose={closeModal} onSubmit={handleSaveForm} wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Brinco" name="brinco" req def={editingItem?.brinco}/>
            <Input label="Nome (Opcional)" name="nome" def={editingItem?.nome!=='-'?editingItem?.nome:''}/>
            <Input label="Peso Atual (kg)" name="peso" type="number" req def={editingItem?.peso}/>
            <Select label="Lote Destino" name="lote" def={editingItem?.lote} options={[{val:'', lbl:'Sem Lote'}, ...cLotes.map(l=>({val:l.nome, lbl:l.nome}))]}/>
            <Select label="Aptidão/Tipo" name="tipo" def={editingItem?.tipo||'Corte'} options={['Corte', 'Leite']} />
            <Select label="Sexo" name="sexo" def={editingItem?.sexo||'F'} options={[{val:'F',lbl:'Fêmea'}, {val:'M',lbl:'Macho'}]} />
            <Select label="Categoria" name="categoria" def={editingItem?.categoria||'Bezerro(a)'} options={['Bezerro(a)', 'Novilha', 'Garrote', 'Vaca', 'Boi Gordo', 'Touro']} />
            <Input label="Raça" name="raca" req def={editingItem?.raca||'Nelore'}/>
            <div className="sm:col-span-2"><Input label="Data Nasc." name="dataNasc" type="date" req def={editingItem?.dataNasc||today} /></div>
          </div>
        </Modal>
      )}

      {modalType === 'batch' && (
        <Modal title="Cadastrar Animais em Lote" icon={ListPlus} formId="f_batch" onClose={closeModal} onSubmit={handleSaveForm} wide submitText="Gerar Lote">
          <div className="grid grid-cols-3 gap-4 mb-2">
            <Input label="Prefixo" name="prefixo" placeholder="NEL-" />
            <Input label="Início" name="inicio" type="number" req def="1" />
            <Input label="Qtd" name="quantidade" type="number" req def="10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Raça Base" name="raca" req def="Nelore"/>
            <Input label="Peso Base (kg)" name="peso" type="number" req def="200"/>
            <Select label="Lote Destino" name="lote" options={[{val:'', lbl:'Sem Lote'}, ...cLotes.map(l=>({val:l.nome, lbl:l.nome}))]}/>
            <Select label="Categoria Geral" name="categoria" options={['Bezerros(as)', 'Novilhas', 'Garrotes', 'Vacas', 'Touros', 'Bois Gordos']} def="Bezerros(as)"/>
            <input type="hidden" name="sexo" value="F"/><input type="hidden" name="tipo" value="Corte"/><input type="hidden" name="dataNasc" value={today}/>
          </div>
        </Modal>
      )}

      {modalType === 'lote' && (
        <Modal title={editingItem ? 'Editar Lote' : 'Novo Lote/Pasto'} icon={LayoutGrid} formId="f_lote" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Nome do Lote" name="nome" req def={editingItem?.nome} />
          <div className="grid grid-cols-2 gap-4"><Input label="Capacidade Máx" name="capacidade" type="number" req def={editingItem?.capacidade} /><Select label="Tipo" name="tipo" def={editingItem?.tipo||'Pasto'} options={['Pasto', 'Baia']}/></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Observações</label><textarea name="obs" rows={2} defaultValue={editingItem?.obs||''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 resize-none font-medium text-sm"></textarea></div>
        </Modal>
      )}

      {modalType === 'pesagem' && (
        <Modal title={editingItem ? 'Editar Pesagem' : 'Nova Pesagem'} icon={Scale} formId="f_pes" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Brinco do Animal" name="brinco" req def={editingItem?.brinco}/>
          <Input label="Peso Atual na Balança (kg)" name="pesoAtual" type="number" step="0.1" req def={editingItem?.pesoAtual}/>
          <Input label="Data da Pesagem" name="data" type="date" req def={editingItem?.data||today}/>
        </Modal>
      )}

      {modalType === 'reproducao' && (
        <Modal title={editingItem ? 'Editar Inseminação' : 'Registo Reprodutivo'} icon={HeartPulse} formId="f_rep" onClose={closeModal} onSubmit={handleSaveForm}>
          <Select label="Matriz" name="brincoVaca" req options={[{val:'', lbl:'Selecione...'}, ...femeasArray.map(a=>({val:a.brinco, lbl:`Vaca ${a.brinco}`}))]} def={editingItem?.brincoVaca}/>
          <Input label="Identificação do Sêmen/Touro" name="reprodutor" req def={editingItem?.reprodutor}/>
          <div className="grid grid-cols-2 gap-4"><Input label="Data Protocolo" name="dataProtocolo" type="date" def={editingItem?.dataProtocolo}/><Input label="Data IA/Monta" name="dataInseminacao" type="date" req def={editingItem?.dataInseminacao||today}/></div>
          <div className="grid grid-cols-2 gap-4"><Select label="Método" name="metodo" def={editingItem?.metodo||'IA'} options={['IA', 'IATF', 'TE', 'Monta Natural']}/><Select label="Status (DG)" name="status" def={editingItem?.status||'Aguardando DG'} options={['Aguardando DG', 'Prenhe', 'Vazia', 'Aborto']}/></div>
        </Modal>
      )}

      {modalType === 'nascimento' && (
        <Modal title="Registo de Parto" icon={Baby} formId="f_nasc" onClose={closeModal} onSubmit={handleSaveForm} submitText="Registar Parto">
          <div className="grid grid-cols-2 gap-4"><Select label="Matriz" name="brincoMatriz" req options={[{val:'', lbl:'Selecionar...'}, ...femeasArray.map(a=>({val:a.brinco, lbl:a.brinco}))]} /><Input label="Novo Brinco (Cria)" name="brincoBezerro" req /></div>
          <div className="grid grid-cols-3 gap-4"><Select label="Sexo" name="sexo" options={[{val:'M',lbl:'Macho'},{val:'F',lbl:'Fêmea'}]} /><Input label="Peso" name="pesoNascimento" type="number" req def="35"/><Input label="Data" name="data" type="date" req def={today}/></div>
          <Input label="Raça Predominante" name="raca" req def="Nelore" />
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Observações (Opcional)</label><input name="obs" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" /></div>
        </Modal>
      )}

      {modalType === 'leite' && (
        <Modal title={editingItem ? 'Editar Ordenha' : 'Nova Ordenha'} icon={Droplets} formId="f_leite" onClose={closeModal} onSubmit={handleSaveForm}>
          <Select label="Vaca Lactante" name="brincoMatriz" req options={[{val:'', lbl:'Selecione...'}, {val:'TODAS', lbl:'Total Diário (Lançamento Único)'}, ...femeasArray.map(a=>({val:a.brinco, lbl:`Vaca ${a.brinco}`}))]} def={editingItem?.brincoMatriz}/>
          <div className="grid grid-cols-2 gap-4"><Input label="Litros" name="litros" type="number" step="0.1" req def={editingItem?.litros}/><Select label="Turno" name="turno" def={editingItem?.turno||'Manhã'} options={['Manhã', 'Tarde', 'Noite']}/></div>
          <Input label="Data" name="data" type="date" req def={editingItem?.data||today}/>
        </Modal>
      )}

      {modalType === 'vacina' && (
        <Modal title={editingItem ? 'Editar Tratamento' : 'Sanidade Lote'} icon={ShieldAlert} formId="f_vac" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Medicamento / Vacina" name="vacina" req def={editingItem?.vacina}/>
          <div className="grid grid-cols-2 gap-4"><Select label="Lote Alvo" name="lote" def={editingItem?.lote||'Todo o Rebanho'} options={[{val:'Todo o Rebanho', lbl:'Rebanho Todo'}, ...cLotes.map(l=>({val:l.nome, lbl:l.nome}))]}/><Input label="Cabeças" name="qtdAnimais" type="number" req def={editingItem?.qtdAnimais||1}/></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Data Aplicação" name="dataAplicacao" type="date" req def={editingItem?.dataAplicacao||today}/><Input label="Carência Leite/Corte (Dias)" name="carenciaDias" type="number" req def={editingItem?.carenciaDias||0}/></div>
        </Modal>
      )}

      {modalType === 'calendario' && (
        <Modal title={editingItem ? 'Editar Evento' : 'Agendar Evento Anual'} icon={CalendarDays} formId="f_cal" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Campanha ou Doença" name="doenca" req def={editingItem?.doenca}/>
          <Select label="Mês Anual" name="mes" def={editingItem?.mes||'Janeiro'} options={['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro','Qualquer']} />
          <Input label="Público Alvo (Ex: Bezerros)" name="publico" req def={editingItem?.publico}/>
          <Select label="Obrigatório (IDARON)?" name="obrigatorio" def={editingItem ? String(editingItem.obrigatorio) : 'true'} options={[{val:'true', lbl:'Sim (Oficial)'}, {val:'false', lbl:'Não (Maneio)'}]} />
        </Modal>
      )}

      {modalType === 'insumo' && (
        <Modal title={editingItem ? 'Editar Insumo' : 'Novo Insumo'} icon={Archive} formId="f_ins" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Produto" name="nome" req def={editingItem?.nome}/>
          <div className="grid grid-cols-2 gap-4"><Input label="Categoria" name="categoria" req def={editingItem?.categoria||'Nutrição'}/><Input label="Unidade (kg, L)" name="unidade" req def={editingItem?.unidade}/></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Qtd Entrada" name="quantidade" type="number" step="0.1" req def={editingItem?.quantidade}/><Input label="Alerta de Mínimo" name="estoqueMinimo" type="number" step="0.1" req def={editingItem?.estoqueMinimo||10}/></div>
        </Modal>
      )}

      {modalType === 'consumo' && consumoItem && (
        <Modal title="Lançar Consumo" icon={MinusCircle} formId="f_cons" onClose={closeModal} onSubmit={handleSaveForm} submitText="Consumir">
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-4"><p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Stock Atual</p><p className="text-2xl font-black text-orange-900">{consumoItem.quantidade} <span className="text-sm font-bold text-orange-700">{consumoItem.unidade}</span></p><p className="text-sm font-bold text-gray-700 mt-1">{consumoItem.nome}</p></div>
          <Input label={`Retirar do Estoque (${consumoItem.unidade})`} name="quantidadeConsumo" type="number" step="0.1" req max={consumoItem.quantidade} autoFocus />
        </Modal>
      )}

      {modalType === 'financeiro' && (
        <Modal title={editingItem ? 'Editar Lançamento' : 'Lançamento Financeiro'} icon={DollarSign} formId="f_fin" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Descrição" name="descricao" req def={editingItem?.descricao}/>
          <div className="grid grid-cols-2 gap-4"><Select label="Fluxo" name="tipo" def={editingItem?.tipo||'receita'} options={[{val:'receita', lbl:'Receita (+)'}, {val:'despesa', lbl:'Despesa (-)'}]}/><Input label="Valor (R$)" name="valor" type="number" step="0.01" req def={editingItem?.valor}/></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Data" name="data" type="date" req def={editingItem?.data||today}/><Input label="Categoria" name="categoria" req def={editingItem?.categoria||'Geral'}/></div>
        </Modal>
      )}

      {modalType === 'anotacao' && (
        <Modal title="Nova Anotação" icon={NotebookPen} formId="f_ano" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Título" name="titulo" req />
          <Input label="Tag (Opcional)" name="tag" placeholder="Ex: Urgente, Nutrição..." />
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Descrição *</label><textarea required name="texto" rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm resize-none"></textarea></div>
        </Modal>
      )}

      {modalType === 'propriedade' && (
        <Modal title={editingItem ? 'Editar Fazenda' : 'Nova Fazenda'} icon={MapPin} formId="f_prop" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Nome Comercial" name="nome" req def={editingItem?.nome}/>
          <Input label="Responsável Legal" name="responsavel" req def={editingItem?.responsavel}/>
          <div className="grid grid-cols-2 gap-4"><Input label="Município" name="cidade" req def={editingItem?.cidade||'Rondonópolis'}/><Input label="UF" name="estado" maxLength={2} req def={editingItem?.estado||'MT'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold uppercase text-center" /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Área Total (Hectares)" name="area_ha" type="number" req def={editingItem?.area_ha}/><Input label="Inscrição Estadual" name="ie" def={editingItem?.ie}/></div>
        </Modal>
      )}

      {modalType === 'usuario' && (
        <Modal title={editingItem ? 'Editar Operador' : 'Novo Convite'} icon={Users} formId="f_usr" onClose={closeModal} onSubmit={handleSaveForm}>
          <Input label="Nome Completo" name="nome" req def={editingItem?.nome}/>
          <Input label="Email de Login" name="email" type="email" req def={editingItem?.email}/>
          <Input label="Senha de Acesso" name="senha" req def={editingItem?.senha} placeholder="Defina uma senha..." />
          <Select label="Nível de Permissão" name="role" def={editingItem?.role||'Operador'} options={['Operador', 'Admin']} />
        </Modal>
      )}

      {emailModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center animate-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={32} /></div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Conta Criada!</h2><p className="text-gray-500 font-medium mb-6 text-sm">Envie o acesso para o operador.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left mb-6 space-y-3"><p className="text-sm"><span className="font-bold text-gray-400 uppercase">Login:</span> <span className="font-bold text-indigo-600 block">{emailModalData.email}</span></p><p className="text-sm"><span className="font-bold text-gray-400 uppercase">Senha:</span> <code className="bg-white border border-gray-200 px-2 py-1 rounded-lg font-mono text-gray-900 block mt-1">{emailModalData.senha}</code></p></div>
            <div className="flex gap-3"><button onClick={() => setEmailModalData(null)} className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-700">Fechar</button><button onClick={() => {window.location.href = `mailto:${emailModalData.email}?subject=${encodeURIComponent("Acesso - BoviGest PRO")}&body=${encodeURIComponent(`Login: ${emailModalData.email}\nSenha: ${emailModalData.senha}\nLink: https://bovigest-online.vercel.app/`)}`; setEmailModalData(null);}} className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-indigo-600 text-white flex items-center justify-center"><Mail size={18} className="mr-2" /> Enviar Email</button></div>
          </div>
        </div>
      )}

    </div>
  );
}
