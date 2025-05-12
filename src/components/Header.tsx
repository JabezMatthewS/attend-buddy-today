
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.profileImage} alt={user?.name} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="text-gray-500"
          >
            <LogOut className="h-4 w-4 mr-1" /> 
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
