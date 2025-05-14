
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, subDays } from 'date-fns';
import { Clock, LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Date range state for quick stats
  const [fromDate, setFromDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  
  // Mock attendance data for today
  const todayAttendance = {
    status: 'Present',
    inTime: '09:15 AM',
    outTime: '06:30 PM',
  };
  
  // Mock stats data
  const quickStats = {
    daysWorked: 22,
    sickHolidays: 1,
    paidLeave: 2,
    absent: 0,
    total: 25,
  };
  
  const handleMarkAttendance = () => {
    toast({
      title: "Attendance Marked",
      description: "You've successfully checked in for today.",
    });
  };
  
  const handleCheckOut = () => {
    toast({
      title: "Checked Out",
      description: "You've successfully checked out for today.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => navigate('/attendance-history')}>
              History
            </Button>
            <Button variant="ghost" onClick={() => navigate('/leaves')}>
              Leaves
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">Welcome, {user?.name}</h2>
                <p className="text-gray-500">{user?.department} - {user?.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-semibold mt-1">
                  <Badge variant={todayAttendance.status === 'Present' ? 'default' : 'destructive'}>
                    {todayAttendance.status}
                  </Badge>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">In Time</div>
                <div className="font-semibold mt-1">{todayAttendance.inTime}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Out Time</div>
                <div className="font-semibold mt-1">{todayAttendance.outTime || '-'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button className="w-full" onClick={handleMarkAttendance}>
                <Clock className="w-4 h-4 mr-2" /> 
                Check In
              </Button>
              <Button className="w-full" variant="outline" onClick={handleCheckOut}>
                <Clock className="w-4 h-4 mr-2" /> 
                Check Out
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Summary for selected period</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      {fromDate ? format(fromDate, 'MMM d') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="self-center">-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      {toDate ? format(toDate, 'MMM d') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(date) => date < (fromDate || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50 rounded-md text-center">
                <div className="text-sm text-gray-500">Days Worked</div>
                <div className="font-bold text-xl text-blue-600 mt-1">{quickStats.daysWorked}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-md text-center">
                <div className="text-sm text-gray-500">SH</div>
                <div className="font-bold text-xl text-purple-600 mt-1">{quickStats.sickHolidays}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-md text-center">
                <div className="text-sm text-gray-500">PL</div>
                <div className="font-bold text-xl text-green-600 mt-1">{quickStats.paidLeave}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-md text-center">
                <div className="text-sm text-gray-500">Absent</div>
                <div className="font-bold text-xl text-red-600 mt-1">{quickStats.absent}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-bold text-xl text-gray-600 mt-1">{quickStats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
