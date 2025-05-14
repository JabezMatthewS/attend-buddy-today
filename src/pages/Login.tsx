
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  // Employee login state
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(employeeId);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    
    try {
      // For demo purposes, we'll check against the admin_users table directly
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', adminEmail)
        .single();
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: "Admin user not found",
          variant: "destructive"
        });
        return;
      }
      
      // In production, use proper password hashing comparison
      // This is just for demo
      if (data && data.password === adminPassword) {
        // Store admin login state
        localStorage.setItem('adminUser', JSON.stringify({
          id: data.id,
          email: data.email
        }));
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard",
        });
        
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Error",
        description: "An error occurred during admin login",
        variant: "destructive"
      });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white">
              <Clock className="h-10 w-10" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-primary">
            AttendanceTrack
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Employee attendance monitoring system
          </p>
        </div>

        <Tabs defaultValue="employee" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee">Employee</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employee">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Employee Sign in</CardTitle>
                <CardDescription>
                  Enter your employee ID to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      id="employeeId"
                      placeholder="Employee ID (e.g., K14050)"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      required
                      className="text-base py-6"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 py-6"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-gray-500">
                  Demo accounts: K14050, K14051
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Admin Sign in</CardTitle>
                <CardDescription>
                  Enter your admin credentials to access the admin dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      id="adminEmail"
                      type="email"
                      placeholder="Email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="text-base py-6"
                      autoComplete="email"
                      disabled={adminLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input 
                      id="adminPassword"
                      type="password"
                      placeholder="Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="text-base py-6"
                      autoComplete="current-password"
                      disabled={adminLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 py-6"
                    disabled={adminLoading}
                  >
                    {adminLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-gray-500">
                  Demo account: admin@company.com / admin123
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
