import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Newsletter from "./pages/Newsletter";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-golden">Carregando...</p>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute adminOnly={true}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newsletter"
          element={
            <ProtectedRoute adminOnly={true}>
              <Newsletter />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
