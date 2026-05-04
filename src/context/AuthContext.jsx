// src/context/AuthContext.jsx
// Context API para gerenciamento de autenticação global
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, signInAnonymously, onAuthStateChanged, doc, setDoc, getDoc } from '../services/firebase';
import { defaultData } from '../data/defaultData';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // usuário do sistema (bovigest)
  const [firebaseUser, setFirebaseUser] = useState(null); // usuário firebase anônimo
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Autenticação anônima Firebase
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogin = async (email, senha) => {
    setIsLoginLoading(true);
    setLoginError('');
    try {
      const docSnap = await getDoc(doc(db, 'bovigest_users', email));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const arr = (v) => Array.isArray(v) ? v : [];
        const found = arr(data.usuarios).find(u => u.email === email);
        if (found && found.senha === senha) {
          setUser(found);
          setIsLoggedIn(true);
          setIsLoginLoading(false);
          return { success: true, data };
        } else {
          setLoginError('Senha incorreta.');
        }
      } else {
        // Criar novo usuário
        const newData = { ...defaultData };
        newData.usuarios = [{ id: Date.now(), nome: email.split('@')[0], email, senha, role: 'Admin', status: 'Ativo' }];
        await setDoc(doc(db, 'bovigest_users', email), newData);
        setUser(newData.usuarios[0]);
        setIsLoggedIn(true);
        setIsLoginLoading(false);
        return { success: true, data: newData };
      }
    } catch (err) {
      setLoginError('Erro na nuvem. Tente novamente.');
    }
    setIsLoginLoading(false);
    return { success: false };
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    user,
    firebaseUser,
    isLoggedIn,
    loading,
    loginError,
    isLoginLoading,
    handleLogin,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
