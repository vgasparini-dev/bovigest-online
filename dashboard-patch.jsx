{currentView === 'dashboard' && (() => {
  // Dashboard computed values
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Alertas: animais em carência
  const animaisCarencia = cVac.filter(v =>
    v.dataLiberacao && new Date(v.dataLiberacao) > hoje
  );

  // Alertas: vacinas do calendário próximas (mês atual / próximo mês)
  const mesesProximos = [
    hoje.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
    new Date(anoAtual, mesAtual + 1, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())
  ];
  const vacProximas = cCal.filter(c =>
    mesesProximos.some(m => c.mes?.includes(m)) || c.mes?.includes('Qualquer')
  );

  // Alertas: insumos críticos
  const insumosCriticos = cInsumos.filter(i =>
    Number(i.quantidade || 0) <= Number(i.estoqueMinimo || 0)
  );

  const totalAlertas = animaisCarencia.length + vacProximas.length + insumosCriticos.length;

  // Atividades recentes
  const recentes = [
    ...cPesagens.slice(-4).map(p => ({ tipo: 'pesagem', icone: '⚖️', cor: 'bg-orange-100 text-orange-600', desc: `Pesagem: Brinco ${p.brinco} → ${p.pesoAtual} kg`, data: p.data })),
    ...cVac.slice(-4).map(v => ({ tipo: 'vacina', icone: '💉', cor: 'bg-red-100 text-red-600', desc: `Vacinação: ${v.vacina} — Lote ${v.lote}`, data: v.dataAplicacao })),
    ...cNasc.slice(-4).map(n => ({ tipo: 'nascimento', icone: '🐄', cor: 'bg-blue-100 text-blue-600', desc: `Nascimento: Bezerro ${n.brincoBezerro} (M: ${n.brincoMatriz})`, data: n.data })),
  ]
    .filter(x => x.data)
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 6);

  // Financeiro do mês
  const finMes = cFin.filter(f => f.data && new Date(f.data).getMonth() === mesAtual && new Date(f.data).getFullYear() === anoAtual);
  const recMes = finMes.filter(f => f.tipo === 'receita' && f.status === 'pago').reduce((acc, f) => acc + Number(f.valor || 0), 0);
  const desMes = finMes.filter(f => f.tipo === 'despesa' && f.status === 'pago').reduce((acc, f) => acc + Number(f.valor || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards originais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="text-3xl font-black text-blue-600 mb-1">{cAnimais.length}</div><div className="text-xs font-bold text-gray-500">Cabeças</div></div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="text-3xl font-black text-green-600 mb-1">{formatCurrency(saldoAtual)}</div><div className="text-xs font-bold text-gray-500">Saldo Global</div></div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="text-3xl font-black text-cyan-600 mb-1">{totalLeiteMes} L</div><div className="text-xs font-bold text-gray-500">Leite Mês</div></div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="text-3xl font-black text-pink-600 mb-1">{cRep.filter(r => r.status === 'Prenhe').length}</div><div className="text-xs font-bold text-gray-500">Prenhes</div></div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="flex items-center gap-2 mb-1"><span className="text-2xl">♀</span><div className="text-3xl font-black text-purple-600">{cAnimais.filter(a => a.sexo === 'F').length}</div></div><div className="text-xs font-bold text-gray-500">Fêmeas</div></div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm"><div className="flex items-center gap-2 mb-1"><span className="text-2xl">♂</span><div className="text-3xl font-black text-indigo-600">{cAnimais.filter(a => a.sexo === 'M').length}</div></div><div className="text-xs font-bold text-gray-500">Machos</div></div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alertas */}
          <div className="bg-white rounded-3xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2"><AlertTriangle size={20} className="text-orange-500" />Alertas</h3>
              <span className={`text-2xl font-black ${totalAlertas > 0 ? 'text-red-600' : 'text-green-600'}`}>{totalAlertas}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <ShieldAlert size={18} className="text-red-600 mb-2" />
                <div className="text-2xl font-black text-red-700">{animaisCarencia.length}</div>
                <div className="text-xs font-bold text-red-600 mt-1">Em Carência</div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <CalendarDays size={18} className="text-amber-600 mb-2" />
                <div className="text-2xl font-black text-amber-700">{vacProximas.length}</div>
                <div className="text-xs font-bold text-amber-600 mt-1">Vacinas Próximas</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <PackagePlus size={18} className="text-orange-600 mb-2" />
                <div className="text-2xl font-black text-orange-700">{insumosCriticos.length}</div>
                <div className="text-xs font-bold text-orange-600 mt-1">Insumos Críticos</div>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white rounded-3xl border shadow-sm">
            <div className="p-6 border-b flex items-center gap-2">
              <Activity size={20} className="text-gray-700" />
              <h3 className="text-lg font-black">Atividades Recentes</h3>
            </div>
            <div className="divide-y">
              {recentes.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm font-bold">Nenhuma atividade recente</div>
              ) : (
                recentes.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${r.cor}`}>{r.icone}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{r.desc}</p>
                      <p className="text-xs text-gray-500">{r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calendário Sanitário */}
          <div className="bg-white rounded-3xl border shadow-sm">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={20} className="text-blue-600" />
                <h3 className="text-lg font-black">Calendário Sanitário</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{vacProximas.length} próximos</span>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {vacProximas.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm font-bold">Nenhuma vacina próxima</div>
              ) : (
                vacProximas.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-blue-50/50">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-blue-600 uppercase leading-none">{(c.mes || '').slice(0, 3)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{c.doenca}</p>
                      <p className="text-xs text-gray-500">{c.publico}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${c.obrigatorio ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.obrigatorio ? 'Obrig.' : 'Recom.'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumo Financeiro do Mês */}
          <div className="bg-white rounded-3xl border shadow-sm p-6">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2"><DollarSign size={20} className="text-green-600" />Financeiro do Mês</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">Receitas</div>
                <div className="text-2xl font-black text-green-600">{formatCurrency(recMes)}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">Despesas</div>
                <div className="text-2xl font-black text-red-600">{formatCurrency(desMes)}</div>
              </div>
            </div>
            <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full" style={{ width: `${recMes > 0 ? Math.min((recMes / (recMes + desMes)) * 100, 100) : 0}%` }} />
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm font-bold text-gray-500">Saldo do Mês: </span>
              <span className={`text-lg font-black ${recMes - desMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(recMes - desMes)}</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status Firebase */}
          <div className={`rounded-3xl border p-5 shadow-sm ${cloudStatus === 'online' ? 'bg-blue-50 border-blue-100' : cloudStatus === 'error' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              {cloudStatus === 'online' ? <Cloud size={22} className="text-blue-600" /> : cloudStatus === 'error' ? <CloudOff size={22} className="text-red-500" /> : <Loader2 size={22} className="text-gray-400 animate-spin" />}
              <div>
                <p className="font-black text-sm">
                  {cloudStatus === 'online' ? 'Firebase Sincronizado' : cloudStatus === 'error' ? 'Erro de Sincronização' : 'Conectando...'}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {cloudStatus === 'online' ? 'Dados em tempo real na nuvem' : cloudStatus === 'error' ? 'Verifique a ligação à internet' : 'A estabelecer ligação...'}
                </p>
              </div>
              <div className={`ml-auto w-3 h-3 rounded-full ${cloudStatus === 'online' ? 'bg-green-500 animate-pulse' : cloudStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`} />
            </div>
          </div>

          {/* Mini KPIs */}
          <div className="bg-white rounded-3xl border shadow-sm p-5">
            <p className="text-xs font-black text-gray-400 uppercase mb-3">Resumo do Rebanho</p>
            <div className="space-y-2.5">
              {[
                { label: 'Peso médio', value: `${pesoMedio} kg`, color: 'text-blue-600' },
                { label: 'Pesagens registadas', value: cPesagens.length, color: 'text-orange-600' },
                { label: 'Nascimentos', value: cNasc.length, color: 'text-green-600' },
                { label: 'Vacinações', value: cVac.length, color: 'text-red-600' },
                { label: 'Insumos ativos', value: cInsumos.length, color: 'text-purple-600' },
                { label: 'Lotes', value: cLotes.length, color: 'text-teal-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">{item.label}</span>
                  <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})()}
