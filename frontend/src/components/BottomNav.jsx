import React from 'react';
import {
  Home,
  Sprout,
  Droplets,
  CloudRain,
  MessageSquare
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function BottomNav({ activePage, setActivePage }) {
  const { t, language } = useFarm();

  const navItems = [
    {
      id: 'overview',
      label: language === 'hindi' ? 'होम' : language === 'hinglish' ? 'Home' : 'Home',
      icon: Home,
    },
    {
      id: 'farms',
      label: language === 'hindi' ? 'खेत' : language === 'hinglish' ? 'Khet' : 'Fields',
      icon: Sprout,
    },
    {
      id: 'irrigation',
      altId: 'analysis',
      label: language === 'hindi' ? 'पानी' : language === 'hinglish' ? 'Paani' : 'Water',
      icon: Droplets,
    },
    {
      id: 'weather',
      label: language === 'hindi' ? 'मौसम' : language === 'hinglish' ? 'Mausam' : 'Weather',
      icon: CloudRain,
    },
    {
      id: 'advisor',
      label: language === 'hindi' ? 'सलाह' : language === 'hinglish' ? 'Salah' : 'AI Help',
      icon: MessageSquare,
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id || (item.altId && activePage === item.altId);
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActivePage(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="bottom-nav-icon-wrap">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}