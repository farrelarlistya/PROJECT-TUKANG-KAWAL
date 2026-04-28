/**
 * AppContext.jsx — Global state: Auth + UI preferences
 */
import { createContext, useReducer, useEffect, useCallback, useContext } from 'react';
import { DEFAULT_USERS, USER_ROLES } from '@/utils/constants';

// --- Auth Reducer ---
const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  SET_USERS: 'SET_USERS',
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return { ...state, user: action.payload, isAuthenticated: true };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, isAuthenticated: false };
    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    case AUTH_ACTIONS.DELETE_ACCOUNT:
      return { ...state, user: null, isAuthenticated: false };
    case AUTH_ACTIONS.SET_USERS:
      return { ...state, registeredUsers: action.payload };
    default:
      return state;
  }
}

function getInitialState() {
  try {
    const stored = localStorage.getItem('currentUser');
    const user = stored ? JSON.parse(stored) : null;
    const storedUsers = localStorage.getItem('registeredUsers');
    const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [...DEFAULT_USERS];
    return {
      user,
      isAuthenticated: !!user,
      registeredUsers,
    };
  } catch {
    return { user: null, isAuthenticated: false, registeredUsers: [...DEFAULT_USERS] };
  }
}

// --- Toast State ---
const ToastContext = createContext(null);
const AuthContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, null, getInitialState);
  const [toasts, setToasts] = useReducer(toastReducer, []);

  // Persist user to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('currentUser', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [state.user]);

  // Persist registered users
  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(state.registeredUsers));
  }, [state.registeredUsers]);

  const login = useCallback((identifier, password) => {
    const user = state.registeredUsers.find(
      u => (u.email === identifier || u.username === identifier) && u.password === password
    );
    if (user) {
      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        initials: user.initials,
        fullName: user.fullName,
      };
      dispatch({ type: AUTH_ACTIONS.LOGIN, payload: userData });
      return { success: true, user: userData };
    }
    return { success: false, error: 'Username/Email atau Password salah.' };
  }, [state.registeredUsers]);

  const register = useCallback((fullName, username, email, password) => {
    // Check duplicate
    const exists = state.registeredUsers.find(u => u.email === email || u.username === username);
    if (exists) {
      return { success: false, error: 'Email atau username sudah terdaftar.' };
    }
    const initials = fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const newUser = {
      id: Date.now(),
      email,
      username,
      password,
      role: USER_ROLES.USER,
      initials,
      fullName,
    };
    const updatedUsers = [...state.registeredUsers, newUser];
    dispatch({ type: AUTH_ACTIONS.SET_USERS, payload: updatedUsers });
    return { success: true };
  }, [state.registeredUsers]);

  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updates });
  }, []);

  const updatePassword = useCallback((oldPassword, newPassword) => {
    const user = state.registeredUsers.find(u => u.id === state.user?.id);
    if (!user || user.password !== oldPassword) {
      return { success: false, error: 'Kata sandi lama salah!' };
    }
    const updatedUsers = state.registeredUsers.map(u =>
      u.id === state.user.id ? { ...u, password: newPassword } : u
    );
    dispatch({ type: AUTH_ACTIONS.SET_USERS, payload: updatedUsers });
    return { success: true };
  }, [state.registeredUsers, state.user]);

  const deleteAccount = useCallback(() => {
    const updatedUsers = state.registeredUsers.filter(u => u.id !== state.user?.id);
    dispatch({ type: AUTH_ACTIONS.SET_USERS, payload: updatedUsers });
    dispatch({ type: AUTH_ACTIONS.DELETE_ACCOUNT });
    localStorage.removeItem('userProfile');
  }, [state.registeredUsers, state.user]);

  const upgradeToMember = useCallback(() => {
    const updatedUsers = state.registeredUsers.map(u =>
      u.id === state.user?.id ? { ...u, role: USER_ROLES.MEMBER } : u
    );
    dispatch({ type: AUTH_ACTIONS.SET_USERS, payload: updatedUsers });
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: { role: USER_ROLES.MEMBER } });
  }, [state.registeredUsers, state.user]);

  const addToast = useCallback((message, type = 'info') => {
    setToasts({ type: 'ADD', payload: { id: Date.now(), message, type } });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts({ type: 'REMOVE', payload: id });
  }, []);

  return (
    <AuthContext.Provider value={{
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isMember: state.user?.role === USER_ROLES.MEMBER,
      isAdmin: state.user?.role === USER_ROLES.ADMIN,
      login,
      register,
      logout,
      updateUser,
      updatePassword,
      deleteAccount,
      upgradeToMember,
    }}>
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        {children}
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter(t => t.id !== action.payload);
    default:
      return state;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AppProvider');
  return context;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within AppProvider');
  return context;
}
