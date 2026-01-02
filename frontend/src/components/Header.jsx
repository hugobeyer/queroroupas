import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Heart, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettingsContext } from '../context/SettingsContext';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { settings } = useSettingsContext();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Catálogo', path: '/catalog' },
  ];

  if (isAdmin()) {
    navLinks.push(
      { name: 'Admin', path: '/admin' },
      { name: 'Newsletter', path: '/newsletter' },
      { name: 'Configurações', path: '/settings' }
    );
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const logoUrl = settings?.logo_header || "https://customer-assets.emergentagent.com/job_ladies-boutique-1/artifacts/nk1o3pp5_queroroupas-text-logo.png";

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-golden/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl}
              alt="Quero Roupas"
              className="h-8 brightness-0 invert"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wider uppercase transition-colors ${
                  isActive(link.path)
                    ? 'text-golden border-b-2 border-golden pb-1'
                    : 'text-white hover:text-golden'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-golden transition-colors p-2">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-golden transition-colors p-2 relative">
              <Heart className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-golden transition-colors p-2 relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-golden text-black text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-white text-sm">{user?.name}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-golden"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-golden"
                >
                  <User className="w-4 h-4 mr-1" />
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-golden transition-colors p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-golden/20">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 text-sm tracking-wider uppercase transition-colors ${
                  isActive(link.path) ? 'text-golden' : 'text-white hover:text-golden'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <div className="text-white py-3 text-sm">{user?.name}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:text-golden py-3 text-sm tracking-wider uppercase w-full text-left"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 text-sm tracking-wider uppercase text-white hover:text-golden"
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;