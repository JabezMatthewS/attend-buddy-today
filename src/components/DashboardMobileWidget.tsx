
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { 
  AttendanceRecord, 
  getTodayAttendance, 
  generateMonthlyAttendance,
  calculateAttendanceSummary
} from '@/utils/attendanceUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickStats {
  daysWorked: number;
  sickHolidays: number;
  personalLeaves: number;
  absentDays: number;
  totalDays: number;
}

// Generate quick stats for current month only
const generateCurrentMonthStats = (employeeId: string): QuickStats => {
  // Get the monthly attendance records
  const monthlyRecords = generateMonthlyAttendance(employeeId);
  
  // Calculate stats
  const summary = calculateAttendanceSummary(monthlyRecords);
  
  return {
    daysWorked: summary.presentDays,
    sickHolidays: Math.floor(summary.totalWorkingDays * 0.05), // Estimate
    personalLeaves: Math.floor(summary.totalWorkingDays * 0.1), // Estimate
    absentDays: summary.absentDays,
    totalDays: summary.totalWorkingDays
  };
};

const DashboardMobileWidget = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Load today's attendance
    if (user?.id) {
      const attendance = getTodayAttendance(user.id);
      setTodayAttendance(attendance);
      
      // Generate stats for current month
      const currentMonthStats = generateCurrentMonthStats(user.id);
      setQuickStats(currentMonthStats);
    }
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const renderAttendanceStatus = () => {
    if (!todayAttendance || todayAttendance.status === 'weekend') {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <Clock className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">No attendance recorded for today</p>
        </div>
      );
    }
    
    if (todayAttendance.status === 'absent') {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
          <p className="text-red-500 font-semibold">Marked as Absent</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-500">Status:</span>
          <div className="flex items-center">
            {todayAttendance.status === 'present' ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="font-medium text-green-600">Present</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                <span className="font-medium text-amber-600">Late</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
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
  
  if (!user || !quickStats) {
    return (
      <div className="p-3 rounded-lg shadow-sm bg-white">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${isMobile ? 'w-full' : 'max-w-sm'} mx-auto`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-primary text-white">
          <h3 className="text-lg font-medium">AttendanceTrack</h3>
          <p className="text-sm opacity-90">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        
        <div className="p-4">
          <h4 className="font-medium mb-2">Today's Attendance</h4>
          {renderAttendanceStatus()}
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">This Month Stats</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Days Worked</p>
                <p className="text-lg font-bold text-blue-600">{quickStats.daysWorked}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">SH</p>
                <p className="text-lg font-bold text-amber-600">{quickStats.sickHolidays}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">PL</p>
                <p className="text-lg font-bold text-purple-600">{quickStats.personalLeaves}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Absent</p>
                <p className="text-lg font-bold text-red-600">{quickStats.absentDays}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-green-600">{quickStats.totalDays}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMobileWidget;
