
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  profileImage: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: Employee | null;
  login: (employeeId: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock employee data for demonstration
const mockEmployees: Record<string, Employee> = {
  'K14050': {
    id: 'K14050',
    name: 'Jane Smith',
    department: 'Engineering',
    position: 'Senior Developer',
    profileImage: '/placeholder.svg',
  },
  'K14051': {
    id: 'K14051',
    name: 'John Doe',
    department: 'Marketing',
    position: 'Marketing Manager',
    profileImage: '/placeholder.svg',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Employee | null>(null);

  useEffect(() => {
    // Check for stored authentication on app load
    const storedUser = localStorage.getItem('attendanceApp_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('attendanceApp_user');
      }
    }
  }, []);

  const login = async (employeeId: string): Promise<boolean> => {
    // Validate employee ID format
    const idPattern = /^K\d{5}$/;
    if (!idPattern.test(employeeId)) {
      toast({
        title: "Invalid Format",
        description: "Employee ID must be in format K followed by 5 digits (e.g., K14050).",
        variant: "destructive"
      });
      return false;
    }

    // Check if employee ID exists in our mock data
    const employee = mockEmployees[employeeId];
    if (!employee) {
      toast({
        title: "Authentication Failed",
        description: "Employee ID not found.",
        variant: "destructive"
      });
      return false;
    }

    // Login successful
    setUser(employee);
    setIsAuthenticated(true);
    localStorage.setItem('attendanceApp_user', JSON.stringify(employee));
    
    toast({
      title: "Login Successful",
      description: `Welcome back, ${employee.name}!`,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('attendanceApp_user');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
