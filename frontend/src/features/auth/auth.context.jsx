import { createContext } from "react";
import { useState } from "react";
import {
  register,
  login,
  logout,
  getUserDetails,
} from "./services/auth.api.js";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await register(username, email, password);
      setUser(response.user);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await login(email, password);
      setUser(response.user);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await logout();
      setUser(null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMe = async () => {
    try {
      const response = await getUserDetails();
      setUser(response.user);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
        handleGetMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
