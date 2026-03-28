// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Beef, Activity, LogOut, Bell, Search,
  Plus, MapPin, DollarSign, HeartPulse, LayoutGrid, X, Trash2,
  Edit, Baby, LayoutDashboard, Scale, Settings,
  Sparkles, Bot, Send, Loader2, CheckCircle2, Download,
  Archive, Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert,
  Wheat, Calculator, Users, CalendarDays, KeyRound, FileSpreadsheet, Mail
} from 'lucide-react';

// --- BASE DE DADOS INICIAL ---
const defaultData = {
  propriedades: [
    { id: 1, nome: "Fazenda São João", responsavel: "Victor Luiz Gasparini", cidade: "Jaru", estado: "RO", area_ha: 350, ie: "123.456.789-00" }
  ],
  usuarios: [
    { id: 1, nome: "Victor Luiz Gasparini", email: "victorluizgasparini@gmail.com", senha: "Lu1z1502#", role: "Admin", status: "Ativo" },     { id: 2, nome: "Lucas Winter", email: "lucasff99@hotmail.com", senha: "123456", role: "Operador", status: "Ativo" },     { id: 3, nome: "Vivtor", email: "victorluizgasparini@hotmail.com", senha: "22023342", role: "Operador", status: "Ativo" }
  ],
  calendarioSanitario: [

    { id: 1, propriedadeId: 1, doenca: "Brucelose", mes: "1º Semestre", publico: "Fêmeas de 3 a 8 meses", obrigatorio: true },
    { id: 2, propriedadeId: 1, doenca: "Raiva", mes: "Maio", publico: "Todo o rebanho", obrigatorio: true },
    { id: 3, propriedadeId: 1, doenca: "Clostridioses", mes: "Novembro", publico: "Todo o rebanho (Reforço)", obrigatorio: false },
    { id: 4, propriedadeId: 1, doenca: "Febre Aftosa", mes: "N/A", publico: "RO Livre sem vacinação", obrigatorio: false }
  ],
  lotes: [
    { id: 1, propriedadeId: 1, nome: "Matrizes A", capacidade: 50, tipo: "Pasto", obs: "Pasto Central" },
    { id: 2, propriedadeId: 1, nome: "Confinamento 1", capacidade: 100, tipo: "Baia", obs: "Terminação" },
  ],
  animais: [
    { id: 1, propriedadeId: 1, brinco: "001", nome: "Mimosa", sexo: "F", categoria: "Vaca", tipo: "Cria", raca: "Nelore", dataNasc: "2020-03-15", peso: 420, ativo: true, lote: "Matrizes A", obs: "Matriz principal." },
    { id: 2, propriedadeId: 1, brinco: "105", nome: "Soberano", sexo: "M", categoria: "Boi Gordo", tipo: "Corte", raca: "Angus", dataNasc: "2024-01-10", peso: 490, ativo: true, lote: "Confinamento 1", obs: "Fase de terminação." },
  ],
  pesagens: [
    { id: 1, propriedadeId: 1, brinco: "105", data: "2025-11-10", pesoAnterior: 400, pesoAtual: 450, obs: "Entrada seca" },
  ],
  reproducao: [
    { id: 1, propriedadeId: 1, brincoVaca: "001", dataInseminacao: "2025-06-10", previsaoParto: "2026-03-15", metodo: "IA", reprodutor: "Nelore PO", status: "Prenhe" },
  ],
  nascimentos: [],
  vacinacoes: [
    { id: 1, propriedadeId: 1, vacina: "Ivermectina 1%", lote: "Confinamento 1", dataAplicacao: "2026-03-10", proximaDose: null, qtdAnimais: 80, obs: "Controlo parasitário", carenciaDias: 35, dataLiberacao: "2026-04-14", status: "concluida" },
  ],
  insumos: [
    { id: 1, propriedadeId: 1, nome: "Sal Mineral 80", categoria: "Nutrição", quantidade: 50, unidade: "kg", estoqueMinimo: 100 },
  ],
  financeiro: [
    { id: 1, propriedadeId: 1, descricao: "Venda lote engorda", categoria: "Venda de Gado", tipo: "receita", valor: 68000, data: "2026-02-18", status: "pago" },
  ],
  bibliotecaAlimentos: [
    { id: 1, nome: "Silagem de Milho", ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: "Milho Grão Moído", ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 },
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

const callGemini = async (prompt, systemInstruction, userApiKey, endpointUrl, modelName) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
    });
    if (!response.ok) {
      return `❌ Erro de Ligação IA (Status ${response.status}). Verifique se a sua Chave API está correta e se o modelo "llama-3.3-70b-versatile" está disponível.`;
    }
    const result = await response.json();
    return result.text || 'Sem resposta do modelo.';
  } catch (error) {
    return `❌ Erro de Comunicação: ${error.message}`;
  }
};

export default function App() {
  // --- AUTENTICAÇÃO E NAVEGAÇÃO ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Abas Internas e Múltiplas Propriedades
  const [sanidadeTab, setSanidadeTab] = useState('registos');
  const [activePropriedadeId, setActivePropriedadeId] = useState(1);

  // Configurações Pessoais IA
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('bovigest_gemini_api_key') || '');
  const [aiEndpoint, setAiEndpoint] = useState(() => localStorage.getItem('bovigest_ai_endpoint') || 'https://generativelanguage.googleapis.com/v1beta/models');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('bovigest_ai_model') || 'gemini-2.5-flash-preview-09-2025');

  // Modais de Estado
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [isBatchAnimalFormOpen, setIsBatchAnimalFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [isFinanceFormOpen, setIsFinanceFormOpen] = useState(false);
  const [isVaccineFormOpen, setIsVaccineFormOpen] = useState(false);
  const [isLoteFormOpen, setIsLoteFormOpen] = useState(false);
  const [isReproducaoFormOpen, setIsReproducaoFormOpen] = useState(false);
  const [isPesagemFormOpen, setIsPesagemFormOpen] = useState(false);
  const [isNascimentoFormOpen, setIsNascimentoFormOpen] = useState(false);
  const [isInsumoFormOpen, setIsInsumoFormOpen] = useState(false);
  const [isPropriedadeFormOpen, setIsPropriedadeFormOpen] = useState(false);
    const [editingReproducao, setEditingReproducao] = useState(null);
  const [isUsuarioFormOpen, setIsUsuarioFormOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [isCalendarioFormOpen, setIsCalendarioFormOpen] = useState(false);

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
    const [emailModalData, setEmailModalData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- PERSISTÊNCIA ---
  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('bovigest_data_pro_master');
    if (saved) {
      try { return { ...defaultData, ...JSON.parse(saved) }; } catch (e) { return defaultData; }
    }
    return defaultData;
  });

  useEffect(() => { localStorage.setItem('bovigest_data_pro_master', JSON.stringify(appData)); }, [appData]);
  useEffect(() => { localStorage.setItem('bovigest_gemini_api_key', geminiApiKey); }, [geminiApiKey]);
  useEffect(() => { localStorage.setItem('bovigest_ai_endpoint', aiEndpoint); }, [aiEndpoint]);
  useEffect(() => { localStorage.setItem('bovigest_ai_model', aiModel); }, [aiModel]);

  // --- LOGIN COM VALIDAÇÃO DE CONVITE ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const senha = e.target.senha.value;
    const validUser = appData.usuarios.find(u => u.email === email && u.senha === senha && (u.status === 'Ativo' || u.status === 'Pendente'));
    
    if (validUser) { 
      if (validUser.status === 'Pendente') {
        alert(`Bem-vindo(a), ${validUser.nome.split(' ')[0]}! O seu convite foi confirmado com sucesso.`);
        const updatedUsers = appData.usuarios.map(u => u.id === validUser.id ? { ...u, status: 'Ativo' } : u);
        setAppData(prev => ({ ...prev, usuarios: updatedUsers }));
        setCurrentUser({ ...validUser, status: 'Ativo' });
      } else {
        setCurrentUser(validUser);
      }
      setIsLoggedIn(true); 
      setLoginError(""); 
    } 
    else { 
      // Tentar login via API centralizada (usuários de outros dispositivos)       try {         const resp = await fetch(`/api/usuarios?action=login&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`);         if (resp.ok) {           const apiResult = await resp.json();           if (apiResult.success && apiResult.user) {             setCurrentUser(apiResult.user);             setIsLoggedIn(true);             setLoginError("");             return;           }         }       } catch (_) {}       setLoginError("Credenciais inválidas. Verifique o email e senha inseridos."); 
    }
  };

  // --- FILTROS RÍGIDOS POR PROPRIEDADE (Isolamento de Dados) ---
  const propriedadeAtiva = useMemo(() => appData.propriedades.find(p => p.id === activePropriedadeId) || appData.propriedades[0], [activePropriedadeId, appData.propriedades]);
  
  const currentAnimais = useMemo(() => appData.animais.filter(a => a.propriedadeId === activePropriedadeId), [appData.animais, activePropriedadeId]);
  const currentLotes = useMemo(() => appData.lotes.filter(a => a.propriedadeId === activePropriedadeId), [appData.lotes, activePropriedadeId]);
  const currentFinanceiro = useMemo(() => appData.financeiro.filter(a => a.propriedadeId === activePropriedadeId), [appData.financeiro, activePropriedadeId]);
  const currentPesagens = useMemo(() => appData.pesagens.filter(a => a.propriedadeId === activePropriedadeId), [appData.pesagens, activePropriedadeId]);
  const currentReproducao = useMemo(() => appData.reproducao.filter(a => a.propriedadeId === activePropriedadeId), [appData.reproducao, activePropriedadeId]);
  const currentNascimentos = useMemo(() => appData.nascimentos.filter(a => a.propriedadeId === activePropriedadeId), [appData.nascimentos, activePropriedadeId]);
  const currentVacinacoes = useMemo(() => appData.vacinacoes.filter(a => a.propriedadeId === activePropriedadeId), [appData.vacinacoes, activePropriedadeId]);
  const currentInsumos = useMemo(() => appData.insumos.filter(a => a.propriedadeId === activePropriedadeId), [appData.insumos, activePropriedadeId]);
  const currentCalendario = useMemo(() => appData.calendarioSanitario?.filter(a => a.propriedadeId === activePropriedadeId), [appData.calendarioSanitario, activePropriedadeId]);

  // --- CÁLCULOS GERAIS ---
  const totaisFinanceiros = useMemo(() => {
    return currentFinanceiro.reduce((acc, item) => {
      if (item.status === 'pago') {
        if (item.tipo === 'receita') acc.receitas += Number(item.valor);
        if (item.tipo === 'despesa') acc.despesas += Number(item.valor);
      }
      return acc;
    }, { receitas: 0, despesas: 0 });
  }, [currentFinanceiro]);
  
  const saldoAtual = totaisFinanceiros.receitas - totaisFinanceiros.despesas;

  const pesoMedio = useMemo(() => {
    if (currentAnimais.length === 0) return 0;
    return Math.round(currentAnimais.reduce((acc, a) => acc + Number(a.peso), 0) / currentAnimais.length);
  }, [currentAnimais]);

  const custoPorArroba = useMemo(() => {
    const pesoTotal = currentAnimais.reduce((acc, a) => acc + Number(a.peso), 0);
    const totalArrobasVivas = pesoTotal / 30; 
    if (totalArrobasVivas === 0) return 0;
    return totaisFinanceiros.despesas / totalArrobasVivas;
  }, [currentAnimais, totaisFinanceiros.despesas]);

  const distribuicaoCategorias = useMemo(() => {
    const counts = {};
    currentAnimais.forEach(a => { counts[a.categoria] = (counts[a.categoria] || 0) + 1; });
    return counts;
  }, [currentAnimais]);

  const filteredAnimais = useMemo(() => {
    return currentAnimais.filter(a => 
      a.brinco.includes(searchQuery) || a.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.categoria.toLowerCase().includes(searchQuery.toLowerCase()) || a.lote.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, currentAnimais]);

  const gadoDeCorte = useMemo(() => currentAnimais.filter(a => a.tipo === 'Corte'), [currentAnimais]);

  const isEmCarencia = (animalLote) => {
    const hoje = new Date();
    const vacinaLote = currentVacinacoes.find(v => v.lote === animalLote || v.lote === "Todo o Rebanho");
    if (vacinaLote && vacinaLote.dataLiberacao) {
      const liberacao = new Date(vacinaLote.dataLiberacao);
      if (hoje < liberacao) return vacinaLote;
    }
    return false;
  };

  const getGPD = (brinco) => {
    const pesagensAnimal = currentPesagens.filter(p => p.brinco === brinco).sort((a,b) => new Date(b.data) - new Date(a.data));
    if (pesagensAnimal.length >= 2) {
      const diffPeso = pesagensAnimal[0].pesoAtual - pesagensAnimal[1].pesoAtual;
      const diffDias = (new Date(pesagensAnimal[0].data) - new Date(pesagensAnimal[1].data)) / (1000 * 60 * 60 * 24);
      if (diffDias > 0) return (diffPeso / diffDias).toFixed(2);
    }
    return null;
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const showSaveSuccess = () => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); };

  // --- EXPORTAÇÃO CSV PADRONIZADA DOS EXCEIS ---
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [headers.join(','), ...rows.map(e => e.map(item => `"${item}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click();
  };

  const exportRebanho = () => {
    const headers = ['Nº Brinco', 'Nome/Apelido', 'Espécie/Raça', 'Data Nasc.', 'Idade (meses)', 'Categoria', 'Sexo', 'Pelagem/Cor', 'Peso Atual (kg)', 'Peso Anterior (kg)', 'GMD (kg/dia)', 'Status', 'Origem', 'Pasto/Lote', 'Pai (Touro)', 'Mãe (Matriz)', 'Observações'];
    const rows = currentAnimais.map(a => {
      const ageMonths = Math.floor((new Date() - new Date(a.dataNasc)) / (1000 * 60 * 60 * 24 * 30));
      const pAnimal = currentPesagens.filter(p => p.brinco === a.brinco).sort((x, y) => new Date(y.data) - new Date(x.data));
      const pesoAnt = pAnimal.length > 0 ? pAnimal[0].pesoAnterior : '';
      return [a.brinco, a.nome, a.raca, a.dataNasc, ageMonths, a.categoria, a.sexo, '-', a.peso, pesoAnt, getGPD(a.brinco) || '', a.ativo ? 'Ativo' : 'Inativo', '-', a.lote, '-', '-', a.obs || ''];
    });
    downloadCSV(`Rebanho_${propriedadeAtiva.nome.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  const exportFinanceiro = () => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Subcategoria', 'Valor (R$)', 'Forma de Pagamento', 'Fornecedor/Cliente', 'Nº NF/Recibo', 'Centro de Custo', 'Comprovante', 'Observações', 'Mês', 'Ano'];
    const rows = currentFinanceiro.map(f => {
      const d = new Date(f.data);
      return [f.data, f.descricao, f.tipo, f.categoria, '-', f.valor, '-', '-', '-', '-', '-', f.obs || '', d.getMonth()+1, d.getFullYear()];
    });
    downloadCSV(`Financeiro_${propriedadeAtiva.nome.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  const exportReproducao = () => {
    const headers = ['Nº Brinco', 'Nome Matriz', 'Data IA/Monta', 'Tipo (IA/Monta Natural)', 'Tourou/Sêmen', 'Raça Touro', 'Resultado DG', 'Data DG', 'Data Prev. Parto', 'Nº IA na Vaca', 'Técnico Responsável', 'Protocolo Hormonal', 'Custo IA (R$)', 'Observações', 'Status Final'];
    const rows = currentReproducao.map(r => [r.brincoVaca, '-', r.dataInseminacao, r.metodo, r.reprodutor, '-', '-', '-', r.previsaoParto, '-', '-', '-', '-', '-', r.status]);
    downloadCSV(`Reproducao_${propriedadeAtiva.nome.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  const exportParicao = () => {
    const headers = ['Nº Brinco Mãe', 'Nome da Mãe', 'Data do Parto', 'Hora do Parto', 'Tipo de Parto', 'Nº Brinco Cria', 'Sexo Cria', 'Raça Cria', 'Peso Nasc. (kg)', 'Condição ao Nascer', 'Nº Prenhez (Ordem)', 'Pai (Touro/Sêmen)', 'Assistência Veterinária', 'Intercorrências', 'Destino da Cria', 'Status Mãe Pós-Parto', 'Observações'];
    const rows = currentNascimentos.map(n => [n.brincoMatriz, '-', n.data, '-', 'Normal', n.brincoBezerro, n.sexo, '-', n.pesoNascimento, 'Vigoroso', '-', '-', '-', '-', '-', '-', n.obs || '']);
    downloadCSV(`Paricao_${propriedadeAtiva.nome.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  const exportSaude = () => {
    const headers = ['Nº Brinco', 'Nome Animal', 'Data Atendimento', 'Tipo de Evento', 'Doença/Condição', 'Medicamento/Vacina', 'Dose (ml/g)', 'Via de Adm.', 'Período Carência (dias)', 'Data Fim Carência', 'Veterinário Resp.', 'Custo (R$)', 'Nº Lote Vacina', 'Próx. Dose/Retorno', 'Resultado/Evolução', 'Observações'];
    const rows = currentVacinacoes.map(v => [`LOTE: ${v.lote}`, 'Vários', v.dataAplicacao, 'Vacinação/Tratamento', '-', v.vacina, '-', '-', v.carenciaDias, v.dataLiberacao || '-', '-', '-', '-', v.proximaDose || '-', v.status, v.obs || '']);
    downloadCSV(`Saude_Animal_${propriedadeAtiva.nome.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  // --- NUTRIÇÃO ---
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
    if (!dietaAtual.find(d => d.idInsumo === Number(insumoSelecionado))) setDietaAtual([...dietaAtual, { idInsumo: Number(insumoSelecionado), kgMN: 1 }]);
    setInsumoSelecionado("");
  };
  const handleUpdateKgMN = (idInsumo, novoKgMN) => setDietaAtual(dietaAtual.map(d => d.idInsumo === idInsumo ? { ...d, kgMN: Number(novoKgMN) } : d));
  const handleRemoveInsumoDieta = (idInsumo) => setDietaAtual(dietaAtual.filter(d => d.idInsumo !== idInsumo));

  // --- HANDLERS IA ---
  const handleAnalyzeFarm = async () => {
    setIsAnalyzing(true);
        const context = `
PROPRIEDADE: ${propriedadeAtiva?.nome}
LOCALIZAÇÃO: ${propriedadeAtiva?.cidade} - ${propriedadeAtiva?.estado}
ÁREA: ${propriedadeAtiva?.area_ha} hectares

REBANHO:
- Total: ${currentAnimais.length} cabeças
- Peso Médio: ${pesoMedio}kg
- Distribuição: ${Object.entries(distribuicaoCategorias).map(([cat, qtd]) => `${cat}: ${qtd}`).join(', ')}
- Gado de Corte: ${gadoDeCorte.length} animais

FINANCEIRO:
- Receitas: ${formatCurrency(totaisFinanceiros.receitas)}
- Despesas: ${formatCurrency(totaisFinanceiros.despesas)}
- Saldo: ${formatCurrency(saldoAtual)}
- Custo/@: ${formatCurrency(custoPorArroba)}

INFRAESTRUTURA:
- Lotes/Pastagens: ${currentLotes.length}
- Capacidade Total: ${currentLotes.reduce((acc, l) => acc + l.capacidade, 0)} cabeças

REPRODUÇÃO:
- Matrizes Prenhes: ${currentReproducao.filter(r => r.status === 'Prenhe').length}
- Nascimentos Registados: ${currentNascimentos.length}
`;
        const prompt = "Faça uma análise técnica completa da fazenda, incluindo: 1) Indicadores de performance, 2) Pontos de atenção, 3) Oportunidades de melhoria, 4) Estratégias de rentabilidade.";
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
    const context = `Animais: ${currentAnimais.length}. Custo/@: ${custoPorArroba}. Lotes: ${currentLotes.map(l=>l.nome).join(', ')}. Propriedade: ${propriedadeAtiva?.nome}`;
    const historyText = chatMessages.map(m => `${m.role === 'user' ? 'Utilizador' : 'Assistente'}: ${m.text}`).join("\n");
    const result = await callGemini(`Histórico:\n${historyText}\n\nUtilizador: ${userText}`, "És o BoviGest IA, assistente agropecuário.", geminiApiKey, aiEndpoint, aiModel);
    setChatMessages(prev => [...prev, { role: 'model', text: result }]);
    setIsChatLoading(false);
  };

  // --- HANDLERS FORMS (ISOLAMENTO POR PROPRIEDADE ATIVA) ---
  const handleSaveAnimal = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const animalData = {
      id: editingAnimal ? editingAnimal.id : Date.now(),
      propriedadeId: activePropriedadeId,
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
        id: Date.now() + i, propriedadeId: activePropriedadeId, brinco: `${prefixo}${(inicio + i).toString().padStart(3, '0')}`, nome: "-",
        sexo: fd.get('sexo'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), raca: fd.get('raca'),
        dataNasc: fd.get('dataNasc'), peso: Number(fd.get('peso')), lote, obs: "Cadastrado em lote.", ativo: true
      });
    }
    setAppData(prev => ({ ...prev, animais: [...novosAnimais, ...prev.animais] }));
    setIsBatchAnimalFormOpen(false); showSaveSuccess();
  };

  const handleAddPesagem = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const brinco = fd.get('brinco');
    const pesoAtual = Number(fd.get('pesoAtual'));
    const animal = currentAnimais.find(a => a.brinco === brinco);
    if (!animal) return alert("Animal não encontrado na propriedade atual!");
    const novaPesagem = { id: Date.now(), propriedadeId: activePropriedadeId, brinco, data: fd.get('data'), pesoAnterior: animal.peso, pesoAtual, obs: fd.get('obs') || "" };
    setAppData(prev => ({ ...prev, pesagens: [novaPesagem, ...prev.pesagens], animais: prev.animais.map(a => a.brinco === brinco && a.propriedadeId === activePropriedadeId ? { ...a, peso: pesoAtual } : a) }));
    setIsPesagemFormOpen(false); showSaveSuccess();
  };

  const handleAddNascimento = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const brincoMatriz = fd.get('brincoMatriz');
    const brincoBezerro = fd.get('brincoBezerro');
    const pesoNascer = Number(fd.get('pesoNascimento'));
    const novoNasc = { id: Date.now(), propriedadeId: activePropriedadeId, data: fd.get('data'), brincoMatriz, brincoBezerro, sexo: fd.get('sexo'), pesoNascimento: pesoNascer, obs: fd.get('obs') || "" };
    const novoAnimal = { id: Date.now() + 1, propriedadeId: activePropriedadeId, brinco: brincoBezerro, nome: "-", sexo: fd.get('sexo'), categoria: "Bezerro(a)", tipo: "Cria", raca: fd.get('raca'), dataNasc: fd.get('data'), peso: pesoNascer, lote: "Maternidade", obs: `Cria da matriz ${brincoMatriz}`, ativo: true };
    setAppData(prev => ({ ...prev, nascimentos: [novoNasc, ...prev.nascimentos], animais: [novoAnimal, ...prev.animais], reproducao: prev.reproducao.map(r => r.brincoVaca === brincoMatriz && r.status === 'Prenhe' && r.propriedadeId === activePropriedadeId ? { ...r, status: 'Parida' } : r) }));
    setIsNascimentoFormOpen(false); showSaveSuccess();
  };

  const handleAddVaccine = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const carenciaDias = Number(fd.get('carenciaDias'));
    let dataLiberacao = null;
    if (carenciaDias > 0) {
      const libDate = new Date(fd.get('dataAplicacao'));
      libDate.setDate(libDate.getDate() + carenciaDias);
      dataLiberacao = libDate.toISOString().split('T')[0];
    }
    const novaVacina = { id: Date.now(), propriedadeId: activePropriedadeId, vacina: fd.get('vacina'), lote: fd.get('lote'), dataAplicacao: fd.get('dataAplicacao'), proximaDose: fd.get('proximaDose') || null, qtdAnimais: Number(fd.get('qtdAnimais')), obs: fd.get('obs') || "", carenciaDias, dataLiberacao, status: "concluida" };
    setAppData(prev => ({ ...prev, vacinacoes: [novaVacina, ...prev.vacinacoes] }));
    setIsVaccineFormOpen(false); showSaveSuccess();
  };

  const handleAddFinance = (e) => { 
    e.preventDefault(); 
    const fd = new FormData(e.target); 
    setAppData(prev => ({ ...prev, financeiro: [{ id: Date.now(), propriedadeId: activePropriedadeId, descricao: fd.get('descricao'), categoria: fd.get('categoria'), tipo: fd.get('tipo'), valor: Number(fd.get('valor')), data: fd.get('data'), status: fd.get('status') }, ...prev.financeiro] })); 
    setIsFinanceFormOpen(false); showSaveSuccess(); 
  };
  
  const handleAddLote = (e) => { 
    e.preventDefault(); 
    const fd = new FormData(e.target); 
    setAppData(prev => ({ ...prev, lotes: [{ id: Date.now(), propriedadeId: activePropriedadeId, nome: fd.get('nome'), capacidade: Number(fd.get('capacidade')), tipo: fd.get('tipo'), obs: fd.get('obs') || "" }, ...prev.lotes] })); 
    setIsLoteFormOpen(false); showSaveSuccess(); 
  };
  
  const handleAddInsumo = (e) => { 
    e.preventDefault(); 
    const fd = new FormData(e.target); 
    setAppData(prev => ({ ...prev, insumos: [{ id: Date.now(), propriedadeId: activePropriedadeId, nome: fd.get('nome'), categoria: fd.get('categoria'), quantidade: Number(fd.get('quantidade')), unidade: fd.get('unidade'), estoqueMinimo: Number(fd.get('estoqueMinimo')) }, ...prev.insumos] })); 
    setIsInsumoFormOpen(false); showSaveSuccess(); 
  };
  
  const handleAddReproducao = (e) => { 
    e.preventDefault(); 
    const fd = new FormData(e.target); 
    const prevDate = new Date(new Date(fd.get('dataInseminacao')).setDate(new Date(fd.get('dataInseminacao')).getDate() + 290)).toISOString().split('T')[0]; 
    setAppData(prevData => ({ ...prevData, reproducao: [{ id: Date.now(), propriedadeId: activePropriedadeId, brincoVaca: fd.get('brincoVaca'), dataInseminacao: fd.get('dataInseminacao'), previsaoParto: prevDate, metodo: fd.get('metodo'), reprodutor: fd.get('reprodutor'), status: fd.get('status') }, ...prevData.reproducao] })); 
    setIsReproducaoFormOpen(false); showSaveSuccess(); 
  };

  const handleAddPropriedade = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const novaProp = { id: Date.now(), nome: fd.get('nome'), responsavel: fd.get('responsavel'), cidade: fd.get('cidade'), estado: fd.get('estado'), area_ha: Number(fd.get('area_ha')), ie: fd.get('ie') };
    setAppData(prev => ({ ...prev, propriedades: [...prev.propriedades, novaProp] }));
    setActivePropriedadeId(novaProp.id);
    setIsPropriedadeFormOpen(false); showSaveSuccess();
  };

  const handleDeletePropriedade = (id) => {
    if (appData.propriedades.length === 1) {
      alert("Não é possível excluir a única propriedade do sistema.");
      return;
    }
    if (confirm('🚨 ATENÇÃO: Deseja apagar esta propriedade e TODOS os animais, lotes, finanças e registos associados a ela? Esta ação é irreversível!')) {
      setAppData(prev => ({
        ...prev,
        propriedades: prev.propriedades.filter(p => p.id !== id),
        lotes: prev.lotes.filter(x => x.propriedadeId !== id),
        animais: prev.animais.filter(x => x.propriedadeId !== id),
        pesagens: prev.pesagens.filter(x => x.propriedadeId !== id),
        reproducao: prev.reproducao.filter(x => x.propriedadeId !== id),
        nascimentos: prev.nascimentos.filter(x => x.propriedadeId !== id),
        vacinacoes: prev.vacinacoes.filter(x => x.propriedadeId !== id),
        insumos: prev.insumos.filter(x => x.propriedadeId !== id),
        financeiro: prev.financeiro.filter(x => x.propriedadeId !== id),
        calendarioSanitario: prev.calendarioSanitario.filter(x => x.propriedadeId !== id),
      }));
      if (activePropriedadeId === id) {
        const nextProp = appData.propriedades.find(p => p.id !== id);
        if (nextProp) setActivePropriedadeId(nextProp.id);
      }
      showSaveSuccess();
    }
  };

  const handleSaveUsuario = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const novoUsr = { 
      id: editingUsuario ? editingUsuario.id : Date.now(), 
      nome: fd.get('nome'), 
      email: fd.get('email'), 
      senha: fd.get('senha'), 
      role: fd.get('role'),
      status: editingUsuario ? editingUsuario.status : 'Pendente'
    };
    
    if (editingUsuario) {
      setAppData(prev => ({ ...prev, usuarios: prev.usuarios.map(u => u.id === novoUsr.id ? novoUsr : u) }));
    } else {
      setAppData(prev => ({ ...prev, usuarios: [...(prev.usuarios || []), novoUsr] }));
      
    // Em vez de abrir mailto diretamente, mostrar modal
    setEmailModalData({
      nome: novoUsr.nome,
      email: novoUsr.email,
      senha: novoUsr.senha,
      role: novoUsr.role
    });    }
    setIsUsuarioFormOpen(false); setEditingUsuario(null); showSaveSuccess();
  };

    // Função para enviar email
  const handleSendEmail = () => {
    const subject = encodeURIComponent("Convite de Acesso - BoviGest PRO");
    const body = encodeURIComponent(`Olá ${emailModalData.nome},

Foi convidado(a) a aceder ao sistema BoviGest PRO.

🔑 DADOS DE ACESSO:
Email: ${emailModalData.email}
Senha Provisória: ${emailModalData.senha}
Nível de Acesso: ${emailModalData.role}

🌐 ACEDER AO SISTEMA:
https://bovigest-online.vercel.app/

⚠️ IMPORTANTE:
- Recomendamos alterar a senha no primeiro acesso
- Mantenha suas credenciais em local seguro
- Em caso de dúvidas, contacte o administrador

Atenciosamente,
Equipa BoviGest`);
    
    window.location.href = `mailto:${emailModalData.email}?subject=${subject}&body=${body}`;
    setEmailModalData(null);
  };

  const handleDeleteUsuario = (id) => {
    if (confirm('Tem a certeza que deseja remover este utilizador?')) {
      setAppData(prev => ({ ...prev, usuarios: prev.usuarios.filter(u => u.id !== id) })); showSaveSuccess();
    }
  };

  const handleAddCalendario = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const novoEvento = { id: Date.now(), propriedadeId: activePropriedadeId, doenca: fd.get('doenca'), mes: fd.get('mes'), publico: fd.get('publico'), obrigatorio: fd.get('obrigatorio') === 'true' };
    setAppData(prev => ({ ...prev, calendarioSanitario: [...(prev.calendarioSanitario || []), novoEvento] }));
    setIsCalendarioFormOpen(false); showSaveSuccess();
  };

  const handleDeleteAnimal = (id) => { 
    if (confirm('Tem a certeza que deseja remover este animal?')) { 
      setAppData(prev => ({ ...prev, animais: prev.animais.filter(a => a.id !== id) })); setSelectedAnimal(null); showSaveSuccess(); 
    } 
  };

        const handleDeleteNascimento = (id) => {
    if (confirm('Tem a certeza que deseja remover este nascimento?')) {
      setAppData(prev => ({ ...prev, nascimentos: prev.nascimentos.filter(n => n.id !== id) }));
      showSaveSuccess();
    }
  };

  const handleDeleteInsumo = (id) => {
    if (confirm('Tem a certeza que deseja remover este insumo?')) {
      setAppData(prev => ({ ...prev, insumos: prev.insumos.filter(i => i.id !== id) }));
      showSaveSuccess();
    }
  };

  const handleDeleteVacinacao = (id) => {
    if (confirm('Tem a certeza que deseja remover este registo de vacinação?')) {
      setAppData(prev => ({ ...prev, vacinacoes: prev.vacinacoes.filter(v => v.id !== id) }));
      showSaveSuccess();
    }
  };

  const handleDeletePesagem = (id) => {
    if (confirm('Tem a certeza que deseja remover esta pesagem?')) {
      setAppData(prev => ({ ...prev, pesagens: prev.pesagens.filter(p => p.id !== id) }));
      showSaveSuccess();
    }
  };

  const handleDeleteFinanceiro = (id) => {
    if (confirm('Tem a certeza que deseja remover este lançamento?')) {
      setAppData(prev => ({ ...prev, financeiro: prev.financeiro.filter(f => f.id !== id) }));
      showSaveSuccess();
    }
  };

  const handleDeleteReproducao = (id) => {
    if (confirm('Tem a certeza que deseja remover este registo de inseminação?')) {
      setAppData(prev => ({ ...prev, reproducao: prev.reproducao.filter(r => r.id !== id) }));
      showSaveSuccess();
    }
  };

  const handleEditReproducao = (reproducao) => {
    setEditingReproducao(reproducao);
    setIsReproducaoFormOpen(true);
  };

  const openEditAnimal = (animal) => { setEditingAnimal(animal); setIsAnimalFormOpen(true); };
  const openEditUsuario = (usr) => { setEditingUsuario(usr); setIsUsuarioFormOpen(true); };

  // --- NAVEGAÇÃO ---
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Central' },
    { id: 'ai-assistant', icon: Sparkles, label: 'Consultor IA' },
    { id: 'nutricao', icon: Wheat, label: 'Nutrição & Dietas' },
    { id: 'propriedades', icon: MapPin, label: 'Propriedades' },
    { id: 'animais', icon: Beef, label: 'Rebanho Geral', badge: currentAnimais.length },
    { id: 'gado_corte', icon: Target, label: 'Gado de Corte', badge: gadoDeCorte.length },
    { id: 'pastagens', icon: LayoutGrid, label: 'Pastagens / Lotes', badge: currentLotes.length },
    { id: 'reproducao', icon: HeartPulse, label: 'Inseminações' },
    { id: 'nascimentos', icon: Baby, label: 'Nascimentos', badge: currentNascimentos.length },
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
            {loginError && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-bold text-center">
                {loginError}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <input type="email" name="email" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder-slate-500" placeholder="Email de Acesso" />
              </div>
              <div>
                <input type="password" name="senha" required className="block w-full px-5 py-4 bg-slate-800 border-none text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder-slate-500" placeholder="Senha" />
              </div>
              <button type="submit" className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-bold text-white bg-green-600 hover:bg-green-500 transition-all shadow-lg">Aceder ao Portal Seguro</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const animaisEmCarencia = currentAnimais.filter(a => isEmCarencia(a.lote)).length;
  const insumosCriticos = currentInsumos.filter(i => i.quantidade <= i.estoqueMinimo).length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 border-r border-slate-900 hidden md:flex flex-col shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50 shrink-0">
          <Tractor className="text-green-500 mr-4 shrink-0" size={32} />
          <span className="text-2xl font-black tracking-tight text-white block leading-none">BoviGest</span>
        </div>
        
        {/* Seletor de Propriedade Isolada */}
        <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/50 shrink-0">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Propriedade Ativa</label>
          <select 
            value={activePropriedadeId} 
            onChange={(e) => setActivePropriedadeId(Number(e.target.value))}
            className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-lg border border-slate-700 outline-none focus:ring-2 focus:ring-green-500 truncate"
          >
            {appData.propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
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
          <button onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }} className="flex items-center justify-center w-full px-4 py-3 text-slate-400 border border-slate-700/50 hover:text-red-400 hover:bg-slate-900 rounded-xl font-bold text-sm">
            <LogOut className="mr-2 h-4 w-4" /> Sair ({currentUser?.nome.split(' ')[0]})
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
          
          {/* --- DASHBOARD --- */}
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {(animaisEmCarencia > 0 || insumosCriticos > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {animaisEmCarencia > 0 && (
                    <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start">
                      <div className="bg-red-100 p-3 rounded-xl text-red-600 mr-4"><AlertTriangle size={24} /></div>
                      <div>
                        <h4 className="text-red-900 font-extrabold text-lg">Atenção: Período de Carência</h4>
                        <p className="text-red-700 font-medium text-sm mt-1">Existem <b>{animaisEmCarencia} animais</b> sob efeito de medicamentos.</p>
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
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{currentAnimais.length}</h3>
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
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{currentReproducao.filter(r=>r.status === 'Prenhe').length}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Matrizes Prenhes</p>
                </div>
              </div>

              {/* Bloco: Distribuição do Rebanho */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Distribuição por Categoria</h3>
                  <div className="space-y-4">
                    {Object.entries(distribuicaoCategorias).map(([cat, qtd]) => {
                      const pct = Math.round((qtd / currentAnimais.length) * 100) || 0;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between items-end mb-1">
                            <span className="font-bold text-gray-700">{cat}</span>
                            <span className="font-black text-gray-900">{pct}% ({qtd})</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative flex flex-col justify-center">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center mb-2">Relatório Inteligente <Sparkles className="ml-3 text-green-500" size={24} /></h3>
                    <p className="text-gray-500 font-medium mb-6">A Inteligência Artificial analisa os seus dados e gera estratégias para otimizar lucro e maneio.</p>
                    
                    {(false) ? (
                      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 text-sm font-bold flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                        <p>Para ativar os Relatórios, insira a sua API Key do Gemini na aba <b>Configurações</b>.</p>
                      </div>
                    ) : (
                      <button onClick={handleAnalyzeFarm} disabled={isAnalyzing} className="w-full bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center disabled:opacity-70">
                        {isAnalyzing ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Bot className="w-6 h-6 mr-3" />}
                        {isAnalyzing ? 'A Processar Análise...' : 'Gerar Análise IA Agora'}
                      </button>
                    )}
                    
                    {aiInsights && (
                      <div className="mt-6 p-6 bg-green-50 border border-green-100 rounded-2xl animate-in fade-in">
                        <div className="prose max-w-none text-green-900 text-sm font-medium whitespace-pre-wrap leading-relaxed">{aiInsights}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

                    {/* --- CONSULTOR IA --- */}
{currentView === 'ai-assistant' && (
  <div className="max-w-5xl mx-auto space-y-6">
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <Sparkles className="w-7 h-7 mr-3 text-purple-600" />
        Análise Inteligente da Propriedade
      </h3>
      {(false) ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-xl">
          ⚠️ Configure sua API Key do Google Gemini em <strong>Configurações</strong> para ativar a IA.
        </div>
      ) : (
        <button onClick={handleAnalyzeFarm} disabled={isAnalyzing} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center transition-all disabled:opacity-50">
          {isAnalyzing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Bot className="w-5 h-5 mr-2" />}
          {isAnalyzing ? 'Analisando Dados...' : 'Gerar Análise Completa'}
        </button>
      )}
      {aiInsights && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 whitespace-pre-wrap text-gray-800 shadow-sm">
          {aiInsights}
        </div>
      )}
    </div>
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          Assistente Virtual BoviGest
        </h3>
      </div>
      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-5 py-3 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-5 py-3 rounded-2xl flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">Pensando...</span>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t-2 border-gray-200 flex gap-3">
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Digite sua pergunta sobre a gestão da fazenda..." className="flex-1 px-5 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500" disabled={isChatLoading} />
        <button type="submit" disabled={isChatLoading || !chatInput.trim() || !geminiApiKey} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-md flex items-center transition-all disabled:opacity-40">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  </div>
)}


          {/* --- NUTRIÇÃO (NASEM) --- */}
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

          {/* --- PROPRIEDADES --- */}
          {currentView === 'propriedades' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><MapPin className="mr-3 text-blue-500" /> Gestão de Propriedades</h3>
                <button onClick={() => setIsPropriedadeFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Nova Propriedade</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appData.propriedades.map((prop) => (
                  <div key={prop.id} className={`bg-white p-6 rounded-3xl shadow-sm border ${activePropriedadeId === prop.id ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-black text-gray-900">{prop.nome}</h4>
                      <div className="flex items-center space-x-2">
                        {activePropriedadeId === prop.id && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Ativa</span>}
                        <button onClick={() => handleDeletePropriedade(prop.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm font-medium text-gray-600">
                      <p><strong className="text-gray-900">Responsável:</strong> {prop.responsavel}</p>
                      <p><strong className="text-gray-900">Localização:</strong> {prop.cidade} - {prop.estado}</p>
                      <p><strong className="text-gray-900">Área:</strong> {prop.area_ha} ha</p>
                      <p><strong className="text-gray-900">Inscrição Est.:</strong> {prop.ie}</p>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button onClick={() => setActivePropriedadeId(prop.id)} disabled={activePropriedadeId === prop.id} className={`flex-1 py-2 rounded-xl font-bold transition-all ${activePropriedadeId === prop.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black'}`}>
                        {activePropriedadeId === prop.id ? 'Selecionada' : 'Tornar Ativa'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- ANIMAIS --- */}
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
                      {filteredAnimais.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-400 font-bold text-lg">Nenhum animal listado na propriedade atual.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- GADO DE CORTE --- */}
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

          {/* --- PASTAGENS / LOTES --- */}
          {currentView === 'pastagens' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><LayoutGrid className="mr-3 text-green-600" /> Mapa de Lotes</h3>
                <button onClick={() => setIsLoteFormOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Novo Lote</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentLots.map((lote) => {
                  const animaisNoLote = currentAnimais.filter(a => a.lote === lote.nome).length;
return(
                    <div key={lote.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-black text-gray-900">{lote.nome}</h4>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{lote.tipo}</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px]">{lote.obs}</p>
                      <div className="mb-2 flex justify-between items-end">
                        <span className="text-3xl font-black text-gray-900">{animaisNoLote}</span>
                        <span className="text-sm font-bold text-gray-400">/ {lote.capacidade} cap.</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${ocupacao > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(ocupacao, 100)}%`}}></div>
                      </div>
                    </div>
               );
          })}
              </div>
            </div>
          )}

          {/* --- REPRODUÇÃO --- */}
                {currentView === 'reproducao' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><HeartPulse className="mr-3 text-pink-600" /> Controlo Reprodutivo</h3>
                <button onClick={() => setIsReproducaoFormOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Inseminação</button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-pink-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Matriz</th><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Data / Método</th><th className="px-6 py-4 text-left text-xs font-black text-pink-800 uppercase">Prev. Parto</th><th className="px-6 py-4 text-right text-xs font-black text-pink-800 uppercase">Status</th></tr><th className="px-6 py-4 text-right">Ações</th>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {currentReproducao.map((rep) => (
                      <tr key={rep.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-black text-gray-900">{rep.brincoVaca}</td>
                        <td className="px-6 py-4"><span className="block font-bold text-gray-700">{rep.dataInseminacao}</span><span className="text-xs text-gray-500">{rep.metodo} - {rep.reprodutor}</span></td>
                        <td className="px-6 py-4 font-bold text-gray-700">{rep.previsaoParto}</td>
                        <td className="px-6 py-4 text-right"><span className={`px-3 py-1 rounded-full text-xs font-bold ${rep.status === 'Prenhe' ? 'bg-green-100 text-green-700' : rep.status === 'Parida' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{rep.status}</span></td>
                                        <td className="px-6 py-4 text-right"><button onClick={() => handleEditReproducao(rep)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button><button onClick={() => handleDeleteReproducao(rep.id)} className="text-red-500 hover:text-red-700 p-2 ml-2"><Trash2 size={18} /></button></td>
</tr>
                    ))}
                    {currentReproducao.length === 0 && <tr><td colSpan={4} className="text-center py-8 font-bold text-gray-400">Nenhum registo reprodutivo.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- NASCIMENTOS --- */}
          {currentView === 'nascimentos' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setIsNascimentoFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Novo Nascimento</button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Data</th><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Matriz &rarr; Bezerro</th><th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase">Sexo</th><th className="px-6 py-4 text-right text-xs font-black text-blue-800 uppercase">Peso Nasc.</th><th className="px-6 py-4 text-left">Observações</th><th className="px-6 py-4 text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {currentNascimentos.map((nasc) => (
                      <tr key={nasc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-700">{nasc.data}</td>
                        <td className="px-6 py-4"><span className="block font-black text-gray-900">M: {nasc.brincoMatriz}</span><span className="text-sm font-bold text-blue-600">B: {nasc.brincoBezerro}</span></td>
                        <td className="px-6 py-4 font-bold text-gray-700">{nasc.sexo}</td>
                        <td className="px-6 py-4 text-right font-black text-gray-900">{nasc.pesoNascimento} kg</td><td className="px-8 py-5"><button onClick={() => handleDeleteNascimento(nasc.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td><td className="px-8 py-5"><button onClick={() => handleDeleteNascimento(nasc.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td><td className="px-8 py-5"><button onClick={() => handleDeleteNascimento(nasc.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td><td className="px-8 py-5"><button onClick={() => handleDeleteNascimento(nasc.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td><td className="px-8 py-5"><button onClick={() => handleDeleteNascimento(nasc.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td><td className="px-8 py-5"><button onClick={() => handleDeleteNascimento(nasc.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td>

                      </tr>                                        
                    ))}
                    {currentNascimentos.length === 0 && <tr><td colSpan={4} className="text-center py-8 font-bold text-gray-400">Nenhum nascimento registado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- SANIDADE (COM CALENDÁRIO RO) --- */}
          {currentView === 'sanidade' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><ShieldAlert className="mr-3 text-red-500" /> Sanidade e Vacinação</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex space-x-1">
                  <button onClick={() => setSanidadeTab('registos')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${sanidadeTab === 'registos' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>Histórico de Lotes</button>
                  <button onClick={() => setSanidadeTab('calendario')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${sanidadeTab === 'calendario' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>Calendário RO</button>
                </div>
              </div>

              {sanidadeTab === 'registos' ? (
                <>
                  <div className="flex justify-end mb-4">
                    <button onClick={() => setIsVaccineFormOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Tratamento de Lote</button>
                  </div>
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-red-50">
                        <tr><th className="px-6 py-4 text-left text-xs font-black text-red-800 uppercase">Data / Vacina</th><th className="px-6 py-4 text-left text-xs font-black text-red-800 uppercase">Lote Alvo</th><th className="px-6 py-4 text-left text-xs font-black text-red-800 uppercase">Carência</th><th className="px-6 py-4 text-right text-xs font-black text-red-800 uppercase">Liberação</th></tr><th className="px-6 py-4 text-right">Ações</th>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {currentVacinacoes.map((vac) => (
                          <tr key={vac.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4"><span className="block font-black text-gray-900">{vac.vacina}</span><span className="text-sm font-bold text-gray-500">{vac.dataAplicacao}</span></td>
                            <td className="px-6 py-4 font-bold text-gray-700">{vac.lote} ({vac.qtdAnimais} cab.)</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{vac.carenciaDias} dias</td>
                            <td className="px-6 py-4 text-right"><span className="px-3 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-800">{vac.dataLiberacao || '-'}</span></td>
                                            <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteVacinacao(vac.id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
</tr>
                        ))}
                        {currentVacinacoes.length === 0 && <tr><td colSpan={4} className="text-center py-8 font-bold text-gray-400">Nenhum registo sanitário.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-center text-yellow-800">
                      <CalendarDays className="mr-3" />
                      <div>
                        <h4 className="font-bold">Calendário Sanitário - Estado de Rondônia (IDARON)</h4>
                        <p className="text-sm">Rondônia é área livre de febre aftosa sem vacinação. Consulte o calendário para outras obrigações.</p>
                      </div>
                    </div>
                    <button onClick={() => setIsCalendarioFormOpen(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm flex items-center text-sm"><Plus className="w-4 h-4 mr-1" /> Adicionar Evento</button>
                  </div>
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Doença / Vacina</th><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Mês(es)</th><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Público Alvo</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Status IDARON</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {currentCalendario?.map((cal) => (
                          <tr key={cal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-black text-gray-900">{cal.doenca}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{cal.mes}</td>
                            <td className="px-6 py-4 font-medium text-gray-600">{cal.publico}</td>
                            <td className="px-6 py-4 text-right">
                              {cal.obrigatorio ? <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">Obrigatório</span> : <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">Recomendado</span>}
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

          {/* --- PESAGENS --- */}
          {currentView === 'pesagens' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><Scale className="mr-3 text-orange-500" /> Histórico de Pesagens</h3>
                <button onClick={() => setIsPesagemFormOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Nova Pesagem</button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-orange-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-orange-800 uppercase">Data / Brinco</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Peso Ant.</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Peso Atual</th><th className="px-6 py-4 text-right text-xs font-black text-orange-800 uppercase">Evolução</th></tr><th className="px-6 py-4 text-right">Ações</th>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {currentPesagens.map((pes) => {
                      const diff = pes.pesoAtual - pes.pesoAnterior;
                      return (
                        <tr key={pes.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><span className="block font-bold text-gray-500 text-sm">{pes.data}</span><span className="font-black text-gray-900">BRINCO {pes.brinco}</span></td>
                          <td className="px-6 py-4 text-right font-bold text-gray-600">{pes.pesoAnterior} kg</td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">{pes.pesoAtual} kg</td>
                          <td className="px-6 py-4 text-right font-black"><span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>{diff > 0 ? '+' : ''}{diff} kg</span></td>
                                          <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeletePesagem(pes.id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
</tr>
                      );
                    })}
                    {currentPesagens.length === 0 && <tr><td colSpan={4} className="text-center py-8 font-bold text-gray-400">Nenhuma pesagem registada.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- INSUMOS --- */}
          {currentView === 'insumos' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><Archive className="mr-3 text-purple-600" /> Estoque de Insumos</h3>
                <button onClick={() => setIsInsumoFormOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Novo Insumo</button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-purple-800 uppercase">Produto / Categoria</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Qtd Atual</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Estoque Min.</th><th className="px-6 py-4 text-right text-xs font-black text-purple-800 uppercase">Status</th></tr><th className="px-6 py-4 text-right">Ações</th>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {currentInsumos.map((ins) => {
                      const isCritico = ins.quantidade <= ins.estoqueMinimo;
                      return (
                        <tr key={ins.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><span className="block font-black text-gray-900">{ins.nome}</span><span className="text-sm font-bold text-gray-500">{ins.categoria}</span></td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">{ins.quantidade} {ins.unidade}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-500">{ins.estoqueMinimo} {ins.unidade}</td>
                          <td className="px-6 py-4 text-right">{isCritico ? <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">Crítico</span> : <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">Normal</span>}</td><td className="px-8 py-5"><button onClick={() => handleDeleteInsumo(ins.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td>
                        </tr>
                      );
                    })}
                    {currentInsumos.length === 0 && <tr><td colSpan={4} className="text-center py-8 font-bold text-gray-400">Nenhum insumo registado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- FINANCEIRO --- */}
          {currentView === 'financeiro' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center"><DollarSign className="mr-3 text-green-600" /> Gestão Financeira</h3>
                <button onClick={() => setIsFinanceFormOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center"><Plus className="w-5 h-5 mr-2" /> Lançamento</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-sm font-bold text-gray-400 uppercase">Receitas</p>
                  <p className="text-3xl font-black text-green-600">{formatCurrency(totaisFinanceiros.receitas)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-sm font-bold text-gray-400 uppercase">Despesas</p>
                  <p className="text-3xl font-black text-red-600">{formatCurrency(totaisFinanceiros.despesas)}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
                  <p className="text-sm font-bold text-slate-400 uppercase">Saldo Líquido</p>
                  <p className={`text-3xl font-black ${saldoAtual >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(saldoAtual)}</p>
                </div>
                {/* Card: Custo por Arroba */}
                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center">
                  <p className="text-sm font-bold text-blue-800 uppercase flex items-center"><Activity size={16} className="mr-2" /> Custo por Arroba (@)</p>
                  <p className="text-3xl font-black text-blue-900 mt-1">{formatCurrency(custoPorArroba)}</p>
currentReproducao.map
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Data / Descrição</th><th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Categoria</th><th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Valor</th></tr><th className="px-6 py-4 text-right">Ações</th>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {currentFinanceiro.map((fin) => (
                      <tr key={fin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><span className="block font-bold text-gray-500 text-sm">{fin.data}</span><span className="font-black text-gray-900">{fin.descricao}</span></td>
                        <td className="px-6 py-4 font-bold text-gray-700">{fin.categoria}</td>
                                          <td className="px-6 py-4 text-right font-black text-gray-900">{fin.tipo === 'receita' ? '+' : '-'}{formatCurrency(fin.valor)}</td>
                                                                                  <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteFinanceiro(fin.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></td>
</tr>
                    ))}
                    {currentFinanceiro.length === 0 && <tr><td colSpan={3} className="text-center py-8 font-bold text-gray-400">Nenhuma transação na propriedade atual.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- CONFIGURAÇÕES E ACESSOS --- */}
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
                      {appData.usuarios?.map((usr) => (
                        <tr key={usr.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><span className="block font-black text-gray-900">{usr.nome}</span><span className="text-sm font-bold text-gray-500">{usr.email}</span></td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold mr-2 ${usr.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>{usr.role}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${usr.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{usr.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => openEditUsuario(usr)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                            <button onClick={() => handleDeleteUsuario(usr.id)} className="text-red-500 hover:text-red-700 p-2 ml-2"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bloco: Configuração da IA (Dinâmica) */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl shadow-sm border border-gray-700 p-8 mb-8 text-white relative overflow-hidden">
                <Bot size={140} className="absolute -right-10 -bottom-10 text-white/5" />
                <h3 className="text-2xl font-black flex items-center mb-2"><Sparkles className="mr-3 text-green-400" /> Inteligência Artificial</h3>
                <p className="text-slate-300 font-medium mb-6 max-w-2xl">Para usar os relatórios de IA e o Assistente, insira a sua chave API do Google AI Studio e escolha o modelo.</p>
                <div className="space-y-4 max-w-lg relative z-10">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">API Key (Chave de Acesso)</label>
                    <input 
                      type="password" 
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Cole a sua API Key aqui..." 
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Endereço da API (URL Base)</label>
                    <input 
                      type="text" 
                      value={aiEndpoint}
                      onChange={(e) => setAiEndpoint(e.target.value)}
                      placeholder="Ex: https://generativelanguage.googleapis.com/v1beta/models" 
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Modelo de IA</label>
                    <input 
                      type="text" 
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      placeholder="Ex: gemini-2.5-flash-preview-09-2025" 
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-white font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-bold">Estes dados ficam guardados localmente no seu navegador.</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center">
                <FileSpreadsheet size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">Exportação de Planilhas</h3>
                <p className="text-gray-500 font-medium mb-8">Descarregue os dados da propriedade <b className="text-gray-900">{propriedadeAtiva.nome}</b> em formato CSV idêntico às suas tabelas base.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={exportRebanho} className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-bold px-6 py-3 rounded-xl flex items-center shadow-sm"><Download size={18} className="mr-2"/> Exportar Rebanho</button>
                  <button onClick={exportFinanceiro} className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold px-6 py-3 rounded-xl flex items-center shadow-sm"><Download size={18} className="mr-2"/> Exportar Financeiro</button>
                  <button onClick={exportReproducao} className="bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 font-bold px-6 py-3 rounded-xl flex items-center shadow-sm"><Download size={18} className="mr-2"/> Exportar Reprodução</button>
                  <button onClick={exportParicao} className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold px-6 py-3 rounded-xl flex items-center shadow-sm"><Download size={18} className="mr-2"/> Exportar Parição</button>
                  <button onClick={exportSaude} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold px-6 py-3 rounded-xl flex items-center shadow-sm"><Download size={18} className="mr-2"/> Exportar Saúde</button>
                </div>
              </div>
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
              <button onClick={() => handleDeleteAnimal(selectedAnimal.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-4 rounded-xl font-bold flex items-center transition-colors"><Trash2 size={18} className="mr-2"/> Eliminar</button>
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
                      <option value="">Sem Lote</option>{currentLotes.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sexo</label>
                    <select name="sexo" defaultValue={editingAnimal?.sexo || 'F'} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none"><option value="F">Fêmea</option><option value="M">Macho</option></select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                    <select name="categoria" defaultValue={editingAnimal?.categoria || 'Bezerro'} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none"><option value="Bezerro">Bezerro(a)</option><option value="Novilha">Novilha</option><option value="Vaca">Vaca</option><option value="Garrote">Garrote</option><option value="Boi Gordo">Boi Gordo</option><option value="Touro">Touro</option></select>
                  </div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Raça</label><input required name="raca" defaultValue={editingAnimal?.raca || 'Nelore'} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Data Nasc.</label><input type="date" required name="dataNasc" defaultValue={editingAnimal?.dataNasc || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" /></div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold mb-1">Raça</label><input required name="raca" defaultValue="Nelore" className="w-full px-4 py-3 border rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-1">Peso Base (kg)</label><input required name="peso" type="number" defaultValue="200" className="w-full px-4 py-3 border rounded-xl" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Lote Destino</label>
                    <select name="lote" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none">
                      <option value="">Sem Lote</option>{currentLotes.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                    <select name="categoria" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none"><option value="Bezerro">Bezerro(a)</option><option value="Novilha">Novilha</option><option value="Garrote">Garrote</option><option value="Vaca">Vaca</option><option value="Novilho">Novilho</option><option value="Boi Gordo">Boi Gordo</option><option value="Touro">Touro</option></select>
                  </div>
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

      {/* MODAL: PESAGEM */}
      {isPesagemFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-orange-50 shrink-0">
              <h2 className="text-xl font-black text-orange-900 flex items-center"><Scale className="mr-3 text-orange-600"/> Registar Pesagem</h2>
              <button onClick={() => setIsPesagemFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="pesagemForm" onSubmit={handleAddPesagem} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Brinco *</label><input required name="brinco" className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: 105" /></div>
              <div><label className="block text-sm font-bold mb-1">Peso Atual (kg) *</label><input required type="number" name="pesoAtual" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-1">Data *</label><input required type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl" /></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsPesagemFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="pesagemForm" className="px-6 py-3 rounded-xl font-bold bg-orange-600 text-white">Gravar Peso</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FINANCEIRO */}
      {isFinanceFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-green-50 shrink-0">
              <h2 className="text-xl font-black text-green-900 flex items-center"><DollarSign className="mr-3 text-green-600"/> Lançamento Financeiro</h2>
              <button onClick={() => setIsFinanceFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="financeForm" onSubmit={handleAddFinance} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Descrição *</label><input required name="descricao" className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: Venda Bezerras" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Tipo</label>
                  <select name="tipo" className="w-full px-4 py-3 border rounded-xl"><option value="receita">Receita (+)</option><option value="despesa">Despesa (-)</option></select>
                </div>
                <div><label className="block text-sm font-bold mb-1">Valor (R$) *</label><input required type="number" name="valor" className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Categoria</label><input required name="categoria" defaultValue="Venda" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Data *</label><input required type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <input type="hidden" name="status" value="pago" />
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsFinanceFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="financeForm" className="px-6 py-3 rounded-xl font-bold bg-green-600 text-white">Lançar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VACINAÇÃO */}
      {isVaccineFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-red-50 shrink-0">
              <h2 className="text-xl font-black text-red-900 flex items-center"><Syringe className="mr-3 text-red-600"/> Registar Tratamento</h2>
              <button onClick={() => setIsVaccineFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="vaccineForm" onSubmit={handleAddVaccine} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Vacina / Medicamento *</label><input required name="vacina" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Lote Alvo</label>
                  <select name="lote" className="w-full px-4 py-3 border rounded-xl"><option value="Todo o Rebanho">Todo o Rebanho</option>{currentLotes.map(l=><option key={l.id} value={l.nome}>{l.nome}</option>)}</select>
                </div>
                <div><label className="block text-sm font-bold mb-1">Qtd. Animais</label><input required type="number" name="qtdAnimais" defaultValue="1" className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Data Aplic.</label><input required type="date" name="dataAplicacao" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Carência (Dias)</label><input required type="number" name="carenciaDias" defaultValue="0" className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsVaccineFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="vaccineForm" className="px-6 py-3 rounded-xl font-bold bg-red-600 text-white">Aplicar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOTE / PASTAGEM */}
      {isLoteFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-green-50 shrink-0">
              <h2 className="text-xl font-black text-green-900 flex items-center"><LayoutGrid className="mr-3 text-green-600"/> Adicionar Pastagem</h2>
              <button onClick={() => setIsLoteFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="loteForm" onSubmit={handleAddLote} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Nome do Lote/Piquete *</label><input required name="nome" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Capacidade (Cab.) *</label><input required type="number" name="capacidade" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tipo</label>
                  <select name="tipo" className="w-full px-4 py-3 border rounded-xl"><option value="Pasto">Pasto</option><option value="Baia">Baia / Confinamento</option></select>
                </div>
              </div>
              <div><label className="block text-sm font-bold mb-1">Observações</label><input name="obs" className="w-full px-4 py-3 border rounded-xl" /></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsLoteFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="loteForm" className="px-6 py-3 rounded-xl font-bold bg-green-600 text-white">Criar Lote</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPRODUCAO */}
      {isReproducaoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-pink-50 shrink-0">
              <h2 className="text-xl font-black text-pink-900 flex items-center"><HeartPulse className="mr-3 text-pink-600"/> Registar Inseminação</h2>
              <button onClick={() => setIsReproducaoFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="reproducaoForm" onSubmit={handleAddReproducao} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Brinco da Matriz *</label><input required name="brincoVaca" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Método</label>
                  <select name="metodo" className="w-full px-4 py-3 border rounded-xl"><option value="IA">IA</option><option value="Monta Natural">Monta Natural</option><option value="TE">TE</option></select>
                </div>
                <div><label className="block text-sm font-bold mb-1">Data *</label><input required type="date" name="dataInseminacao" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <div><label className="block text-sm font-bold mb-1">Touro / Semen</label><input name="reprodutor" className="w-full px-4 py-3 border rounded-xl" /></div>
              <input type="hidden" name="status" value="Prenhe" />
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsReproducaoFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="reproducaoForm" className="px-6 py-3 rounded-xl font-bold bg-pink-600 text-white">Registar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NASCIMENTO */}
      {isNascimentoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-blue-50 shrink-0">
              <h2 className="text-xl font-black text-blue-900 flex items-center"><Baby className="mr-3 text-blue-600"/> Registar Nascimento</h2>
              <button onClick={() => setIsNascimentoFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="nascForm" onSubmit={handleAddNascimento} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Brinco Matriz *</label><input required name="brincoMatriz" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Brinco Bezerro *</label><input required name="brincoBezerro" className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Sexo</label>
                  <select name="sexo" className="w-full px-4 py-3 border rounded-xl"><option value="M">M</option><option value="F">F</option></select>
                </div>
                <div><label className="block text-sm font-bold mb-1">Peso (kg)</label><input required type="number" name="pesoNascimento" defaultValue="35" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Data *</label><input required type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <div><label className="block text-sm font-bold mb-1">Raça</label><input required name="raca" defaultValue="Nelore" className="w-full px-4 py-3 border rounded-xl" /></div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsNascimentoFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="nascForm" className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white">Registar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSUMO */}
      {isInsumoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-purple-50 shrink-0">
              <h2 className="text-xl font-black text-purple-900 flex items-center"><Archive className="mr-3 text-purple-600"/> Entrada de Insumo</h2>
              <button onClick={() => setIsInsumoFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="insumoForm" onSubmit={handleAddInsumo} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Nome do Produto *</label><input required name="nome" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Categoria</label><input required name="categoria" defaultValue="Nutrição" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Unidade</label><input required name="unidade" placeholder="kg, litros..." className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Qtd Adquirida *</label><input required type="number" name="quantidade" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Alerta Mínimo *</label><input required type="number" name="estoqueMinimo" defaultValue="10" className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsInsumoFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="insumoForm" className="px-6 py-3 rounded-xl font-bold bg-purple-600 text-white">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROPRIEDADE */}
      {isPropriedadeFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-blue-50 shrink-0">
              <h2 className="text-xl font-black text-blue-900 flex items-center"><MapPin className="mr-3 text-blue-600"/> Adicionar Propriedade</h2>
              <button onClick={() => setIsPropriedadeFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="propriedadeForm" onSubmit={handleAddPropriedade} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Nome da Fazenda *</label><input required name="nome" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-1">Responsável *</label><input required name="responsavel" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Cidade</label><input required name="cidade" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Estado (UF)</label><input required name="estado" maxLength={2} className="w-full px-4 py-3 border rounded-xl uppercase" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Área Total (ha)</label><input required type="number" name="area_ha" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Insc. Estadual</label><input name="ie" className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsPropriedadeFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="propriedadeForm" className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UTILIZADOR */}
      {isUsuarioFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-indigo-50 shrink-0">
              <h2 className="text-xl font-black text-indigo-900 flex items-center"><Users className="mr-3 text-indigo-600"/> {editingUsuario ? 'Editar Operador' : 'Convite de Acesso'}</h2>
              <button onClick={() => { setIsUsuarioFormOpen(false); setEditingUsuario(null); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="usuarioForm" onSubmit={handleSaveUsuario} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Nome Completo *</label>
                <input required name="nome" defaultValue={editingUsuario?.nome || ''} className="w-full px-4 py-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email de Acesso *</label>
                <input required type="email" name="email" defaultValue={editingUsuario?.email || ''} className="w-full px-4 py-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Senha de Acesso *</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input required type="text" name="senha" defaultValue={editingUsuario?.senha || ''} className="w-full pl-10 pr-4 py-3 border rounded-xl" placeholder="Defina a senha..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Nível de Permissão</label>
                <select name="role" defaultValue={editingUsuario?.role || 'Operador'} className="w-full px-4 py-3 border rounded-xl">
                  <option value="Operador">Operador (Regista dados)</option>
                  <option value="Admin">Administrador (Acesso total)</option>
                  <option value="Leitor">Leitor (Apenas visualização)</option>
                </select>
              </div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => { setIsUsuarioFormOpen(false); setEditingUsuario(null); }} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="usuarioForm" className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white">{editingUsuario ? 'Guardar' : 'Criar e Enviar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CALENDÁRIO SANITÁRIO */}
      {isCalendarioFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-yellow-50 shrink-0">
              <h2 className="text-xl font-black text-yellow-900 flex items-center"><CalendarDays className="mr-3 text-yellow-600"/> Adicionar ao Calendário</h2>
              <button onClick={() => setIsCalendarioFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="calendarioForm" onSubmit={handleAddCalendario} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Doença / Tratamento *</label><input required name="doenca" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-1">Mês de Aplicação *</label><input required name="mes" placeholder="Ex: Maio e Novembro" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-1">Público Alvo</label><input required name="publico" placeholder="Ex: Fêmeas 3 a 8 meses" className="w-full px-4 py-3 border rounded-xl" /></div>
              <div>
                <label className="block text-sm font-bold mb-1">Status IDARON</label>
                <select name="obrigatorio" className="w-full px-4 py-3 border rounded-xl">
                  <option value="true">Obrigatório</option>
                  <option value="false">Recomendado</option>
                </select>
              </div>
            </form>
            <div className="flex justify-end p-6 border-t border-gray-100 space-x-3">
              <button onClick={() => setIsCalendarioFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">Cancelar</button>
              <button type="submit" form="calendarioForm" className="px-6 py-3 rounded-xl font-bold bg-yellow-600 text-white">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

      {/* MODAL: EMAIL NOVO USUÁRIO */}
    {emailModalData && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Mail className="mr-3 text-indigo-600" /> Credenciais do Novo Usuário
          </h2>
          
          <div className="bg-indigo-50 p-4 rounded-xl mb-6 space-y-2">
            <p><strong>Nome:</strong> {emailModalData.nome}</p>
            <p><strong>Email:</strong> {emailModalData.email}</p>
            <p><strong>Senha:</strong> <code className="bg-white px-2 py-1 rounded">{emailModalData.senha}</code></p>
            <p><strong>Permissão:</strong> {emailModalData.role}</p>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Copie estas credenciais antes de enviar o email. Clique abaixo para abrir seu cliente de email com uma mensagem pré-formatada.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setEmailModalData(null)}
              className="flex-1 px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Fechar
            </button>
            <button
              onClick={handleSendEmail}
              className="flex-1 px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center"
            >
              <Mail className="mr-2" size={20} /> Enviar Email
            </button>
          </div>
        </div>
      </div>
    )}
}
