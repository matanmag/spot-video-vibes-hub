import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Map, User, Plus } from 'lucide-react';
import SearchButton from './SearchButton';

const NavIcon: React.FC<{ icon: React.ElementType; path: string }> = ({ icon: Icon, path }) => {
  const location = useLocation();
  const isActive = () => {
    if (path === '/home') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Link to={path} className={`p-2 rounded-full transition-colors ${isActive() ? "text-[#00e0ff]" : "text-white/60 hover:text-white"}`}>
      <Icon className="w-7 h-7" />
    </Link>
  );
};

const AppBottomNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-black/30 py-3 backdrop-blur-md border-t border-white/10 z-50">
            <NavIcon icon={Home} path="/home" />
            <NavIcon icon={TrendingUp} path="/trending" />
            <SearchButton />
            <Link to="/upload" className="bg-[#00e0ff] p-3 rounded-xl shadow-lg active:scale-95 transition-transform">
                <Plus className="w-6 h-6 text-[#071b2d]" />
            </Link>
            <NavIcon icon={Map} path="/map" />
            <NavIcon icon={User} path="/profile" />
        </nav>
    );
};

export default AppBottomNav;
