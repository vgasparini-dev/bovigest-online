import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  UserMinus,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";

// Se você já tem firebase no projeto, troque este import pelo seu arquivo real:
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50";
  const variants = {
    primary: "bg-green-700 text-white hover:bg-green-800",
    secondary: "bg-green-100 text-green-800 hover:bg-green-200",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    admin: "bg-purple-100 text-purple-800",
    operador: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function AccessManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Operador",
    status: "Ativo",
  });

  const docRef = useMemo(() => {
    return doc(db, "bovigest_admin", "users_data");
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          setUsers(snapshot.data().usuarios || []);
        } else {
          await setDoc(docRef, { usuarios: [] });
          setUsers([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar usuários:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "Admin").length,
      operadores: users.filter((u) => u.role === "Operador").length,
      inativos: users.filter((u) => u.status === "Inativo").length,
    };
  }, [users]);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSaveUser() {
    if (!formData.name || !formData.email) return;

    let updatedUsers = [...users];

    if (currentUser) {
      updatedUsers = updatedUsers.map((u) =>
        u.id === currentUser.id ? { ...u, ...formData } : u
      );
    } else {
      updatedUsers.push({
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
    }

    await setDoc(docRef, { usuarios: updatedUsers }, { merge: true });
    closeFormModal();
  }

  async function handleDeleteUser() {
    if (!currentUser) return;
    const updatedUsers = users.filter((u) => u.id !== currentUser.id);
    await setDoc(docRef, { usuarios: updatedUsers }, { merge: true });
    setIsDeleteModalOpen(false);
    setCurrentUser(null);
  }

  function openFormModal(user = null) {
    if (user) {
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setCurrentUser(null);
      setFormData({
        name: "",
        email: "",
        role: "Operador",
        status: "Ativo",
      });
    }
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    setIsFormModalOpen(false);
    setCurrentUser(null);
  }

  function openDeleteModal(user) {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  }

  function getInitials(name = "") {
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="text-sm text-gray-500">Controle de acesso ao sistema.</p>
        </div>
        <Button onClick={() => openFormModal()}>
          <Plus size={18} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500">Total de Usuários</p><h3 className="text-2xl font-bold">{stats.total}</h3></div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><ShieldCheck size={24} /></div>
          <div><p className="text-sm text-gray-500">Administradores</p><h3 className="text-2xl font-bold">{stats.admins}</h3></div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="bg-green-100 p-3 rounded-full text-green-600"><CheckCircle2 size={24} /></div>
          <div><p className="text-sm text-gray-500">Operadores</p><h3 className="text-2xl font-bold">{stats.operadores}</h3></div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="bg-red-100 p-3 rounded-full text-red-600"><UserMinus size={24} /></div>
          <div><p className="text-sm text-gray-500">Inativos</p><h3 className="text-2xl font-bold">{stats.inativos}</h3></div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Diretório de Acesso</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Cargo / Permissão</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Carregando dados do Firebase...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center border border-green-200">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.role === "Admin" ? "admin" : "operador"}>{u.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.status === "Ativo" ? "success" : "danger"}>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openFormModal(u)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteModal(u)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={currentUser ? "Editar Usuário" : "Novo Usuário"}
      >
        <div className="space-y-4 py-2">
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="w-full rounded-md border px-3 py-2"
            type="email"
            placeholder="email@fazenda.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              className="w-full rounded-md border px-3 py-2"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Operador">Operador</option>
              <option value="Admin">Administrador</option>
            </select>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" onClick={closeFormModal}>Cancelar</Button>
            <Button onClick={handleSaveUser}>Salvar Dados</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="py-4 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-1">Remover acesso?</h4>
          <p className="text-sm text-gray-500">
            Tem certeza que deseja excluir o usuário <span className="font-semibold text-gray-900">{currentUser?.name}</span>?
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Sim, Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
