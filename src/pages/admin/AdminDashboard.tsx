import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/components/ui/use-toast";
import { Calendar } from 'lucide-react';

// Admin Dashboard component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0
  });
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  // Check admin authentication
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      toast({
        title: "Authentication Required",
        description: "Please login as admin to access this page",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    fetchDashboardStats();
  }, [navigate, activeTab]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // For now, let's work with mock data since our tables might not be fully set up
      // We'll pretend we have 10 employees total
      const employeeCount = 10;
      
      // Generate mock attendance stats
      const mockAttendanceStats = {
        presentToday: Math.floor(employeeCount * 0.7), // ~70% present
        lateToday: Math.floor(employeeCount * 0.1),    // ~10% late
        absentToday: Math.floor(employeeCount * 0.1),  // ~10% absent
        onLeaveToday: Math.floor(employeeCount * 0.1)  // ~10% on leave
      };

      setStats({
        totalEmployees: employeeCount,
        ...mockAttendanceStats
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin/employees')}>
              Employees
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/attendance')}>
              Attendance
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Attendance Overview</h2>
          <p className="text-gray-600">Monitor employee attendance statistics</p>
        </div>

        <Tabs defaultValue="today" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today">
            <Card>
              <CardHeader>
                <CardTitle>Today's Statistics</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-24 rounded-md bg-gray-200 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Late</p>
                      <p className="text-2xl font-bold text-amber-600">{stats.lateToday}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">On Leave</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.onLeaveToday}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{stats.absentToday}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/admin/attendance')}
                  >
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="month">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-24 rounded-md bg-gray-200 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Working Days</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.presentToday * 4}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Avg. Late</p>
                      <p className="text-2xl font-bold text-amber-600">{stats.lateToday * 4}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Total Leaves</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.onLeaveToday * 4}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{stats.absentToday * 4}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/admin/attendance')}
                  >
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Employee Overview</CardTitle>
            <CardDescription>Total employees: {stats.totalEmployees}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Departments</div>
                <div className="font-semibold mt-1">
                  <div className="flex justify-between">
                    <span>Engineering</span>
                    <span>1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing</span>
                    <span>1</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Recent Joiners</div>
                <div className="font-semibold mt-1">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Month</span>
                    <span>2</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Leave Balance</div>
                <div className="font-semibold mt-1">
                  <div className="flex justify-between">
                    <span>CL Remaining</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PL Remaining</span>
                    <span>5</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={() => navigate('/admin/employees')}>
                Manage Employees
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
