
import { Home, Map, Upload, Search, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const BottomTabBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return currentPath === '/' || currentPath === '/home';
    }
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className="flex flex-col items-center justify-center flex-1 py-1"
            >
              <Icon 
                className={`h-5 w-5 mb-1 ${
                  active ? 'text-blue-500' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-xs ${
                  active ? 'text-blue-500 font-medium' : 'text-muted-foreground'
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
