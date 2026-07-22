import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api, { setAuthToken, getAuthToken } from '../api/axios';

const AuthContext = createContext(null);

// Turns the backend's role name ("Admin", "Doctor", "Receptionist")
// into the lowercase form the routes/ProtectedRoute checks use.
const normalizeRole = (roleName) => (roleName || '').toLowerCase();

const mapMeResponseToUser = (me) => ({
  id: me.id,
  username: me.username,
  email: me.email,
  role: normalizeRole(me.role_name),
  doctorId: me.doctor_id || null,
  patientId: me.patient_id || null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const res = await api.get('/auth/me');
    return mapMeResponseToUser(res.data);
  }, []);

  // On first mount there is nothing in memory to restore (by design -
  // no localStorage), so we're never "logged in" after a hard refresh.
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const loginRes = await api.post('/auth/login', { email, password });
      const { access_token } = loginRes.data;

      setAuthToken(access_token);

      const currentUser = await fetchCurrentUser();
      setUser(currentUser);

      return { success: true, user: currentUser };
    } catch (err) {
      setAuthToken(null);
      const detail = err.response?.data?.detail;

      return {
        success: false,
        error: typeof detail === 'string'
          ? detail
          : 'Invalid email or password.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, roleId) => {
    try {
      setLoading(true);

      const registerRes = await api.post('/auth/register', {
        username,
        email,
        password,
        role_id: roleId,
      });

      const { access_token } = registerRes.data;

      // Save JWT token
      setAuthToken(access_token);

      // Fetch logged-in user details
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);

      return {
        success: true,
        user: currentUser,
      };
    } catch (err) {
      setAuthToken(null);

      const detail = err.response?.data?.detail;

      return {
        success: false,
        error:
          typeof detail === 'string'
            ? detail
            : 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: getAuthToken(),
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};