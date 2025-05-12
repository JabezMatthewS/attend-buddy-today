
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { formatTime, getTodayAttendance, AttendanceRecord } from '@/utils/attendanceUtils';

// Interface for quick stats
interface QuickStats {
  daysWorked: number;
  sickHolidays: number;
  personalLeaves: number;
  absentDays: number;
  totalDays: number;
}

// Generate mock stats for a date range
const generateQuickStats = (startDate: Date, endDate: Date): QuickStats => {
  // Mock calculation - in a real app this would fetch from an API
  const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const daysWorked = Math.floor(daysDiff * 0.7); // ~70% days worked
  const sickHolidays = Math.floor(daysDiff * 0.05); // ~5% sick holidays
  const personalLeaves = Math.floor(daysDiff * 0.1); // ~10% personal leaves
  const absentDays = Math.floor(daysDiff * 0.05); // ~5% absent days
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  
  // Date range state for quick stats
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); // First day of current month
  const [toDate, setToDate] = useState<Date | undefined>(new Date()); // Today
  
  const [quickStats, setQuickStats] = useState<QuickStats>(
    generateQuickStats(
      fromDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
      toDate || new Date()
    )
  );
  
  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Load today's attendance
    if (user?.id) {
      const attendance = getTodayAttendance(user.id);
      setTodayAttendance(attendance);
    }
    
    return () => clearInterval(interval);
  }, [user?.id]);
  
  // Update quick stats when date range changes
  useEffect(() => {
    if (fromDate && toDate) {
      setQuickStats(generateQuickStats(fromDate, toDate));
    } else if (fromDate) {
      setQuickStats(generateQuickStats(fromDate, new Date()));
    } else if (toDate) {
      setQuickStats(generateQuickStats(new Date(new Date().getFullYear(), new Date().getMonth(), 1), toDate));
    }
  }, [fromDate, toDate]);
  
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
  
  const resetFilters = () => {
    setFromDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); // First day of current month
    setToDate(new Date()); // Today
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Dashboard" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-800">Welcome, {user?.name}</h2>
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
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Summary for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">From Date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                        {fromDate ? format(fromDate, 'MMM d, yyyy') : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">To Date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                        {toDate ? format(toDate, 'MMM d, yyyy') : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        disabled={(date) => fromDate ? date < fromDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="ghost" 
                    onClick={resetFilters} 
                    className="h-10"
                    disabled={!fromDate && !toDate}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              
              <div className="mt-2">
                {fromDate && toDate ? (
                  <p className="text-sm text-muted-foreground">
                    Showing results from {format(fromDate, 'MMM d, yyyy')} to {format(toDate, 'MMM d, yyyy')}
                  </p>
                ) : fromDate ? (
                  <p className="text-sm text-muted-foreground">
                    Showing results from {format(fromDate, 'MMM d, yyyy')} onwards
                  </p>
                ) : toDate ? (
                  <p className="text-sm text-muted-foreground">
                    Showing results until {format(toDate, 'MMM d, yyyy')}
                  </p>
                ) : null}
              </div>
            </div>
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
      </main>
      
      <Navigation />
    </div>
  );
};

export default Dashboard;
