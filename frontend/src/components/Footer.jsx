import React from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettingsContext } from '../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettingsContext();

  if (!settings) return null;

  return (
    <footer className="bg-black text-white border-t border-golden/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            {settings.logo_footer ? (
              <img 
                src={settings.logo_footer}
                alt="Quero Roupas"
                className="h-8 mb-4 brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              <h3 className="text-2xl font-serif text-golden mb-4">Quero Roupas</h3>
            )}
            <p className="text-gray-400 text-sm">
              Elegância e sofisticação em moda feminina. Descubra peças exclusivas que realçam sua beleza única.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-golden font-medium mb-4 tracking-wider uppercase text-sm">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-golden transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-400 hover:text-golden transition-colors text-sm">
                  Catálogo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-golden font-medium mb-4 tracking-wider uppercase text-sm">Contato</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400 text-sm">
                <Phone className="w-4 h-4 mr-2 text-golden" />
                {settings.phone}
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="w-4 h-4 mr-2 text-golden" />
                {settings.email}
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-golden" />
                {settings.city}, Brasil
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-golden font-medium mb-4 tracking-wider uppercase text-sm">Redes Sociais</h4>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-golden/10 hover:bg-golden/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5 text-golden" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-golden/10 hover:bg-golden/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5 text-golden" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-golden/20 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Quero Roupas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;