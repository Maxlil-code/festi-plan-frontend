import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
        isAuthenticated: true,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isLoading: false,
      };
    default:
      return state;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = (responseData) => {
    // Handle backend response structure: { data: { user, token } }
    const { data } = responseData;
    const { user, token } = data;
    const role = user.role; // Extract role from user object
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: AUTH_ACTIONS.LOGIN,
      payload: { user, token, role },
    });
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');

    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Refresh token function
  const refreshToken = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }

    dispatch({
      type: AUTH_ACTIONS.REFRESH_TOKEN,
      payload: { token: newToken, user: userData },
    });
  };

  // Set loading state
  const setLoading = (loading) => {
    dispatch({
      type: AUTH_ACTIONS.SET_LOADING,
      payload: loading,
    });
  };

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && state.token) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({
          type: AUTH_ACTIONS.LOGIN,
          payload: {
            user,
            token: state.token,
            role: state.role,
          },
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    }
  }, []);

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
