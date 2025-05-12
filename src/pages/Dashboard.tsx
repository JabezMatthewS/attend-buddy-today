
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { formatTime, getTodayAttendance, AttendanceRecord } from '@/utils/attendanceUtils';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Mock data for quick stats
interface QuickStats {
  daysWorked: number;
  sickHolidays: number;
  personalLeaves: number;
  absentDays: number;
  totalDays: number;
}

// Generate mock stats
const generateQuickStats = (): QuickStats => {
  const daysWorked = 18;
  const sickHolidays = 1;
  const personalLeaves = 2;
  const absentDays = 1;
  const totalDays = daysWorked + sickHolidays + personalLeaves + absentDays;
  
  return {
    daysWorked,
    sickHolidays,
    personalLeaves,
    absentDays,
    totalDays
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkedOutToday, setCheckedOutToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickStats] = useState<QuickStats>(generateQuickStats());
  
  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Load today's attendance
    if (user?.id) {
      const attendance = getTodayAttendance(user.id);
      setTodayAttendance(attendance);
      setCheckedInToday(!!attendance?.checkIn);
      setCheckedOutToday(!!attendance?.checkOut);
    }
    
    return () => clearInterval(interval);
  }, [user?.id]);
  
  const handleCheckIn = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];
      
      // Check if it's late (after 9:00 AM)
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
      
      const newAttendance: AttendanceRecord = {
        date: todayDate,
        checkIn: formatTime(now),
        checkOut: null,
        status: isLate ? 'late' : 'present'
      };
      
      setTodayAttendance(newAttendance);
      setCheckedInToday(true);
      
      toast({
        title: "Check In Successful",
        description: `You checked in at ${formatTime(now)}${isLate ? ' (Late)' : ''}`,
      });
      
      setLoading(false);
    }, 1000);
  };
  
  const handleCheckOut = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const now = new Date();
      
      if (todayAttendance) {
        const updatedAttendance = {
          ...todayAttendance,
          checkOut: formatTime(now)
        };
        
        setTodayAttendance(updatedAttendance);
        setCheckedOutToday(true);
        
        toast({
          title: "Check Out Successful",
          description: `You checked out at ${formatTime(now)}`,
        });
      }
      
      setLoading(false);
    }, 1000);
  };
  
  const renderAttendanceStatus = () => {
    if (!todayAttendance || todayAttendance.status === 'weekend') {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <Clock className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-gray-500">No attendance recorded for today</p>
        </div>
      );
    }
    
    if (todayAttendance.status === 'absent') {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-16 w-16 text-red-500 mb-2" />
          <p className="text-red-500 font-semibold">Marked as Absent</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-gray-500">Status:</span>
          <div className="flex items-center">
            {todayAttendance.status === 'present' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                <span className="font-medium text-green-600">Present</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500 mr-1" />
                <span className="font-medium text-amber-600">Late</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-gray-500">Check In:</span>
          <span className="font-medium">{todayAttendance.checkIn || '–'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Check Out:</span>
          <span className="font-medium">{todayAttendance.checkOut || '–'}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Dashboard" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-800">Welcome, {user?.name}</h2>
          <p className="text-gray-500">{user?.department} • {user?.position}</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Attendance</CardTitle>
            <CardDescription>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderAttendanceStatus()}
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                onClick={handleCheckIn}
                disabled={checkedInToday || loading}
                className={checkedInToday ? "bg-gray-400" : "bg-primary"}
              >
                Check In
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!checkedInToday || checkedOutToday || loading}
                className={!checkedInToday || checkedOutToday ? "bg-gray-400" : "bg-primary"}
              >
                Check Out
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>This month's summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs">Days Worked</p>
                <p className="text-xl font-bold text-blue-600">{quickStats.daysWorked}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs">SH</p>
                <p className="text-xl font-bold text-amber-600">{quickStats.sickHolidays}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs">PL</p>
                <p className="text-xl font-bold text-purple-600">{quickStats.personalLeaves}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs">Absent</p>
                <p className="text-xl font-bold text-red-600">{quickStats.absentDays}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs">Total</p>
                <p className="text-xl font-bold text-green-600">{quickStats.totalDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="bg-primary/90 hover:bg-primary"
            onClick={() => navigate('/attendance-history')}
          >
            View History
          </Button>
          <Button 
            className="bg-primary/90 hover:bg-primary"
            onClick={() => navigate('/leaves')}
          >
            View Leaves
          </Button>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
};

export default Dashboard;
