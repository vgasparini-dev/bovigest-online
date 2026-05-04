// src/data/defaultData.js
export const defaultData = {
  propriedades: [{ id: 1, nome: 'Minha Fazenda', responsavel: 'Gestor', cidade: 'Local', estado: 'BR', area_ha: 100, ie: '' }],
  usuarios: [{ id: 1, nome: 'Administrador', email: 'admin@bovigest.com', senha: 'admin', role: 'Admin', status: 'Ativo' }],
  calendarioSanitario: [
    { id: 1, propriedadeId: 1, doenca: 'Febre Aftosa', mes: 'Maio / Novembro', publico: 'Bovinos', obrigatorio: true },
    { id: 2, propriedadeId: 1, doenca: 'Brucelose', mes: 'Qualquer', publico: 'Femeas 3-8m', obrigatorio: true },
    { id: 3, propriedadeId: 1, doenca: 'Raiva', mes: 'Maio', publico: 'Todo Rebanho', obrigatorio: true },
    { id: 4, propriedadeId: 1, doenca: 'Vermifugacao', mes: 'Maio/Ago/Nov', publico: 'Rebanho', obrigatorio: false },
  ],
  lotes: [], animais: [], pesagens: [], reproducao: [], nascimentos: [],
  vacinacoes: [], insumos: [], financeiro: [], anotacoes: [], producaoLeite: [],
  bibliotecaAlimentos: [
    { id: 1, nome: 'Silagem Milho', ms: 35, elm: 1.45, elg: 0.90, pm: 55, ca: 2.5, p: 2.0, precoKg: 0.25 },
    { id: 2, nome: 'Milho Grao', ms: 88, elm: 2.18, elg: 1.50, pm: 65, ca: 0.3, p: 3.0, precoKg: 1.20 },
  ],
};
