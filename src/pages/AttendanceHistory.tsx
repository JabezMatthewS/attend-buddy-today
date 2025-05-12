
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { 
  generateMonthlyAttendance, 
  AttendanceRecord, 
  calculateAttendanceSummary, 
  DailyAttendanceSummary 
} from '@/utils/attendanceUtils';
import { CheckCircle, AlertCircle, Clock, Calendar, XCircle } from 'lucide-react';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<DailyAttendanceSummary | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      const records = generateMonthlyAttendance(user.id);
      setAttendanceRecords(records);
      const calculatedSummary = calculateAttendanceSummary(records);
      setSummary(calculatedSummary);
    }
  }, [user?.id]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Present
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Late
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Absent
          </Badge>
        );
      case 'weekend':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Weekend
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Attendance History" />
      
      <main className="container mx-auto px-4 py-6">
        {summary && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly Summary</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Working Days</p>
                  <p className="text-xl font-semibold">{summary.totalWorkingDays}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Present</p>
                  <p className="text-xl font-semibold text-green-600">{summary.presentDays}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Late</p>
                  <p className="text-xl font-semibold text-amber-600">{summary.lateDays}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Absent</p>
                  <p className="text-xl font-semibold text-red-600">{summary.absentDays}</p>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">Attendance Rate</p>
                  <p className="text-xl font-bold text-blue-600">{summary.attendanceRate}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${summary.attendanceRate}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Attendance</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {attendanceRecords.map((record, index) => (
                <div key={record.date}>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium">{formatDate(record.date)}</p>
                      {record.status !== 'weekend' && (
                        <div className="text-sm text-gray-500 mt-1">
                          {record.checkIn && (
                            <span>
                              {record.checkIn} - {record.checkOut || 'Not checked out'}
                            </span>
                          )}
                          {!record.checkIn && record.status === 'absent' && (
                            <span>No attendance recorded</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                  {index < attendanceRecords.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Navigation />
    </div>
  );
};

export default AttendanceHistory;
