
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

export function useAdminAuth() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminUser = localStorage.getItem('adminUser');
      if (!adminUser) {
        toast({
          title: "Authentication Required",
          description: "Please login as admin to access this page",
          variant: "destructive"
        });
        navigate('/login');
      }
    };
    
    checkAdminAuth();
  }, [navigate]);
  
  const logout = () => {
    localStorage.removeItem('adminUser');
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };
  
  return { logout };
}
