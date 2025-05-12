
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Show loading screen while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-pulse-light">
          <h1 className="text-3xl font-bold text-primary mb-2">AttendanceTrack</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
