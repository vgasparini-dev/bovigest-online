import { put, head, getDownloadUrl } from '@vercel/blob';

const BLOB_KEY = 'bovigest-usuarios.json';

const DEFAULT_USUARIOS = [
  { id: 1, nome: 'Victor Luiz Gasparini', email: 'victorluizgasparini@gmail.com', senha: 'Lu1z1502#', role: 'Admin', status: 'Ativo' },
  { id: 2, nome: 'Lucas Winter', email: 'lucasff99@hotmail.com', senha: '123456', role: 'Operador', status: 'Ativo' },
  { id: 3, nome: 'Vivtor', email: 'victorluizgasparini@hotmail.com', senha: '22023342', role: 'Operador', status: 'Ativo' },
];

async function getUsuarios() {
  try {
    const info = await head(BLOB_KEY);
    const res = await fetch(info.url);
    return await res.json();
  } catch {
    return DEFAULT_USUARIOS;
  }
}

async function saveUsuarios(usuarios) {
  const blob = new Blob([JSON.stringify(usuarios)], { type: 'application/json' });
  await put(BLOB_KEY, blob, { access: 'public', allowOverwrite: true });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const usuarios = await getUsuarios();

  if (req.method === 'GET') {
    const { action, email, senha } = req.query;
    if (action === 'login') {
      const user = usuarios.find(u => u.email === email && u.senha === senha);
      if (user) return res.status(200).json({ success: true, user });
      return res.status(401).json({ success: false, error: 'Credenciais invalidas' });
    }
    return res.status(200).json(usuarios.map(u => ({ ...u, senha: undefined })));
  }

  if (req.method === 'POST') {
    const { action, usuario } = req.body;
    if (action === 'save') {
      const idx = usuarios.findIndex(u => u.id === usuario.id);
      if (idx >= 0) usuarios[idx] = usuario;
      else usuarios.push(usuario);
      await saveUsuarios(usuarios);
      return res.status(200).json({ success: true });
    }
    if (action === 'delete') {
      const filtered = usuarios.filter(u => u.id !== usuario.id);
      await saveUsuarios(filtered);
      return res.status(200).json({ success: true });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
