import { createContext, useContext, useReducer, useCallback } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        loading: false,
      };
    case 'LOGIN':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        token: null,
        user: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  if (state.loading) {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    dispatch({
      type: 'INIT',
      payload: {
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null,
      },
    });
  }

  const login = useCallback((token, userData = null) => {
    localStorage.setItem('authToken', token);
    if (userData) {
      localStorage.setItem('authUser', JSON.stringify(userData));
    }
    dispatch({
      type: 'LOGIN',
      payload: {
        token,
        user: userData,
      },
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    login,
    logout,
    loading: state.loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
