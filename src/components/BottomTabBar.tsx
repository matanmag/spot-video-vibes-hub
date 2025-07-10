
import { Home, TrendingUp, Plus, Map, User } from 'lucide-react';
import { useLocation, NavLink } from 'react-router-dom';

const BottomTabBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Trending', path: '/trending', icon: TrendingUp },
    { name: 'Add', path: '/upload', icon: Plus },
    { name: 'Map', path: '/map', icon: Map },
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
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center flex-1 py-1
                ${isActive ? 'text-turquoise' : 'text-muted-foreground'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    className={`h-5 w-5 mb-1 ${
                      isActive ? 'text-turquoise' : 'text-muted-foreground'
                    }`} 
                  />
                  <span 
                    className={`text-xs ${
                      isActive ? 'text-turquoise font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
