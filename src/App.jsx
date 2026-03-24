Edit, Baby, LayoutDashboard, Scale, Settings,
  Sparkles, Bot, Send, Loader2, CheckCircle2, Download,
  Archive, Target, PackagePlus, AlertTriangle, ListPlus, ShieldAlert,
  Wheat, Calculator, FileText, Syringe, CalendarCheck
  Wheat, Calculator, FileText, Syringe, CalendarCheck, Users
} from 'lucide-react';

// --- BASE DE DADOS INICIAL ---
@@ -103,6 +103,7 @@ export default function App() {
    const [editingPropriedade, setEditingPropriedade] = useState(null);
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [usuarios, setUsuarios] = useState([{ id: 1, nome: "Administrador", email: "gestor@bovigest.com", senha: "123456", tipo: "admin" }]);
      const [propriedadeAtiva, setPropriedadeAtiva] = useState(1); // ID da propriedade ativa

  // Estados Nutrição
  const [nutriAlvoPeso, setNutriAlvoPeso] = useState(400);
@@ -456,8 +457,8 @@ export default function App() {
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold mr-3 shrink-0 shadow-lg">JS</div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{appData.propriedades[0].nome}</p>
              <p className="text-xs font-medium text-slate-400 truncate">{appData.propriedades[0].responsavel}</p>
              <p className="font-bold text-sm text-white truncate">{appData.propriedades.find(p => p.id === propriedadeAtiva).nome}</p>
              <p className="text-xs font-medium text-slate-400 truncate">{appData.propriedades.find(p => p.id === propriedadeAtiva).responsavel}</p>
            </div>
          </div>
        </div>
@@ -992,6 +993,22 @@ export default function App() {
        <div className="animate-in fade-in space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-gray-900">Minhas Propriedades</h3>

                    <div className="bg-blue-50 p-6 rounded-2xl mb-6 border-2 border-blue-200">
          <h4 className="text-lg font-bold text-blue-900 mb-3">📍 Propriedade Ativa</h4>
          <select 
            value={propriedadeAtiva} 
            onChange={(e) => setPropriedadeAtiva(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/20"
>
            {appData.propriedades.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.nome} - {prop.cidade}/{prop.estado}
              </option>
            ))}
          </select>
          <p className="text-xs text-blue-700 mt-2">Esta será a propriedade exibida na sidebar e usada como padrão.</p>
        </div>
            <button onClick={() => { setEditingPropriedade(null); setIsPropriedadeFormOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold flex items-center shadow-md">
              <Plus className="w-5 h-5 mr-2" /> Nova Propriedade
            </button>
@@ -1035,6 +1052,43 @@ export default function App() {
                    <button onClick={() => { if(confirm('APAGAR TUDO?')) { localStorage.removeItem('bovigest_data_pro_v11'); window.location.reload(); } }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center"><Trash2 size={18} className="mr-2"/> Formatar Sistema</button>
                  </div>
                </div>

                              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-green-600" />
                  Gestão de Usuários (Admin)
                </h4>
                <p className="text-sm text-gray-600 mb-4">Gerencie os usuários que terão acesso ao sistema. Administradores têm acesso total.</p>
                
                <button
                  onClick={() => setIsUserFormOpen(true)}
                  className="mb-4 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold shadow-md flex items-center transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" /> Novo Usuário
                </button>

                <div className="space-y-3">
                  {usuarios.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <p className="font-bold text-gray-900">{user.nome}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className={`text-xs px-3 py-1 rounded-full mt-1 inline-block ${user.tipo === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                      </div>
                      {user.id !== 1 && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
