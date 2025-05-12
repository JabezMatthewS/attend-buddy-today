
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Clock className="h-6 w-6" />
    },
    {
      name: 'History',
      path: '/attendance-history',
      icon: <Calendar className="h-6 w-6" />
    }
  ];
  
  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        {navItems.map(item => (
          <button
            key={item.name}
            className={cn(
              "flex flex-col items-center justify-center py-3 flex-1",
              location.pathname === item.path 
                ? "text-primary border-t-2 border-primary" 
                : "text-gray-500"
            )}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
